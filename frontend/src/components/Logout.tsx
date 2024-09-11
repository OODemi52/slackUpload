import React, { useState, useRef, useContext } from "react";
import {
  Tooltip,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import AuthContext from "../context/AuthContext";

const Logout: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { setAccessToken } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setAccessToken(null);
        window.location.reload();
          } else {
        console.error("Logout failed", response);
          }    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const onConfirmLogout = () => {
    handleLogout();
    onClose();
  };

  return (
    <>
      <Tooltip
        label="Logout"
        bg="#FF0000"
        placement="bottom"
        display={{ base: "none", md: "block" }}
      >
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            marginRight: "2rem",
          }}
          aria-label="Logout"
          onFocus={(e) => e.preventDefault()}
        >
          <svg
            fill="#FF0000"
            height="25px"
            width="25px"
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 489 489"
            xmlSpace="preserve"
          >
            <g>
              <g>
                <path
                  d="M397.4,68.7c-8.3-7.3-20.8-6.2-28.1,3.1c-7.3,8.3-6.2,20.8,3.1,28.1c47.9,37.5,75.9,92.6,75.9,151.9
                c0,108.2-91.5,195.6-203.9,195.6S40.6,360,40.6,251.8c0-59.3,28.1-114.4,75.9-151.9c8.3-6.2,10.4-18.7,3.1-28.1
                c-6.2-8.3-18.7-10.4-28.1-3.1C33.2,113.4,0,181.1,0,252.8C0,382.8,109.2,489,244.5,489S489,382.9,489,252.8
                C489,181,455.7,113.4,397.4,68.7z"
                />
                <path
                  d="M244.5,253.9c11.4,0,20.8-9.4,20.8-20.8V20.8c0-11.4-9.4-20.8-20.8-20.8s-20.8,9.4-20.8,20.8V233
                C223.7,244.5,233.1,253.9,244.5,253.9z"
                />
              </g>
            </g>
          </svg>
        </button>
      </Tooltip>
      
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bgGradient="linear(to bottom right, #202020, #080808)" border="4px solid #202020" boxShadow="inset 0 0 8px rgba(0, 0, 0, 0.6)" width="95%">
            <AlertDialogHeader fontSize="3xl" fontWeight="bold" color="white" textShadow="0 1px 3px rgba(0, 0, 0, 0.6)">
              Leaving So Soon?
            </AlertDialogHeader>

            <AlertDialogBody color="white" textShadow="0 1px 3px rgba(0, 0, 0, 0.6)">
              Are you sure you want to logout? This will end your session.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} boxShadow="0 3px 3px rgba(0, 0, 0, 0.6)">
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onConfirmLogout} ml={3} boxShadow="0 3px 3px rgba(0, 0, 0, 0.6)">
                Logout
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Logout;