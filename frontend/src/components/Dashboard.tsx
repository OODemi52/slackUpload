import React from 'react';
import { Grid, GridItem, Box } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';

const Dashboard: React.FC = () => {
    return (
        <Box w="100vw" h="100vh" padding={0}>
            <Grid
                templateAreas={`
                    "header header"
                    "sidebar main"
                `}
                gridTemplateRows={'50px 1fr'}
                gridTemplateColumns={'25vw 1fr'}
                h="100%"
                w="100%"
                gap={1}
            >
                <GridItem gridArea="header" bg="#db5353">
                    <Header />
                </GridItem>
                <GridItem gridArea="sidebar" bg="#355f99" borderRadius="md">
                    <Sidebar />
                </GridItem>
                <GridItem gridArea="main" bg="#db5353" borderRadius="md">
                    <MainContent />
                </GridItem>
            </Grid>
        </Box>
    );
};

export default Dashboard;
