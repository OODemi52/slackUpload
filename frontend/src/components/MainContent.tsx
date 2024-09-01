import React, { useEffect, useState, useCallback, useContext } from "react";
import UploadGrid from "./UploadGrid";
import { Box, Flex, Text } from "@chakra-ui/react";
import AuthContext from "../context/AuthContext";

const MainContent: React.FC = () => {
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
      {/* Sidebar section */}
      <Box
        bg="#282828"
        boxShadow="0px 4px 4px rgba(0, 0, 0, 1)"
        flex="1"
        h="full"
        overflowY="auto"
      >
        {/* Sidebar content */}
      </Box>

      {/* Main Content section */}
      <Box
        bg="#181818"
        w="full"
        h="full"
        display="flex"
        flexDirection="column"
        boxShadow="inset 0 0 8px rgba(0, 0, 0, 0.6)"
        onScroll={handleScroll} // Attach scroll handler to the Box
      >
        {pics.length ? (
          <UploadGrid pics={pics} onScroll={handleScroll} />
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

      {/* Right Sidebar or Other Section */}
      <Box
        bg="#282828"
        flex="1"
        h="full"
        overflowY="auto"
      >
        {/* Right sidebar content */}
      </Box>
    </Flex>
  );
};

export default MainContent;