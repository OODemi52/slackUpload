import React, { useState, useEffect, useRef, useContext } from "react";
import { Grid, Box, AlertDialog, AlertDialogOverlay, AlertDialogContent, Image } from "@chakra-ui/react";
import ImageCard from "./ImageCard";
import AuthContext from '../context/AuthContext';

interface ImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface UploadGridProps {
  pics: { url: string; name: string }[];
  onScroll: (event: React.UIEvent<HTMLElement>) => void;
  onUploadComplete?: () => void;
}

const UploadGrid: React.FC<UploadGridProps> = ({ pics, onScroll, onUploadComplete }) => {
  const [selectedImage, setSelectedImage] = useState<ImageProps | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { accessToken } = useContext(AuthContext);

  const onClose = () => setIsOpen(false);

  const handleImageClick = async (image: { url: string; name: string }) => {
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
      setIsOpen(true);
    } catch (error) {
      console.error('Error fetching full-size image:', error);
    }
  };

  const calculateImageDimensions = (naturalWidth: number, naturalHeight: number) => {
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

  useEffect(() => {
    if (onUploadComplete) {
      onUploadComplete();
    }
  }, [pics, onUploadComplete]);

  return (
    <Box maxH="900px" overflowY="scroll" onScroll={onScroll}>
      <Grid
        templateColumns={{ base: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }}
        gap={4}
        p={4}
      >
        {pics.map((pic, index) => (
          <ImageCard
            key={index}
            url={pic.url}
            name={pic.name}
            onClick={() => handleImageClick(pic)}
          />
        ))}
      </Grid>

      {selectedImage && (
        <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        size="full"
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="transparent" boxShadow="none" maxW="100vw" maxH="100vh">
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
    </Box>
  );
};

export default UploadGrid;