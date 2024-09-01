import React from 'react';
import logo from "../assets/SSLOGO_NOBG.png";
import SlackAuth from './SlackAuth';
import {
    Box,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
  } from '@chakra-ui/react';

interface LandingPageProps {
    count?: number;
    }

const LandingPage: React.FC<LandingPageProps> = ({ count = 400 }) => {
  const particles = [];

  for (let i = 0; i < count; i++) {
    const size = Math.random() * (0.45) + 'rem';
    const speed = Math.random() * (15000 - 5000) + 5000;
    const delay = Math.random() * 12000;
    const left = Math.random() * 100;

    particles.push(
        <Box
            key={i}
            className="particle"
            overflow={'hidden'}
            style={{
                    width: size,
                    height: size,
                    animation: `blow ${speed * 2.5}ms infinite`,
                    animationDelay: `${delay}ms`,
                    left: `${left}%`,
                    backgroundColor: `white`
            }}
        />
    );
  }

  return (
    <>
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH="100vh"
      color="white"
      bgGradient="linear(to bottom right, #202020, #080808)"
      overflow="hidden"
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      >
        {particles}
    <Modal
        isOpen={true}
        isCentered={true}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        blockScrollOnMount={false} 
        onClose={function (): void {throw new Error('Function not implemented; Modal should not be closable.')}}
    >
        <ModalOverlay backdropBrightness={100} backdropBlur={100} />
        <ModalContent 
          padding="1rem"
          bgGradient="linear(to bottom right, #202020, #080808)"
          boxShadow="8px 16px 16px rgba(0, 0, 0, 0.75)"
          borderRadius="50px"
          w="80%"
        >
        <ModalBody
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Box display="flex" flexDirection="column" alignItems="center">
          <img src={logo} alt="SlackShots Logo" />
          <ModalHeader color="white">SlackShots</ModalHeader>
          <h2
            style={{
            color: "white",
            justifyContent: "center",
            alignContent: "center",
            textAlign: "center",
            }}
          >
            Click Below To Sign In/Add The App To Your Workspace
          </h2>
          </Box>
        </ModalBody>
        <ModalFooter
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <SlackAuth />
        </ModalFooter>
        </ModalContent>
      </Modal>
      </Box>
    </>
  );
};

export default LandingPage;
