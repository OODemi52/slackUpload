import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalBody, Box, Grid, Image, useOutsideClick, AspectRatio, SlideFade  } from "@chakra-ui/react";
import ImageCard from "./ImageCard";
import AuthContext from "../context/AuthContext";
import DeletionConfirmation from "./DeletionConfirmation";

interface ImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface UploadGridProps {
  pics: { url: string; name: string; fileID: string }[];
  onScroll: (event: React.UIEvent<HTMLElement>) => void;
  isSelectMode: boolean;
  setIsSelectMode: React.Dispatch<React.SetStateAction<boolean>>;
  selectedImages: {
    url: string;
    fileID: string;
    deleteFlag: string;
    name: string;
  }[];
  setSelectedImages: React.Dispatch<
    React.SetStateAction<
      { url: string; fileID: string; deleteFlag: string; name: string }[]
    >
  >;
  isDeleteConfirmationOpen: boolean;
  setIsDeleteConfirmationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirmDelete: (deleteFlag: "a" | "b") => void;
  gridSize: 'sm' | 'md' | 'lg';
  setImagesPerPage: React.Dispatch<React.SetStateAction<number|null>>;
}

const UploadGrid: React.FC<UploadGridProps> = ({
  pics,
  onScroll,
  isSelectMode,
  //setIsSelectMode,
  selectedImages,
  setSelectedImages,
  isDeleteConfirmationOpen,
  setIsDeleteConfirmationOpen,
  onConfirmDelete,
    gridSize,
    setImagesPerPage,
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageProps | null>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { accessToken } = useContext(AuthContext);
  const [isImageOpen, setIsImageOpen] = useState(false);

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const onImageClose = () => setIsImageOpen(false);

  useOutsideClick({
    ref: modalContentRef,
    handler: onImageClose,
  });

  const getCurrentBreakpoint = () => {
    const breakpoints = {
      base: 0,
      sm: 480,
      md: 768,
      lg: 992,
      xl: 1280
    };

    let currentBreakpoint: keyof typeof breakpoints = 'base';
    const windowWidth = window.innerWidth;

    for (const [breakpoint, width] of Object.entries(breakpoints).sort((a, b) => a[1] - b[1])) {
      if (windowWidth >= width) {
        currentBreakpoint = breakpoint as keyof typeof breakpoints;
      }
    }

    return currentBreakpoint;
  };

  const calculateVisibleImages = useCallback(() => {
    if (!gridContainerRef.current) return;

    const container = gridContainerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const currentBreakpoint = getCurrentBreakpoint();
    const columns = GRID_CONFIGS[gridSize].minColumns[currentBreakpoint];

    const gap = 1.6 * 16;
    const availableWidth = containerWidth - (gap * (columns - 1));
    const imageWidth = Math.floor(availableWidth / columns);

    const availableHeight = containerHeight - (gap * 2);
    const rowHeight = imageWidth;
    const rows = Math.ceil(availableHeight / (rowHeight + gap));

    const visibleImages = columns * rows;

    setImagesPerPage(Math.max(visibleImages, 4))

    return imageWidth;
  }, [gridSize]);

  useLayoutEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        calculateVisibleImages();
      }, 150);
    });

    if (gridContainerRef.current) {
      observer.observe(gridContainerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [calculateVisibleImages]);

  useEffect(() => {
    calculateVisibleImages();
  }, [gridSize, calculateVisibleImages]);

  const handleImageClick = useCallback( async (image: { url: string; name: string }) => {

    if (isSelectMode) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/getImagesProxy?imageUrl=${encodeURIComponent(image.url)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setSelectedImage({ src: imageUrl, alt: image.name, width: 300, height: 300 });
      setIsImageOpen(true);
    } catch (error) {
      console.error('Error fetching full-size image:', error);
    }
  }, [accessToken, isSelectMode]);

  const calculateImageDimensions = (
    naturalWidth: number,
    naturalHeight: number
  ) => {
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;
    let width = naturalWidth;
    let height = naturalHeight;

    if (width > maxWidth) {
      height = (maxWidth / width) * height;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (maxHeight / height) * width;
      height = maxHeight;
    }

    setImageDimensions({ width, height });
  };

  const handleImageSelect = useCallback((fileID: string, url: string, name: string) => {
    setSelectedImages((prev) =>
      prev.some((item) => item.fileID === fileID)
        ? prev.filter((item) => item.fileID !== fileID)
        : [...prev, { fileID, url, name, deleteFlag: "both" }]
    );
  }, [selectedImages]);

  const handleSingleDelete = useCallback((fileID: string, url: string, name: string) => {
    setSelectedImages([{ fileID, url, name, deleteFlag: "both" }]);
    setIsDeleteConfirmationOpen(true);
  }, [setSelectedImages, setIsDeleteConfirmationOpen]);

  const handleMenuToggle = useCallback((fileID: string | null) => {
    setOpenMenuId((prevId) => (prevId === fileID ? null : fileID));
  }, []);

  const handleSelectAllByKeyDown = useCallback((event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
    event.preventDefault();
    if (isSelectMode) {
      if (selectedImages.length === pics.length) {
        setSelectedImages([]);
      } else {
        setSelectedImages(pics.map(pic => ({ ...pic, deleteFlag: "both" })));
      }
    }
  } else if (event.key === 'Escape') {
    setSelectedImages([]);
  }
}, [isSelectMode, pics, selectedImages.length, setSelectedImages]);

useEffect(() => {
  document.addEventListener('keydown', handleSelectAllByKeyDown);
  return () => {
    document.removeEventListener('keydown', handleSelectAllByKeyDown);
  };
}, [handleSelectAllByKeyDown]);

  const GRID_CONFIGS = {
    sm: {
      minColumns: { base: 6, sm: 8, md: 10, lg: 12, xl: 16 },
    },
    md: {
      minColumns: { base: 3, sm: 4, md: 5, lg: 6, xl: 8 },
    },
    lg: {
      minColumns: { base: 2, sm: 2, md: 3, lg: 3, xl: 4 },
    }
  } as const;

  return (
    <Box
        ref={gridContainerRef}
        h="100%"
        overflowY="scroll"
        onScroll={onScroll}
        p={4}
        transition= "all 1s ease-in-out;"
    >
      <Grid
          templateColumns={{
            base: `repeat(${GRID_CONFIGS[gridSize].minColumns.base}, 1fr)`,
            sm: `repeat(${GRID_CONFIGS[gridSize].minColumns.sm}, 1fr)`,
            md: `repeat(${GRID_CONFIGS[gridSize].minColumns.md}, 1fr)`,
            lg: `repeat(${GRID_CONFIGS[gridSize].minColumns.lg}, 1fr)`,
            xl: `repeat(${GRID_CONFIGS[gridSize].minColumns.xl}, 1fr)`
          }}
          gap={1.6}
          mx="auto"
          justifyContent="center"
          sx={{
            transition: 'grid-template-columns 0.3s ease-in-out',
            '& > div': {
              transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out'
            }
          }}
      >
        {pics.map((pic, index) => (
            <SlideFade
                key={pic.fileID}
                in={true}
                offsetY="20px"
                transition={{
                  enter: {
                    duration: 0.3,
                    delay: index * 0.05
                  }
                }}
            >
              <AspectRatio ratio={1}>
                <ImageCard
                    {...pic}
                    onClick={() => handleImageClick(pic)}
                    onDelete={handleSingleDelete}
                    isSelectMode={isSelectMode}
                    isSelected={selectedImages.some(item => item.fileID === pic.fileID)}
                    onSelect={() => handleImageSelect(pic.fileID, pic.url, pic.name)}
                    openMenuId={openMenuId}
                    handleMenuToggle={handleMenuToggle}
                    calculateVisibleImages={calculateVisibleImages}
                />
              </AspectRatio>
            </SlideFade>
        ))}
      </Grid>

      {selectedImage && (
        <Modal
          isOpen={isImageOpen}
          onClose={onImageClose}
          size="full"
          closeOnOverlayClick
        >
          <ModalOverlay>
            <ModalContent
                ref={modalContentRef}
              bg="transparent"
              boxShadow="none"
            >
              <ModalBody display="flex" justifyContent="center" alignItems="center">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                width={`${imageDimensions.width}px`}
                height={`${imageDimensions.height}px`}
                objectFit="contain"
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  calculateImageDimensions(img.naturalWidth, img.naturalHeight);
                }}
                display="block"
                margin="auto"
                className="rounded-lg shadow-lg transition-opacity duration-500 ease-in-out"
                loading="eager"
              />
                </ModalBody>
            </ModalContent>
          </ModalOverlay>
        </Modal>
      )}

      <DeletionConfirmation
        isOpen={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
        onConfirm={onConfirmDelete}
        itemName={`${selectedImages.length} file${selectedImages.length !== 1 ? "s" : ""}`}
      />
    </Box>
  );
};

export default UploadGrid;
