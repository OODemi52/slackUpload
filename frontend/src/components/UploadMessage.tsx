import React, { useState } from 'react';
import { Box, Textarea, Button } from '@chakra-ui/react';

interface UploadMessageProps {
  onMessageSend: (message: string) => void;
}

const UploadMessage: React.FC<UploadMessageProps> = ({ onMessageSend }) => {
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = () => {
    onMessageSend(message);
    setMessage('');
  };

  return (
    <Box>
      <Textarea
        value={message}
        onChange={handleChange}
        placeholder="Type your message here..."
        size="sm"
        resize="vertical"
        bg="white"
        borderColor="purple.500"
        _hover={{ borderColor: 'purple.600' }}
        _focus={{ borderColor: 'purple.700', boxShadow: '0 0 0 1px purple.700' }}
        borderRadius={5}
      />
    </Box>
  );
};

export default UploadMessage;
