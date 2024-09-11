import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Radio,
  RadioGroup,
  Stack,
  Box,
} from "@chakra-ui/react";
import Spacer from "./Spacer";

interface DeletionConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteFlag: "slack" | "app" | "both") => void;
  itemName: string;
}

const DeletionConfirmation: React.FC<DeletionConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}) => {
  const [deleteFlag, setDeleteFlag] = React.useState<"slack" | "app" | "both">(
    "both"
  );

  const handleConfirm = () => {
    onConfirm(deleteFlag);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        bgGradient="linear(to bottom right, #202020, #080808)"
        border="4px solid #202020"
        boxShadow="inset 0 0 8px rgba(0, 0, 0, 0.6)"
        width="95%"
      >
        <ModalHeader
          fontSize="3xl"
          fontWeight="bold"
          color="white"
          textShadow="0 1px 3px rgba(0, 0, 0, 0.6)"
        >
          Confirm Delete
        </ModalHeader>
        <ModalCloseButton display="none" />
        <ModalBody color="white" textShadow="0 1px 3px rgba(0, 0, 0, 0.6)">
          <p>
            Are you sure you want to delete {itemName}? This action cannot be
            undone
          </p>
          <Spacer size={1} />
          <Box
            p="40px"
            boxShadow="inset 0 4px 12px rgba(0, 0, 0, 0.6)"
            borderRadius="4px"
            border="1px solid #282828"
          >
            <RadioGroup
              onChange={(value) => {
                setDeleteFlag(value as "slack" | "app" | "both");
                console.log(value);
              }}
              value={deleteFlag}
            >
              <Stack spacing={2}>
                {["slack", "app", "both"].map((value) => (
                  <Box key={value} position="relative">
                    <Radio
                      value={value}
                      opacity={0}
                      position="absolute"
                      zIndex={1}
                      width="100%"
                      height="100%"
                    />
                    <Box
                      as="label"
                      htmlFor={value}
                      display="block"
                      backgroundColor={
                        deleteFlag === value ? "#282828" : "#202020"
                      }
                      color={deleteFlag === value ? "white" : "inherit"}
                      border={
                        deleteFlag === value
                          ? "1px solid white"
                          : "1px solid #282828"
                      }
                      borderRadius="4px"
                      padding="8px"
                      cursor="pointer"
                    >
                      {value === "slack" && "Delete from Slack only"}
                      {value === "app" && "Delete from SlackShots only"}
                      {value === "both" && "Delete from both"}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </RadioGroup>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={onClose}
            boxShadow="0 3px 3px rgba(0, 0, 0, 0.6)"
            _hover={{ bg: "offwhite" }}
          >
            Cancel
          </Button>
          <Button
            bg="#FF0000"
            ml={3}
            onClick={handleConfirm}
            boxShadow="0 3px 3px rgba(0, 0, 0, 0.6)"
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeletionConfirmation;
