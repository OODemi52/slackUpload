import React from 'react';
import UploadGrid from './UploadGrid';
import { Grid, GridItem } from '@chakra-ui/react';
import UserInfo from './UserInfo';

const MainContent: React.FC = () => {
    return (
        <Grid templateRows="1fr 9fr" gap={0} w="full" h="full" p={0}>
            <GridItem bg="#355f99" borderTopRadius="md">
                <UserInfo />
            </GridItem>
            <GridItem overflowY="scroll" bg="#355f99" borderBottomRadius="md" display="flex" flexDirection="column" height="full" boxShadow="inset 0 0 8px rgba(0, 0, 0, 0.6)">
                <UploadGrid />
            </GridItem>
        </Grid>
    );
};

export default MainContent;
