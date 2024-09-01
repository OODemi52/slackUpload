import React, { useState, useRef, useEffect, useMemo, useCallback, useContext } from 'react';
import { Box, Image, Checkbox } from '@chakra-ui/react';
import AuthContext from '../context/AuthContext';

interface ImageCardProps {
  url: string;
  name: string;
  onClick: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ url, name, onClick }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const imageRef = useRef<HTMLDivElement | null>(null);

  const { accessToken } = useContext(AuthContext);

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
      onMouseLeave={() => setIsHovered(false)}
      ref={imageRef}
      bg="#282828"
      justifyContent="center"
      alignItems="center"
    >
      <Checkbox
        position="absolute"
        top="4px"
        left="3px"
        zIndex={2}
        bg="whiteAlpha.500"
        size="md"
        borderColor="whiteAlpha.500"
        borderRadius="md"
        display="none"
      />
      {imageUrl && (
        <>
          <button
            style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              zIndex: 2,
              color: 'white',
              padding: '4px',
              borderRadius: 'md',
            }}
          >
            {isHovered && (
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
          </button>
          <Image
            src={imageUrl}
            alt={name}
            objectFit="cover"
            w="100%"
            h="auto"
            transition="opacity 0.2s ease-in-out"
            opacity={isHovered ? 0.80 : 1}
            loading="lazy"
            onClick={onClick}
          />
        </>
      )}
    </Box>
  );
};

export default ImageCard;