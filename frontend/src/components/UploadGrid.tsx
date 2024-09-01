import React from "react";
import { Grid, Box } from "@chakra-ui/react";
import ImageCard from "./ImageCard";

interface UploadGridProps {
  pics: { url: string; name: string }[];
  onScroll: (event: React.UIEvent<HTMLElement>) => void;
}

const UploadGrid: React.FC<UploadGridProps> = ({ pics, onScroll }) => {
  return (
    <Box maxH="900px" overflowY="scroll" onScroll={onScroll}>
      <Grid 
        templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }} 
        gap={6} 
        p={4}
      >
        {pics.map((pic, index) => (
          <ImageCard key={index} url={pic.url} name={pic.name} />
        ))}
      </Grid>
    </Box>
  );
};

export default UploadGrid;