import React, { useState, useRef, useEffect, useMemo, useCallback, useContext } from 'react';
import { Box, Image, Skeleton } from '@chakra-ui/react';
import AuthContext from '../context/AuthContext';

interface ImageCardProps {
  url: string;
  name: string;
  onClick: () => void;
  onLoad: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ url, name, onClick, onLoad }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const imageRef = useRef<HTMLDivElement | null>(null);

  const { accessToken } = useContext(AuthContext);

  const fetchImage = useCallback(async (permalink: string, isLowRes: boolean = true) => {
    try {
      const resolution = isLowRes ? 'low' : 'high';
      const response = await fetch(
        `${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/getImagesProxy?imageUrl=${encodeURIComponent(permalink)}&resolution=${resolution}`,
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
      onLoad();
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  }, [accessToken, onLoad]);

  const observer = useMemo(() => {
    return new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoaded) {
          fetchImage(url);
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

  const handleClick = () => {
    fetchImage(url, false);
    onClick();
  };

  return (
    <Box
      position="relative"
      w="100%"
      h="0"
      paddingBottom="100%"
      borderRadius="sm"
      overflow="hidden"
      shadow="lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={imageRef}
      bg="#282828"
    >
      <Skeleton isLoaded={isLoaded} h="100%" w="100%" startColor="#3f3f3f" endColor="#282828">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={name}
            objectFit="cover"
            w="100%"
            h="100%"
            position="absolute"
            top="0"
            left="0"
            transition="opacity 0.2s ease-in-out"
            opacity={isHovered ? 0.80 : 1}
            onClick={handleClick}
          />
        )}
      </Skeleton>
    </Box>
  );
};

export default ImageCard;