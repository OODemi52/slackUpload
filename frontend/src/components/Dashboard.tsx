import React from "react";
import { Grid, GridItem, Box } from "@chakra-ui/react";
import Aside from "./Aside";
import Header from "./Header";
import MainContent from "./MainContent";

const Dashboard: React.FC = () => {
  return (
    <Box
      display="flex"
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
        bg="purple.500"
        boxShadow="0px 0px 10px rgba(0, 0, 0, 0.5)"
        bgGradient="linear(to bottom, #5f43b2, #8c73e9)"
      >
        <Grid
          templateAreas={`
            "header header"
            "main main"
            "aside aside"
          `}
          gridTemplateRows={"50px 1fr auto"}
          gridTemplateColumns={"1fr"}
          overflow="hidden"
          boxShadow="0px 0px 10px rgba(0, 0, 0, 1)"
          height="95vh"
          width="95vw"
          borderRadius={5}
        >
          <GridItem gridArea="header" bg="#282828" mb="1px">
            <Header />
          </GridItem>
          <GridItem
            gridArea="main"
            bg="purple.500"
            overflowY="auto"
            boxShadow="inset 0 0 8px rgba(0, 0, 0, 0.6)"
          >
            <MainContent />
          </GridItem>
          <GridItem gridArea="aside" bg="#282828">
            <Aside />
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
