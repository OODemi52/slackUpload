import React from 'react';
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
} from '@chakra-ui/react';
import Spacer from './Spacer';

interface DeletionConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteFrom: 'slack' | 'app' | 'both') => void;
  itemName: string;
}

const DeletionConfirmation: React.FC<DeletionConfirmationProps> = ({ isOpen, onClose, onConfirm, itemName }) => {
  const [deleteFrom, setDeleteFrom] = React.useState<'slack' | 'app' | 'both'>('both');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bgGradient="linear(to bottom right, #202020, #080808)" border="4px solid #202020" boxShadow="inset 0 0 8px rgba(0, 0, 0, 0.6)" width="95%">
        <ModalHeader fontSize="3xl" fontWeight="bold" color="white" textShadow="0 1px 3px rgba(0, 0, 0, 0.6)">Confirm Delete</ModalHeader>
        <ModalCloseButton display="none" />
        <ModalBody color="white" textShadow="0 1px 3px rgba(0, 0, 0, 0.6)">
          <p>Are you sure you want to delete {itemName}? This action cannot be undone</p>
          <Spacer size={1} />
          <Box p="40px" boxShadow="inset 0 4px 12px rgba(0, 0, 0, 0.6)" borderRadius="4px" border="1px solid #282828">
            <RadioGroup onChange={(value) => {
              setDeleteFrom(value as 'slack' | 'app' | 'both');
            }} value={deleteFrom}>
              <Stack spacing={0}>
                <Box position="relative">
                  <Radio
                    value="slack"
                    sx={{
                      position: 'absolute',
                      opacity: 0,
                      zIndex: -1,
                      _checked: {
                        borderColor: 'white',
                        boxShadow: '0 0 0 1px white',
                      },
                    }}
                    id="slack"
                  />
                  <label
                    htmlFor="slack"
                    style={{
                      display: 'block',
                      backgroundColor: deleteFrom === 'slack' ? '#282828' : '#202020',
                      color: deleteFrom === 'slack' ? 'white' : 'inherit',
                      border: deleteFrom === 'slack' ? '1px solid white' : '1px solid #282828',
                      borderRadius: '4px',
                      padding: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete from Slack only
                  </label>
                </Box>

                <Box position="relative">
                  <Radio
                    value="app"
                    sx={{
                      position: 'absolute',
                      opacity: 0,
                      zIndex: -1,
                      _checked: {
                        borderColor: 'white',
                        boxShadow: '0 0 0 1px white',
                      },
                    }}
                    id="app"
                  />
                  <label
                    htmlFor="app"
                    style={{
                      display: 'block',
                      backgroundColor: deleteFrom === 'app' ? '#282828' : 'rgba(32, 32, 32, 1)',
                      color: deleteFrom === 'app' ? 'white' : 'inherit',
                      border: deleteFrom === 'app' ? '1px solid white' : '1px solid #282828',
                      borderRadius: '4px',
                      padding: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete from SlackShots only
                  </label>
                </Box>

                <Box position="relative">
                  <Radio
                    value="both"
                    sx={{
                      position: 'absolute',
                      opacity: 0,
                      zIndex: -1,
                      _checked: {
                        borderColor: 'white',
                        boxShadow: '0 0 0 1px white',
                      },
                    }}
                    id="both"
                  />
                  <label
                    htmlFor="both"
                    style={{
                      display: 'block',
                      backgroundColor: deleteFrom === 'both' ? '#282828' : '#202020',
                      color: deleteFrom === 'both' ? 'white' : 'inherit',
                      border: deleteFrom === 'both' ? '1px solid white' : '1px solid #282828',
                      borderRadius: '4px',
                      padding: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete from both
                  </label>
                </Box>
              </Stack>
            </RadioGroup>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} boxShadow="0 3px 3px rgba(0, 0, 0, 0.6)" _hover={{bg: "offwhite"}}>Cancel</Button>
          <Button colorScheme="red" ml={3} onClick={() => onConfirm(deleteFrom)} boxShadow="0 3px 3px rgba(0, 0, 0, 0.6)">
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeletionConfirmation;