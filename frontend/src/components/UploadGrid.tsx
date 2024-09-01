import React, { useState, useRef } from "react";
import { Grid, Box, AlertDialog, AlertDialogContent, Image } from "@chakra-ui/react";
import ImageCard from "./ImageCard";

// Define the type for the image properties used in ImageCard and selectedImage
interface ImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface UploadGridProps {
  pics: { url: string; name: string }[];
  onScroll: (event: React.UIEvent<HTMLElement>) => void;
}

const UploadGrid: React.FC<UploadGridProps> = ({ pics, onScroll }) => {
  const [selectedImage, setSelectedImage] = useState<ImageProps | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const onClose = () => setIsOpen(false);

  const handleImageClick = (image: ImageProps) => {
    setSelectedImage(image);
    setIsOpen(true);
  };

  return (
    <Box maxH="900px" overflowY="scroll" onScroll={onScroll}>
      <Grid
        templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }}
        gap={6}
        p={4}
      >
        {pics.map((pic, index) => (
          <ImageCard
            key={index}
            url={pic.url}
            name={pic.name}
            onClick={() => handleImageClick({ src: pic.url, alt: pic.name, width: 300, height: 300 })}
          />
        ))}
      </Grid>

      {selectedImage && (
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogContent>
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              width={selectedImage.width * 3}
              height={selectedImage.height * 3}
              style={{ transform: "translate3d(0, 0, 0)" }}
              className="rounded-lg shadow-lg transition-opacity duration-500 ease-in-out"
              loading="eager"
            />
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Box>
  );
};

export default UploadGrid;