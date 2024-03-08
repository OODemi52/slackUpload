import React, { useEffect, useState, useRef, useMemo } from "react";
import { Box, Image, Link, useColorModeValue, Text } from "@chakra-ui/react";

interface ImageCardProps {
  url: string;
  name: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ url, name }) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const bg = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("gray.800", "white");
  const blurredImageStyle = {
    filter: "blur(100px)",
    transform: "scale(3)",
    position: "absolute",
    width: "100%",
    height: "100%",
    objectFit: "contain",
    zIndex: -1,
  };

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
        { threshold: 0.1 },
      ),
    [isLoaded, url],
  );

  const fetchImage = async (permalink: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/getImagesProxy?imageUrl=${encodeURIComponent(permalink)}`,
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
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [imageRef, url, observer]);

  return (
    <Box
      maxW="sm"
      border="1px solid #b3b3b3"
      borderRadius="lg"
      overflow="hidden"
      bg={bg}
      color={color}
      shadow="md"
      position="relative"
      backdropBlur="8px"
      zIndex={0}
      ref={imageRef}
    >
      {imageUrl && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="200px"
        >
          <Image
            src={imageUrl}
            alt={name}
            objectFit="contain"
            maxH="100%"
            maxW="100%"
            zIndex={1}
          />
          <Image
            src={imageUrl}
            alt="Background"
            style={blurredImageStyle as React.CSSProperties}
          />
        </Box>
      )}

      <Box p="6" zIndex={2} bg="white">
        <Text
          display="flex"
          alignItems="baseline"
          isTruncated
          fontWeight="semibold"
        >
          {name}
        </Text>
        <Link href={imageUrl || "#"} isExternal color="blue.500" download>
          Download
        </Link>
      </Box>
    </Box>
  );
};

export default ImageCard;
