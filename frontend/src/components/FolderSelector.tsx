import React, { useState } from 'react';
import { Button, Input, VStack, Text, Flex, Divider } from '@chakra-ui/react';

interface FolderSelectorProps {
  onFileChange: (files: FileList | null) => void;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({ onFileChange }) => {
  const [selectionName, setSelectionName] = useState<string>('');

  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length) {
      const folderPath = files[0].webkitRelativePath;
      const dirName = folderPath.split('/')[0];
      setSelectionName(`Folder: ${dirName}`);
      onFileChange(files);
    } else {
      setSelectionName('');
    }
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length) {
      setSelectionName(`Files: ${files.length} selected`);
      onFileChange(files);
    } else {
      setSelectionName('');
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="lg" color="white">{selectionName || "Select Folder or Files"}</Text>
      <Flex direction={{ base: "column", md: "row" }} align="center" justify="center">
        <Button
          as="label"
          htmlFor="folderInput"
          variant="outline"
          color={"white"}
          _hover={{ bg: '#aad2d2', color: 'black'}}
          size="md"
          cursor="pointer"
          flex="1"
        >
          Choose Folder
        </Button>
        <Divider orientation="vertical" m={2} colorScheme="purple" />
        <Button
          as="label"
          htmlFor="filesInput"
          variant="solid"
          colorScheme="purple"
          _hover={{ bg: 'purple.600' }}
          size="md"
          cursor="pointer"
          flex="1"
        >
          Choose Files
        </Button>
      </Flex>
      <Input
        type="file"
        id="folderInput"
        webkitdirectory="true"
        directory=""
        style={{ display: 'none' }}
        onChange={handleFolderChange}
        accept="image/*"
      />
      <Input
        type="file"
        id="filesInput"
        multiple
        style={{ display: 'none' }}
        onChange={handleFilesChange}
        accept="image/*"
      />
    </VStack>
  );
};

export default FolderSelector;
