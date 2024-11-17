import React, { useState, useEffect, useCallback } from "react";
import { Grid, GridItem, Box, useToast,  useMediaQuery } from "@chakra-ui/react";
import Aside from "./Aside";
import Header from "./Header";
import MainContent from "./MainContent";
import { useDeleteImages } from "../hooks/useDeleteImages";
import { useImageUrls } from "../hooks/useImageUrls";

interface FormState {
  files: FileList | null;
  channel: string;
  uploadComment: string;
  messageBatchSize: number;
  sessionID: string;
}

interface SelectedImage {
  url: string;
  fileID: string;
  deleteFlag: string;
  name: string;
}

const Dashboard: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    files: null,
    channel: "",
    messageBatchSize: 10,
    uploadComment: "",
    sessionID: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [startUpload, setStartUpload] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadAttempted, setUploadAttempted] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [gridSize, setGridSize] = useState<'sm' | 'md' | 'lg'>('lg');
  const [imagesPerPage, setImagesPerPage] =  useState<number | null>(null);

  const toast = useToast();
  const { data: imageUrls, fetchNextPage, hasNextPage, isLoading: isImageUrlsLoading } = useImageUrls(imagesPerPage);
  const deleteImagesMutation = useDeleteImages();

  const pics = imageUrls ? imageUrls.pages.flatMap(page => page.imageUrls) : [];

  useEffect(() => {
    const savedGridSize = localStorage.getItem('gridSize');
    if (savedGridSize) {
      setGridSize(savedGridSize as 'sm' | 'md' | 'lg');
    }
  }, []);

  const handleGridSizeChange = (size: 'sm' | 'md' | 'lg') => {
    setGridSize(size);
    localStorage.setItem('gridSize', size);
  };

  const handleFormStateChange = useCallback((newState: Partial<FormState>) => {
    setFormState((prevState) => ({ ...prevState, ...newState }));
  }, []);

  const handleUploadFail = useCallback(() => {
    setStartUpload(false);
    setIsUploading(false);
    setUploadComplete(false);
    setUploadAttempted(false);

    toast({
      title: "Upload Failed",
      description: "There was an issue uploading your files.",
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "top",
    });
  }, [toast]);

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedImages([]);
  };

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isImageUrlsLoading) {
      void fetchNextPage();
    }
  }, [hasNextPage, isImageUrlsLoading, fetchNextPage]);

  const handleConfirmDelete = async (deleteFlag: "a" | "b") => {
    try {
      const filesToDelete = selectedImages.map((image) => ({
        id: image.fileID,
        deleteFlag: deleteFlag,
      }));
  
      const result = await deleteImagesMutation.mutateAsync(filesToDelete);
  
      toast({
        title: "Delete Complete",
        description: result.message,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: !isLargerThan768 ? "bottom" : "top",
      });
  
      setIsDeleteConfirmationOpen(false);
      setSelectedImages([]);
      setIsSelectMode(false);
  
    } catch (error) {
      console.error("Error deleting files:", error);
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: !isLargerThan768 ? "bottom" : "top",
      });
    }
  };

  return (
    <Box justifyContent="center" minW="100vw" w="100vw" maxH="100vh" h="95%">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        w="100%"
        minH="100vh"
        boxShadow="0px 0px 10px rgba(0, 0, 0, 0.5)"
        bg="#080808"
        py={5}
      >
        <Grid
          templateAreas={`
            "header header"
            "main main"
            "aside aside"
          `}
          gridTemplateRows={"50px 1fr auto"}
          gridTemplateColumns={"1fr"}
          height={{ base: "auto", md: "95vh" }}
          width="95vw"
          borderRadius={10}
          border="4px solid #282828"
        >
          {/* Header */}
          <GridItem gridArea="header" bg="#282828" mb="1px">
            <Header
              onToggleSelectMode={toggleSelectMode}
              isSelectMode={isSelectMode}
              selectedImages={selectedImages}
              setIsSelectMode={setIsSelectMode}
              isDeleteConfirmationOpen={isDeleteConfirmationOpen}
              setIsDeleteConfirmationOpen={setIsDeleteConfirmationOpen}
              onConfirmDelete={handleConfirmDelete}
              gridSize={gridSize}
              setGridSize={handleGridSizeChange}
            />
          </GridItem>

          {/* Main Content */}
          <GridItem
            gridArea="main"
            bg="#282828"
            overflowY="auto"
            boxShadow="inset 0 0 8px rgba(0, 0, 0, 0.6)"
            minH={{ base: "65vh", md: "auto" }}
          >
            <MainContent
              formState={formState}
              isUploading={isUploading}
              startUpload={startUpload}
              uploadComplete={uploadComplete}
              onUploadFail={handleUploadFail}
              uploadAttempted={uploadAttempted}
              setIsSelectMode={setIsSelectMode}
              isSelectMode={isSelectMode}
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              isDeleteConfirmationOpen={isDeleteConfirmationOpen}
              setIsDeleteConfirmationOpen={setIsDeleteConfirmationOpen}
              onConfirmDelete={handleConfirmDelete}
              pics={pics}
              hasMore={hasNextPage}
              onLoadMore={handleLoadMore}
                gridSize={gridSize}
              setImagesPerPage={setImagesPerPage}
            />
          </GridItem>

          {/* Aside */}
          <GridItem
            gridArea="aside"
            bg="#282828"
            w="100%"
            h="auto"
            justifyContent="center"
            boxShadow="0 0 -20px rgba(0, 0, 0, 0.6)"
          >
            <Aside
              formState={formState}
              setFormState={handleFormStateChange}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              startUpload={startUpload}
              setStartUpload={setStartUpload}
              setUploadComplete={setUploadComplete}
              setUploadAttempted={setUploadAttempted}
            />
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
};

export default React.memo(Dashboard);
