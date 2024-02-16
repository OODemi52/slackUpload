import React from 'react';
import { Grid, Box } from '@chakra-ui/react';
import ImageCard from './ImageCard';

const permalinks = [
    "https://hips.hearstapps.com/hmg-prod/images/mandalorian-season-3-63fe7ec7b2ab2.jpeg?crop=0.846xw:1.00xh;0.111xw,0&resize=1200:*",
    "https://editors.dexerto.com/wp-content/uploads/2023/04/19/the-mandalorian-season-4-1.jpg",
    "https://lumiere-a.akamaihd.net/v1/images/5e97081f4e43710001cd36e6-image_40692e05.jpeg?region=0,0,1536,864&width=768",
    "https://hips.hearstapps.com/hmg-prod/images/screen-shot-2023-04-17-at-2-11-57-pm-643d8bf3e396a.png?crop=1.00xw:0.699xh;0,0&resize=1200:*",
    "https://www.photomural.com/media/catalog/product/cache/2/thumbnail/9df78eab33525d08d6e5fb8d27136e95/d/x/dx4-085_star_wars_the_mandalorian_big_impaler_web.jpg",
    "https://hips.hearstapps.com/hmg-prod/images/mandalorian-season-3-63fe7ec7b2ab2.jpeg?crop=0.846xw:1.00xh;0.111xw,0&resize=1200:*",
    "https://editors.dexerto.com/wp-content/uploads/2023/04/19/the-mandalorian-season-4-1.jpg",
    "https://lumiere-a.akamaihd.net/v1/images/5e97081f4e43710001cd36e6-image_40692e05.jpeg?region=0,0,1536,864&width=768",
    "https://hips.hearstapps.com/hmg-prod/images/screen-shot-2023-04-17-at-2-11-57-pm-643d8bf3e396a.png?crop=1.00xw:0.699xh;0,0&resize=1200:*",
    "https://www.photomural.com/media/catalog/product/cache/2/thumbnail/9df78eab33525d08d6e5fb8d27136e95/d/x/dx4-085_star_wars_the_mandalorian_big_impaler_web.jpg",
    "https://hips.hearstapps.com/hmg-prod/images/mandalorian-season-3-63fe7ec7b2ab2.jpeg?crop=0.846xw:1.00xh;0.111xw,0&resize=1200:*",
    "https://editors.dexerto.com/wp-content/uploads/2023/04/19/the-mandalorian-season-4-1.jpg",
    "https://lumiere-a.akamaihd.net/v1/images/5e97081f4e43710001cd36e6-image_40692e05.jpeg?region=0,0,1536,864&width=768",
    "https://hips.hearstapps.com/hmg-prod/images/screen-shot-2023-04-17-at-2-11-57-pm-643d8bf3e396a.png?crop=1.00xw:0.699xh;0,0&resize=1200:*",
    "https://www.photomural.com/media/catalog/product/cache/2/thumbnail/9df78eab33525d08d6e5fb8d27136e95/d/x/dx4-085_star_wars_the_mandalorian_big_impaler_web.jpg",
    "https://hips.hearstapps.com/hmg-prod/images/mandalorian-season-3-63fe7ec7b2ab2.jpeg?crop=0.846xw:1.00xh;0.111xw,0&resize=1200:*",
    "https://editors.dexerto.com/wp-content/uploads/2023/04/19/the-mandalorian-season-4-1.jpg",
    "https://lumiere-a.akamaihd.net/v1/images/5e97081f4e43710001cd36e6-image_40692e05.jpeg?region=0,0,1536,864&width=768",
    "https://hips.hearstapps.com/hmg-prod/images/screen-shot-2023-04-17-at-2-11-57-pm-643d8bf3e396a.png?crop=1.00xw:0.699xh;0,0&resize=1200:*",
    "https://www.photomural.com/media/catalog/product/cache/2/thumbnail/9df78eab33525d08d6e5fb8d27136e95/d/x/dx4-085_star_wars_the_mandalorian_big_impaler_web.jpg",
    "https://hips.hearstapps.com/hmg-prod/images/mandalorian-season-3-63fe7ec7b2ab2.jpeg?crop=0.846xw:1.00xh;0.111xw,0&resize=1200:*",
    "https://editors.dexerto.com/wp-content/uploads/2023/04/19/the-mandalorian-season-4-1.jpg",
    "https://lumiere-a.akamaihd.net/v1/images/5e97081f4e43710001cd36e6-image_40692e05.jpeg?region=0,0,1536,864&width=768",
    "https://hips.hearstapps.com/hmg-prod/images/screen-shot-2023-04-17-at-2-11-57-pm-643d8bf3e396a.png?crop=1.00xw:0.699xh;0,0&resize=1200:*",
    "https://www.photomural.com/media/catalog/product/cache/2/thumbnail/9df78eab33525d08d6e5fb8d27136e95/d/x/dx4-085_star_wars_the_mandalorian_big_impaler_web.jpg",
];

const UploadGrid: React.FC= () => {
    const rows = Math.ceil(permalinks.length / 4);

    return (
        <Box maxH="900px" overflowY="scroll">
            <Grid templateColumns={`repeat(4, 1fr)`} gap={6} p={4}>
                {Array.from({ length: rows }, (_, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        {permalinks.slice(rowIndex * 4, (rowIndex + 1) * 4).map((permalink, index) => (
                            <ImageCard key={index} permalink={permalink} />
                        ))}
                    </React.Fragment>
                ))}
            </Grid>
            </Box>
    );
};

export default UploadGrid;
