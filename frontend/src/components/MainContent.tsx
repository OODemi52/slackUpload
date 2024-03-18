import React, { useEffect, useState, useCallback, useContext } from "react";
import UploadGrid from "./UploadGrid";
import { AbsoluteCenter, Grid, GridItem, Text } from "@chakra-ui/react";
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
    [accessToken],
  );

  useEffect(() => {
    fetchUrls(page);
  }, [page, fetchUrls]);

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
    [hasMore],
  );

  return (
    <Grid templateRows="1fr 9fr" gap={0} w="full" h="full">
      <GridItem
        bg="#282828"
        boxShadow="0px 4px 4px rgba(0, 0, 0, 1)"
        position="relative"
        zIndex={1}
      >
        {/* Will implement InfoBar component later */}
      </GridItem>
      <GridItem
        overflowY="scroll"
        bg="#181818"
        display="flex"
        flexDirection="column"
        height="full"
        boxShadow="inset 0 0 8px rgba(0, 0, 0, 0.6)"
      >
        {pics.length ? (
          <UploadGrid pics={pics} onScroll={handleScroll} />
        ) : (
          <AbsoluteCenter color="#404040"><Text fontSize="xxx-large" textAlign="center">Upload Images To Get Started!</Text></AbsoluteCenter>
        )}
      </GridItem>
    </Grid>
  );
};

export default MainContent;
