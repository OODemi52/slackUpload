import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from "react";
import {
  Box,
  Image,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useOutsideClick,
} from "@chakra-ui/react";
import AuthContext from "../context/AuthContext";

interface ImageCardProps {
  url: string;
  name: string;
  fileID: string;
  onClick: () => void;
  onDelete: (fileID: string) => void;
  isSelectMode: boolean;
  isSelected: boolean;
  onSelect: (fileID: string) => void;
  openMenuId: string | null;
  handleMenuToggle: (fileID: string | null) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({
  url,
  name,
  fileID,
  onClick,
  onDelete,
  isSelectMode,
  isSelected,
  onSelect,
  openMenuId,
  handleMenuToggle,
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: menuRef,
    handler: () => handleMenuToggle(null),
  });

  const { accessToken } = useContext(AuthContext);

  const isMenuOpen = !isSelectMode && openMenuId === fileID;

  const fetchImage = useCallback(async (permalink: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/getImagesProxy?imageUrl=${encodeURIComponent(permalink)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setImageUrl(imageUrl);
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  }, [accessToken]);

  const observer = useMemo(() => {
    return new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoaded) {
          fetchImage(url);
          setIsLoaded(true);
          observer.unobserve(imageRef.current!);
        }
      },
      { threshold: 0.1 }
    );
  }, [fetchImage, isLoaded, url]);

  useEffect(() => {
    const currentImageRef = imageRef.current;
    if (currentImageRef) {
      observer.observe(currentImageRef);
    }
    return () => {
      if (currentImageRef) {
        observer.unobserve(currentImageRef);
      }
    };
  }, [observer]);

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    handleMenuToggle(null);
  };

  const handleDelete = () => {
    onDelete(fileID);
    handleMenuToggle(null);
  }

  const handleMouseEnterButton = () => {
    setIsHovered(true);
  };

  const handleMouseLeaveButton = () => {
    isMenuOpen ? isHovered === false : isHovered;
  };

  return (
    <Box
      display="flex"
      position="relative"
      w="100%"
      h="auto"
      borderRadius="sm"
      overflow="hidden"
      shadow="lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() =>
        isMenuOpen ? setIsHovered(true) : setIsHovered(false)
      }
      ref={imageRef}
      bg="#282828"
      justifyContent="center"
      alignItems="center"
      boxShadow={
        isSelected && isSelectMode
          ? "0 0 .2rem whitesmoke, 0 0 .2rem whitesmoke, 0 0 0.6rem whitesmoke, inset 0 0 1.3rem whitesmoke;"
          : "none"
      }
      onClick={() => isSelectMode && onSelect(fileID)}
      cursor={isSelectMode ? "pointer" : "default"}
    >
      {isSelectMode && (
        <Checkbox
          position="absolute"
          isChecked={isSelected}
          onChange={() => onSelect(fileID)}
          opacity={0}
          pointerEvents="none"
        />
      )}
      <Menu size="md" isOpen={isMenuOpen}>
        <MenuButton
          as="button"
          style={{
            position: "absolute",
            top: "0px",
            right: "0px",
            zIndex: 2,
            color: "white",
            padding: "4px",
            borderRadius: "md",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={handleMouseEnterButton}
          onMouseLeave={handleMouseLeaveButton}
          onClick={() => handleMenuToggle(fileID)}
        >
          {isHovered && !isSelectMode && (
            <svg
              width="16"
              height="24"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              fill="white"
              className="filter-shadow"
              stroke="white"
              color="white"
            >
              <path
                fill="#FFF"
                d="M12 3a2 2 0 10-4 0 2 2 0 004 0zm-2 5a2 2 0 110 4 2 2 0 010-4zm0 7a2 2 0 110 4 2 2 0 010-4z"
              />
            </svg>
          )}
        </MenuButton>
        <MenuList
          bgGradient="linear(to bottom right, #202020, #080808)"
          border="1px solid #202020"
          dropShadow="0px 4px 4px rgba(0, 0, 0, 1)"
          mr={4}
          ref={menuRef}
        >
          <MenuItem
            onClick={handleDownload}
            color="white"
            bg="transparent"
            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
          >
            Download
          </MenuItem>
          <MenuItem
            onClick={handleDelete}
            color="red"
            bg="transparent"
            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
          >
            Delete
          </MenuItem>
        </MenuList>
      </Menu>
      <Image
        src={imageUrl}
        alt={name}
        objectFit="cover"
        w="100%"
        h="auto"
        transition="opacity 0.2s ease-in-out"
        opacity={isHovered ? 0.8 : 1}
        loading="lazy"
        onClick={onClick}
      />
    </Box>
  );
};

export default ImageCard;