import React from "react";
import { Heading, Flex, Box } from "@chakra-ui/react";
import logo from "../assets/SSLOGO_NOBG.png";

const Header: React.FC = () => {
  return (
    <Box
      as="header"
      width="full"
      boxShadow="sm"
      position="relative"
      zIndex="banner"
      pl="1.5rem"
    >
      <Flex align="center" justify="space-between" wrap="wrap">
        <Flex align="center">
          <img src={logo} alt="Slack Shots Logo" width="50px" />
          <Heading
            as="h1"
            size="lg"
            letterSpacing={"tighter"}
            ml={4}
            color="white"
          >
            SlackShots
          </Heading>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
