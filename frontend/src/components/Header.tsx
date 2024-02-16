import React from "react";
import { Heading, Flex, Container, Box, AspectRatio } from "@chakra-ui/react";
import Logo from "./Logo";
import logo from '../../public/SSLOGO_NOBG.png';

const Header: React.FC = () => {
    return (
        <Box as="header" width="full" boxShadow="sm" position="relative" zIndex="banner">
            <Container maxW="container.xl" py={2}>
                <Flex align="center" justify="space-between" wrap="wrap">
                    <Flex align="center" mr={5}>
                        <Logo />
                        <Heading as="h1" size="lg" letterSpacing={"tighter"} ml={4}>
                            SlackShots
                        </Heading>
                        <AspectRatio maxW="100px">
                        <img src={logo} alt="Slack Shots Logo" className="logo-image" style={{ width: "50px" }} />
                        </AspectRatio>
                    </Flex>
                </Flex>
            </Container>
        </Box>
    );
};

export default Header;
