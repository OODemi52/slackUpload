import React, { useEffect, useCallback } from "react";
import UploadGrid from "./UploadGrid";
import { Box, Flex, Text } from "@chakra-ui/react";
import LogoAnimation from "./LogoAnimation";

interface MainContentProps {
  formState: {
    files: FileList | null;
    channel: string;
    uploadComment: string;
    messageBatchSize: number;
    sessionID: string;
  };
  isUploading: boolean;
  startUpload: boolean;
  uploadComplete: boolean;
  onUploadFail: () => void;
  uploadAttempted: boolean;
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
  onConfirmDelete: (deleteFlag: "slack" | "app" | "both") => void;
  pics: { url: string; name: string; fileID: string }[];
  hasMore: boolean;
  onLoadMore: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  isUploading,
  uploadComplete,
  startUpload,
  onUploadFail,
  uploadAttempted,
  isSelectMode,
  setIsSelectMode,
  selectedImages,
  setSelectedImages,
  isDeleteConfirmationOpen,
  setIsDeleteConfirmationOpen,
  onConfirmDelete,
  pics,
  hasMore,
  onLoadMore,
}) => {

  useEffect(() => {
    if (uploadAttempted && !uploadComplete && !isUploading && !startUpload) {
      onUploadFail();
    }
  }, [uploadAttempted, uploadComplete, isUploading, startUpload, onUploadFail]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      const { target } = event;
      if (
        (target as HTMLElement).scrollHeight -
          (target as HTMLElement).scrollTop ===
          (target as HTMLElement).clientHeight &&
        hasMore
      ) {
        onLoadMore();
      }
    },
    [hasMore, onLoadMore]
  );

  return (
    <Flex h="full">
      <Box
        bg="#181818"
        w="full"
        h="full"
        display="flex"
        flexDirection="column"
        boxShadow="inset 0 0 8px rgba(0, 0, 0, 0.6)"
        onScroll={handleScroll}
      >
        {isUploading ? (
          <Text
            color="#404040"
            fontSize="xxx-large"
            textAlign="center"
            mt="auto"
            mb="auto"
          >
            <LogoAnimation />
          </Text>
        ) : pics.length ? (
          <UploadGrid
            pics={pics}
            onScroll={handleScroll}
            isSelectMode={isSelectMode}
            setIsSelectMode={setIsSelectMode}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            isDeleteConfirmationOpen={isDeleteConfirmationOpen}
            setIsDeleteConfirmationOpen={setIsDeleteConfirmationOpen}
            onConfirmDelete={onConfirmDelete}
          />
        ) : (
          <Text
            color="#404040"
            fontSize="xxx-large"
            textAlign="center"
            mt="auto"
            mb="auto"
          >
            Upload Images To Get Started!
          </Text>
        )}
      </Box>
    </Flex>
  );
};

export default MainContent;