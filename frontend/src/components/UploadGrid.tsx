import React, { useState, useEffect, useRef, useCallback } from "react";
import { Grid, Box, AlertDialog, AlertDialogContent, Image, useToast, Progress } from "@chakra-ui/react";
import ImageCard from "./ImageCard";
import LogoAnimation from "./LogoAnimation";

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
  const [isOpen, setIsOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState(0);
  const [isFirstPageLoaded, setIsFirstPageLoaded] = useState(false);
  const [isFullImageLoading, setIsFullImageLoading] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const onClose = () => setIsOpen(false);

  const handleImageClick = (image: { url: string; name: string }) => {
    setSelectedImage({ src: image.url, alt: image.name, width: 300, height: 300 });
    setIsOpen(true);
    setIsFullImageLoading(true);
  };

  const handleImageLoad = useCallback(() => {
    setLoadedImages((prev) => {
      const newCount = prev + 1;
      if (newCount === Math.min(16, pics.length) && !isFirstPageLoaded) {
        setIsFirstPageLoaded(true);
        if (onUploadComplete) {
          onUploadComplete();
          toast({
            title: "Upload Complete",
            description: "Your files have been uploaded successfully.",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        }
      }
      return newCount;
    });
  }, [pics.length, isFirstPageLoaded, onUploadComplete, toast]);

  useEffect(() => {
    setLoadedImages(0);
    setIsFirstPageLoaded(false);
  }, [pics]);

  const loadingProgress = (loadedImages / Math.min(16, pics.length)) * 100;

  return (
    <Box maxH="900px" overflowY="scroll" onScroll={onScroll}>
      {!isFirstPageLoaded && (
        <>
          <LogoAnimation />
          <Progress value={loadingProgress} size="sm" colorScheme="blue" />
        </>
      )}
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
            onLoad={handleImageLoad}
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
            {isFullImageLoading && (
              <Box display="flex" justifyContent="center" alignItems="center" height="30px">
                <LogoAnimation />
              </Box>
            )}
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              width="auto"
              height="auto"
              style={{ maxWidth: "100%", maxHeight: "100%", transform: "translate3d(0, 0, 0)" }}
              className="rounded-lg shadow-lg transition-opacity duration-500 ease-in-out"
              onLoad={() => setIsFullImageLoading(false)}
              display={isFullImageLoading ? "none" : "block"}
            />
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Box>
  );
};

export default UploadGrid;