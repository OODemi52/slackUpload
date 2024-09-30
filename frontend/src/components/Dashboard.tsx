import React, { useState, useEffect, useCallback, useContext } from "react";
import { Grid, GridItem, Box, useToast,  useMediaQuery } from "@chakra-ui/react";
import Aside from "./Aside";
import Header from "./Header";
import MainContent from "./MainContent";
import AuthContext from "../context/AuthContext";
import { useDeleteImages } from "../hooks/useDeleteImages";


interface FormState {
  files: FileList | null;
  channel: string;
  uploadComment: string;
  messageBatchSize: number;
  sessionID: string;
}

const Dashboard: React.FC = () => {
  const deleteImagesMutation = useDeleteImages();
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
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
  useState(false);
  const [selectedImages, setSelectedImages] = useState<
    { url: string; fileID: string; deleteFlag: string; name: string }[]
  >([]);
  const [pics, setPics] = useState<
    { url: string; name: string; fileID: string }[]
  >([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { accessToken } = useContext(AuthContext);

  const toast = useToast();

  const handleFormStateChange = useCallback((newState: Partial<FormState>) => {
    setFormState((prevState) => ({ ...prevState, ...newState }));
  }, []);

  const handleUploadComplete = useCallback(() => {
    setStartUpload(false);
    setIsUploading(false);
    setUploadComplete(false);
    setUploadAttempted(false);

    toast({
      title: "Upload Complete",
      description: "Your files have been uploaded successfully.",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "top",
    });
  }, [toast]);

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

  const fetchUrls = useCallback(
    async (pageNum: number, limit: number = 16) => {
      if (isLoading) return;
      setIsLoading(true);
      try {
          const response = await fetch(
            `${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/getImagesUrls?page=${pageNum}&limit=${limit}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const imageUrls: { url: string; name: string; fileID: string }[] = await response.json();
  
        setPics((prevPics) => {
          const newPics = [...prevPics, ...imageUrls];
          const uniquePics = newPics.filter(
            (pic, index, self) =>
              index === self.findIndex((t) => t.fileID === pic.fileID)
          );
          return uniquePics;
        });
  
        if (imageUrls.length < limit) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching pics:", error);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessToken]
  );

useEffect(() => {
  if (uploadComplete) {
    const timer = setTimeout(() => {
      handleUploadComplete();
      setPics([]);
      setPage(1);
      fetchUrls(1);
    }, 500);

    return () => clearTimeout(timer);
  }
}, [uploadComplete, handleUploadComplete, fetchUrls]);

useEffect(() => {
  if (accessToken && page === 1) {
    fetchUrls(page);
  }
}, [accessToken, fetchUrls, page]);

const handleLoadMore = useCallback(() => {
  if (hasMore && !isLoading) {
    setPage((prevPage) => prevPage + 1);
  }
}, [hasMore, isLoading]);

useEffect(() => {
  if (page > 1) {
    fetchUrls(page);
  }
}, [page, fetchUrls]);

const refreshImages = useCallback(() => {
  setPics([]);
  setPage(1);
  setHasMore(true);
  fetchUrls(1);
}, [fetchUrls]);


  const handleConfirmDelete = async (deleteFlag: "a" | "b") => {
    
    const filesToDelete = selectedImages.map((image) => ({
      id: image.fileID,
      deleteFlag: deleteFlag,
    }));

    try {
      const result = await deleteImagesMutation.mutateAsync(filesToDelete);

      refreshImages();

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
        description: "There was an error deleting the selected images.",
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
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
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

export default Dashboard;
