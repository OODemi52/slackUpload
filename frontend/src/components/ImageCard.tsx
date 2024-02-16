import React from 'react';
import { Box, Image, Link, useColorModeValue, Text } from '@chakra-ui/react';

interface ImageCardProps {
    permalink: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ permalink }) => {
    const bg = useColorModeValue('white', 'gray.800');
    const color = useColorModeValue('gray.800', 'white');

    const blurredImageStyle = {
        filter: 'blur(8px)',
        transform: 'scale(1.5)',
        position: 'absolute',
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        zIndex: -1,
    };

    return (
        <Box
            maxW="sm"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg={bg}
            color={color}
            shadow="md"
            position="relative" 
            backdropBlur="8px"
            zIndex={0}
        >   
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="200px"
            >
                <Image
                    src={permalink}
                    alt="Uploaded Image"
                    objectFit="contain"
                    maxH="100%"
                    maxW="100%"
                    zIndex={1}
                />
                <Image src={permalink} alt="Background" style={blurredImageStyle as React.CSSProperties} />
            </Box>
            
            <Box p="6" zIndex={2} bg="white" >
                <Text display="flex" alignItems="baseline" isTruncated fontWeight="semibold">
                    Uploaded Image
                </Text>
                <Link href={permalink} isExternal color="blue.500">
                    View Image
                </Link>
            </Box>
        </Box>
    );
};

export default ImageCard;
