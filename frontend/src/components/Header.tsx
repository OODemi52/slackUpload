import React from "react";
import { Heading, Flex, Box, Text } from "@chakra-ui/react";
import logo from "../assets/SSLOGO_NOBG.png";
import Logout from "./Logout";
import MultipleSelect from "./MultipleSelect";
import DownloadManyButton from "./DownloadManyButton";
import DeleteManyButton from "./DeleteManyButton";

interface HeaderProps {
  onToggleSelectMode: () => void;
  isSelectMode: boolean;
  selectedImages: string[];
}

const Header: React.FC<HeaderProps> = ({
  onToggleSelectMode,
  isSelectMode,
  selectedImages,
}) => {
  <Logout />;
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
        <Flex align="baseline">
          {isSelectMode && (
              <Text
                color="white"
                fontSize="18px"
                fontWeight="bold"
                display={!isSelectMode ? "none" : "block"}
                mb={4}
              >
                Selected: {selectedImages.length}
              </Text>
          )}
        </Flex>
        <Flex align="center">
          <DownloadManyButton
            isSelectMode={isSelectMode}
            selectedImages={selectedImages}
          />
          <DeleteManyButton
            isSelectMode={isSelectMode}
            selectedImages={selectedImages}
          />
          <MultipleSelect
            onToggleSelectMode={onToggleSelectMode}
            isSelectMode={isSelectMode}
          />
          <Logout />
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
