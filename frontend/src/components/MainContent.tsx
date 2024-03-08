import React, { useEffect, useState, useCallback } from "react";
import UploadGrid from "./UploadGrid";
import { Grid, GridItem } from "@chakra-ui/react";

const MainContent: React.FC = () => {
  const [pics, setPics] = useState<{ url: string; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchUrls = useCallback(
    async (userId: string, page: number, limit: number = 16) => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/getImagesUrls?userID=${userId}&page=${page}&limit=${limit}`,
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
    [],
  );

  useEffect(() => {
    fetchUrls("0001", page);
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
        <UploadGrid pics={pics} onScroll={handleScroll} />
      </GridItem>
    </Grid>
  );
};

export default MainContent;
