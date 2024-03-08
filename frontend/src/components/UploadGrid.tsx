import React from "react";
import { Grid, Box } from "@chakra-ui/react";
import ImageCard from "./ImageCard";

interface UploadGridProps {
  pics: { url: string; name: string }[]
  onScroll: (event: React.UIEvent<HTMLElement>) => void;
}

const UploadGrid: React.FC<UploadGridProps> = ({ pics, onScroll }) => {
  const rows = Math.ceil(pics.length / 4);

  return (
    <Box maxH="900px" overflowY="scroll" onScroll={onScroll}>
      <Grid templateColumns={`repeat(4, 1fr)`} gap={6} p={4}>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {pics
              .slice(rowIndex * 4, (rowIndex + 1) * 4)
              .map((pic, index) => (
                <ImageCard key={index} url={pic.url} name={pic.name} />
              ))}
          </React.Fragment>
        ))}
      </Grid>
    </Box>
  );
};

export default UploadGrid;
