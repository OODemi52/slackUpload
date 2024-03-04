import React from "react";
import UploadGrid from "./UploadGrid";
import { Grid, GridItem } from "@chakra-ui/react";
import InfoBar from "./InfoBar";

const MainContent: React.FC = () => {
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
        <UploadGrid />
      </GridItem>
    </Grid>
  );
};

export default MainContent;
