import React, { useEffect, useState, useCallback, useContext } from "react";
import UploadGrid from "./UploadGrid";
import { Box, Flex, Text } from "@chakra-ui/react";
import AuthContext from "../context/AuthContext";
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
  onUploadComplete: () => void;
  onUploadFail: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ isUploading, uploadComplete, startUpload, onUploadComplete, onUploadFail }) => {
  const [pics, setPics] = useState<{ url: string; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { accessToken } = useContext(AuthContext);

  const fetchUrls = useCallback(
    async (page: number, limit: number = 16) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/getImagesUrls?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const imageUrls = await response.json();

        setPics((prevPics) => [...prevPics, ...imageUrls]);

        if (imageUrls.length < limit) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching pics:", error);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    if (accessToken) {
      fetchUrls(page);
    }
  }, [page, fetchUrls, accessToken]);

  useEffect(() => {
    if (uploadComplete) {
      const timer = setTimeout(() => {
        onUploadComplete();
        setPics([]);
        setPage(1);
        fetchUrls(1);
      }, 500);
  
      return () => clearTimeout(timer);
    }
  }, [uploadComplete, onUploadComplete, fetchUrls]);
  
  useEffect(() => {
    if (!uploadComplete && isUploading === false && startUpload === false) {
      onUploadFail();
    }
  }, [uploadComplete, isUploading, startUpload, onUploadFail]);


  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      const { target } = event;
      if (
        (target as HTMLElement).scrollHeight -
          (target as HTMLElement).scrollTop ===
          (target as HTMLElement).clientHeight &&
        hasMore
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    },
    [hasMore]
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
          <Text color="#404040" fontSize="xxx-large" textAlign="center" mt="auto" mb="auto">
            <LogoAnimation />
          </Text>
        ) : pics.length ? (
          <UploadGrid pics={pics} onScroll={handleScroll} />
        ) : (
          <Text color="#404040" fontSize="xxx-large" textAlign="center" mt="auto" mb="auto">
            Upload Images To Get Started!
          </Text>
        )}
      </Box>
    </Flex>
  );
};

export default MainContent;