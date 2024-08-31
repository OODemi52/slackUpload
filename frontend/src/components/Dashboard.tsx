import React from "react";
import { Grid, GridItem, Box } from "@chakra-ui/react";
import Aside from "./Aside";
import Header from "./Header";
import MainContent from "./MainContent";

const Dashboard: React.FC = () => {
  return (
    <Box
      justifyContent="center"
      minW="100vw"
      w="100vw"
      maxH="100vh"
      h="95%"
    >
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
            <Header />
          </GridItem>

          {/* Main Content */}
          <GridItem
            gridArea="main"
            bg="#282828"
            overflowY="auto"
            boxShadow="inset 0 0 8px rgba(0, 0, 0, 0.6)"
            minH={{ base: "65vh", md: "auto" }}
          >
            <MainContent />
          </GridItem>

          {/* Aside */}
          <GridItem
            gridArea="aside"
            bg="#282828"
            w="100%"
            h="auto"
            justifyContent="center"
          >
            <Aside />
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;