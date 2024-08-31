import React, { useEffect, useState, useRef, useMemo, useContext } from "react";
import { Box, Image, Checkbox, useColorModeValue, Text } from "@chakra-ui/react";
import AuthContext from "../context/AuthContext";

interface ImageCardProps {
  url: string;
  name: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ url, name }) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const bg = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("gray.800", "white");

  const observer = useMemo(
    () =>
      new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && !isLoaded) {
            fetchImage(url);
            setIsLoaded(true);
            observer.unobserve(imageRef.current!);
          }
        },
        { threshold: 0.1 }
      ),
    [isLoaded, url]
  );

  const { accessToken } = useContext(AuthContext);

  const fetchImage = async (permalink: string) => {
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
      console.error("Error fetching image:", error);
    }
  };

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
  }, [imageRef, url, observer]);

  return (
    <Box
      position="relative"
      maxW="sm"
      border="1px solid #b3b3b3"
      borderRadius="lg"
      overflow="hidden"
      bg={bg}
      color={color}
      shadow="md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={imageRef}
    >
      {/* Checkbox in top left */}
      <Checkbox
        position="absolute"
        top="8px"
        left="8px"
        zIndex={2}
        bg="whiteAlpha.800"
        borderRadius="md"
        size="lg"
      />

      {/* Download icon in top right */}
      {imageUrl && (
        <a
          href={imageUrl}
          download
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            zIndex: 2,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "4px",
            borderRadius: "4px",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-download"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </a>
      )}

      {/* Image */}
      {imageUrl && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="200px"
          position="relative"
        >
          <Image
            src={imageUrl}
            alt={name}
            objectFit="cover"
            width="100%"
            height="100%"
          />

          {/* Hover effect */}
          {isHovered && (
            <Box
              position="absolute"
              bottom="0"
              width="100%"
              bg="blackAlpha.700"
              color="white"
              textAlign="center"
              p={2}
              transition="opacity 0.3s"
              opacity={0.9}
            >
              <Text>{name}</Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ImageCard;