import React, { useState } from 'react';
import { VStack, Heading, Button, Spacer } from '@chakra-ui/react';
import ChannelSelector from './ChannelSelector';
import FolderSelector from './FolderSelector';
import MessageLength from './MessageLength';
import FileTypesSelector from './FileTypesSelector';
import UploadMessage from './UploadMessage';

interface AppState {
  dirName: string;
  files: FileList | null;
  channel: string;
}

const Sidebar = () => {
  const [state, setState] = useState<AppState>({
    dirName: '',
    files: null,
    channel: '',
  });

  const handleFolderChange = (dirName: string, files: FileList | null) => {
    setState((prevState) => ({
      ...prevState,
      dirName,
      files,
    }));
  };

  const handleChannelChange = (channelId: string) => {
    setState((prevState) => ({
      ...prevState,
      channel: channelId,
    }));
  };

  const handleFileUpload = async () => {
    // Will add later
  };

  return (
    <VStack
      spacing={4}
      align="stretch"
      height="full"
      p={5}
      justifyContent="space-between"
    >
      <VStack spacing={4} align="stretch">
        <Heading size="md" pb={2}>
          Upload Settings
        </Heading>
        <FolderSelector onFolderChange={handleFolderChange} />
        <ChannelSelector onChannelChange={handleChannelChange} />
      </VStack>
      <VStack spacing={4} align="stretch">
        <MessageLength />
        <FileTypesSelector />
        <UploadMessage onMessageSend={(message) => console.log(message)} />
      </VStack>
      
      <Spacer />
      <Button
        colorScheme="blue"
        isDisabled={!state.dirName || !state.channel}
        onClick={handleFileUpload}
        width="full"
      >
        Upload
      </Button>
    </VStack>
  );
};

export default Sidebar;
