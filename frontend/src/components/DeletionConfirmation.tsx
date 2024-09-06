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
} from '@chakra-ui/react';

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
      <ModalContent>
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <p>Are you sure you want to delete {itemName}?</p>
          <RadioGroup onChange={(value) => setDeleteFrom(value as 'slack' | 'app' | 'both')} value={deleteFrom}>
            <Stack>
              <Radio value="slack">Delete from Slack only</Radio>
              <Radio value="app">Delete from SlackShots only</Radio>
              <Radio value="both">Delete from both</Radio>
            </Stack>
          </RadioGroup>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={() => onConfirm(deleteFrom)}>
            Delete
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeletionConfirmation;