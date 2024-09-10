import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Grid,
  Box,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  Image,
} from "@chakra-ui/react";
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
  onUploadComplete?: () => void;
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
}

const UploadGrid: React.FC<UploadGridProps> = ({
  pics,
  onScroll,
  onUploadComplete,
  isSelectMode,
  setIsSelectMode,
  selectedImages,
  setSelectedImages,
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageProps | null>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { accessToken } = useContext(AuthContext);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const onImageClose = () => setIsImageOpen(false);


  const handleImageClick = async (image: { url: string; name: string }) => {

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
  };

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

  const handleImageSelect = (fileID: string, url: string, name: string) => {
    setSelectedImages((prev) =>
      prev.some((item) => item.fileID === fileID)
        ? prev.filter((item) => item.fileID !== fileID)
        : [...prev, { fileID, url, name, deleteFlag: "both" }]
    );
  };

  const handleConfirmDelete = (deleteFrom: "slack" | "app" | "both") => {
    const updatedSelectedImages = selectedImages.map((img) => ({
      ...img,
      deleteFlag: deleteFrom,
    }));

    // Implement delete API call
    console.log(`Deleting ${updatedSelectedImages.length} images`);
    console.log("Images to delete:", updatedSelectedImages);

    setIsDeleteConfirmationOpen(false);
    setSelectedImages([]);
    setIsSelectMode(false);
    // Add deletion success toast here
    // Refresh UI to load images without deleted ones
  };

  const handleSingleDelete = (fileID: string, url: string, name: string) => {
    setSelectedImages([{ fileID, url, deleteFlag: "both", name }]);
    setIsDeleteConfirmationOpen(true);
  };

  const handleMenuToggle = (fileID: string | null) => {
    setOpenMenuId((prevId) => (prevId === fileID ? null : fileID));
  };

  useEffect(() => {
    if (onUploadComplete) {
      onUploadComplete();
    }
  }, [pics, onUploadComplete]);

  return (
    <Box maxH="900px" overflowY="scroll" onScroll={onScroll}>
      <Grid
        templateColumns={{
          base: "repeat(2, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={4}
        p={4}
      >
        {pics.map((pic) => (
          <ImageCard
            key={pic.fileID}
            {...pic}
            onClick={() => handleImageClick(pic)}
            onDelete={handleSingleDelete}
            isSelectMode={isSelectMode}
            isSelected={selectedImages.some(
              (item) => item.fileID === pic.fileID
            )}
            onSelect={() => handleImageSelect(pic.fileID, pic.url, pic.name)}
            openMenuId={openMenuId}
            handleMenuToggle={handleMenuToggle}
          />
        ))}
      </Grid>

      {selectedImage && (
        <AlertDialog
          isOpen={isImageOpen}
          leastDestructiveRef={cancelRef}
          onClose={onImageClose}
          size="full"
        >
          <AlertDialogOverlay>
            <AlertDialogContent
              bg="transparent"
              boxShadow="none"
              maxW="100vw"
              maxH="100vh"
            >
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
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      )}

      <DeletionConfirmation
        isOpen={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={`${selectedImages.length} file${selectedImages.length !== 1 ? "s" : ""}`}
      />
    </Box>
  );
};

export default UploadGrid;
