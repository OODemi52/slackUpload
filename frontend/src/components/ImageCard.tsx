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
  Skeleton,
  useOutsideClick,
} from "@chakra-ui/react";
import AuthContext from "../context/AuthContext";

interface ImageCardProps {
  url: string;
  name: string;
  fileID: string;
  onClick: () => void;
  onDelete: (fileID: string, url: string, name: string) => void;
  isSelectMode: boolean;
  isSelected: boolean;
  onSelect: (fileID: string, url: string, name: string) => void;
  openMenuId: string | null;
  handleMenuToggle: (fileID: string | null) => void;
    calculateVisibleImages: () => number | undefined;
}

const ImageCard: React.FC<ImageCardProps> = React.memo(({
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
  calculateVisibleImages,
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: menuRef,
    handler: () => {
      if (isMenuOpen) {
        handleMenuToggle(null);
        setIsHovered(false);
      }
    }
  });

  const { accessToken } = useContext(AuthContext);

  const isMenuOpen = !isSelectMode && openMenuId === fileID;

  const fetchImage = useCallback(async (permalink: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVERPROTOCOL}://${
          import.meta.env.VITE_SERVERHOST
        }/api/getImagesProxy?imageUrl=${encodeURIComponent(permalink)}`,
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
      setIsLoaded(true);
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  }, [accessToken]);

  const observer = useMemo(() => {
    return new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoaded) {
          calculateVisibleImages();
          void fetchImage(url);
          observer.unobserve(imageRef.current!);
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
        rootMargin: "100px"
      }
    );
  }, [fetchImage, isLoaded, url, calculateVisibleImages]);

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
    onDelete(fileID, url, name);
    handleMenuToggle(null);
  };

  return (
    <Box
      ref={imageRef}
      display="flex"
      position="relative"
      borderRadius="sm"
      overflow="hidden"
      shadow="lg"
      mx="auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() =>
        isMenuOpen ? setIsHovered(true) : setIsHovered(false)
      }
      bg="#282828"
      justifyContent="center"
      alignItems="center"
      boxShadow={
        isSelected && isSelectMode
          ? "0 0 .2rem whitesmoke, 0 0 .2rem whitesmoke, 0 0 0.6rem whitesmoke, inset 0 0 1.3rem whitesmoke;"
          : "none"
      }
      onClick={() => isSelectMode && onSelect(fileID, url, name)}
      cursor={isSelectMode ? "pointer" : "default"}
      transition="transform 0.3s ease-in-out"  
    >
      {isSelectMode && (
        <Checkbox
          position="absolute"
          isChecked={isSelected}
          onChange={() => onSelect(fileID, url, name)}
          opacity={0}
          pointerEvents="none"
        />
      )}
      {isLoaded && <Menu size="md" isOpen={isMenuOpen}>
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
      </Menu>}
      {useMemo(() => (
        <Skeleton
          width="100%"
          height="100%"
          isLoaded={isLoaded}
          fadeDuration={1}
          startColor='#282828'
          endColor='#484848'
          as="image"
        >
          <Image
            src={imageUrl}
            alt={name}
            objectFit="cover"
            w="100%"
            h="100%"
            opacity={isHovered ? 0.8 : 1}
            loading="lazy"
            onClick={onClick}
            borderRadius="sm"
            transition="transform 0.3s ease-in-out"
          />
        </Skeleton>
      ), [isLoaded, imageUrl, name, isHovered, onClick])}
    </Box>
  );
});

export default ImageCard;