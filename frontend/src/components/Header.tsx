import { useState, useCallback, useContext } from "react";
import { useToast } from "@chakra-ui/react";
import AuthContext from "../context/AuthContext";
import {
  Heading,
  Flex,
  Box,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useMediaQuery,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import logo from "../assets/SSLOGO_NOBG.png";
import Logout from "./Logout";
import MultipleSelect from "./MultipleSelect";
import DownloadManyButton from "./DownloadManyButton";
import DeleteManyButton from "./DeleteManyButton";
interface HeaderProps {
  onToggleSelectMode: () => void;
  isSelectMode: boolean;
  selectedImages: {
    url: string;
    fileID: string;
    deleteFlag: string;
    name: string;
  }[];
}

const Header: React.FC<HeaderProps> = ({
  onToggleSelectMode,
  isSelectMode,
  selectedImages,
}) => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const [isDownloading, setIsDownloading] = useState(false);
  const toast = useToast();

  const { accessToken } = useContext(AuthContext);

  const handleDownloadMany = useCallback(async () => {
    if (selectedImages.length === 0 || isDownloading) return;

    setIsDownloading(true);

    try {
      const filesToDownload = selectedImages.map((image) => ({
        url: image.url,
        name: image.name || `image_${image.fileID}.jpg`,
      }));

      const date = new Date();

      const response = await fetch(
        `${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/downloadFiles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ files: filesToDownload }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `SS_images_${filesToDownload.length}_files_${date.toISOString().replace(/[:.]/g, "-")}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `Successfully downloaded ${selectedImages.length} images.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error downloading images:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the images.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  }, [selectedImages, isDownloading, accessToken, toast]);

  const handleDeleteMany = useCallback(() => {
    // Implement delete logic here
    console.log("Deleting selected images");
  }, []);

  return (
    <Box
      as="header"
      width="full"
      boxShadow="sm"
      position="relative"
      zIndex="banner"
      pl="1.5rem"
      pr="1.5rem"
    >
      <Flex align="center" justify="space-between" wrap="wrap">
        <Flex align="center">
          <img src={logo} alt="Slack Shots Logo" width="50px" />
          {isLargerThan768 && (
            <Heading
              as="h1"
              size="lg"
              letterSpacing={"tighter"}
              ml={4}
              color="white"
            >
              SlackShots
            </Heading>
          )}
        </Flex>
        {isSelectMode && (
          <Text
            color="white"
            fontSize="18px"
            fontWeight="bold"
            display={{ base: "none", md: "block" }}
            mb={{ base: 2, md: 0 }}
          >
            Selected: {selectedImages.length}
          </Text>
        )}
        <Flex align="center">
          {isSelectMode && !isLargerThan768 ? (
            <Box position="relative">
              {selectedImages.length > 0 && (
                <Tag
                  position="absolute"
                  top="-4px"
                  right="4px"
                  borderRadius="full"
                  bg="#282828"
                  color="white"
                  width="30px"
                  height="30px"
                  size="xs"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  fontSize="16px"
                  fontWeight="bold"
                  zIndex={10}
                >
                  <TagLabel>{selectedImages.length}</TagLabel>
                </Tag>
              )}
              <Menu size="md">
                <MenuButton
                  as={IconButton}
                  aria-label="Select Options"
                  icon={<MenuIcon />}
                  bg="transparent"
                  color="white"
                  mr={4}
                />
                <MenuList
                  bgGradient="linear(to bottom right, #202020, #080808)"
                  border="1px solid #202020"
                  dropShadow="0px 4px 4px rgba(0, 0, 0, 1)"
                  ml={4}
                >
                  <MenuItem
                    color="white"
                    bg="transparent"
                    _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                    isDisabled={selectedImages.length > 0 ? false : true}
                    onClick={handleDownloadMany}
                  >
                    <DownloadManyButton
                      isSelectMode={isSelectMode}
                      selectedImages={selectedImages}
                      onDownload={handleDownloadMany}
                      isDownloading={isDownloading}
                    />
                    <Text color="white" fontSize="16px" fontWeight="bold">
                      Download All Selected
                    </Text>
                  </MenuItem>
                  <MenuItem
                    color="white"
                    bg="transparent"
                    _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                    isDisabled={selectedImages.length > 0 ? false : true}
                    onClick={handleDeleteMany}
                  >
                    <DeleteManyButton
                      isSelectMode={isSelectMode}
                      selectedImages={selectedImages}
                    />
                    <Text
                      color={selectedImages.length > 0 ? "#FF0000" : "white"}
                      fontSize="16px"
                      fontWeight="bold"
                    >
                      Delete All Selected
                    </Text>
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          ) : (
            <>
              {isSelectMode && (
                <>
                  <DownloadManyButton
                    isSelectMode={isSelectMode}
                    selectedImages={selectedImages}
                    onDownload={handleDownloadMany}
                    isDownloading={isDownloading}
                  />
                  <DeleteManyButton
                    isSelectMode={isSelectMode}
                    selectedImages={selectedImages}
                  />
                </>
              )}
            </>
          )}
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

const MenuIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 12H21"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 6H21"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 18H21"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Header;
