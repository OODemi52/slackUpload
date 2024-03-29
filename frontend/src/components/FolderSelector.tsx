import React from "react";
import { Button, Input, VStack, Flex, Divider } from "@chakra-ui/react";

declare module "react" {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
    e?: string;
  }
}

interface FolderSelectorProps {
  onFileChange: (files: FileList | null) => void;
  acceptedFileTypes: string[];
  returnFileSelection: (fileSelection: string) => void;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({
  onFileChange,
  acceptedFileTypes,
  returnFileSelection,
}) => {
  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files && files.length) {
      const immediateFiles = Array.from(files).filter((file) => {
        const pathParts = file.webkitRelativePath.split("/");
        return (
          pathParts.length === 2 &&
          acceptedFileTypes.some((type) =>
            file.name.toLowerCase().endsWith(type),
          )
        );
      });

      // Data transfer is used to make a FileList
      const dataTransfer = new DataTransfer();
      immediateFiles.forEach((file) => dataTransfer.items.add(file));
      const immediateFileList = dataTransfer.files;

      if (immediateFiles.length > 0) {
        returnFileSelection(`${immediateFileList.length} selected`);
      } else {
        returnFileSelection("0 selected");
      }

      onFileChange(immediateFileList);
    } else {
      onFileChange(null);
    }
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length) {
      returnFileSelection(`${files.length} selected`);
      onFileChange(files);
    } else {
      onFileChange(null);
    }
    console.log(files);
  };

  return (
    <VStack>
      <Flex direction="column" align="center" justify="center" height="full">
        <Button
          as="label"
          htmlFor="folderInput"
          variant="solid"
          color="white"
          bgGradient="linear(to top, #5f43b2, #8c73e9)"
          border="1px solid #b3b3b3"
          _hover={{ bg: "purple.600" }}
          size="lg"
          cursor="pointer"
          height="2.5rem"
          width="10rem"
        >
          Choose Folder
        </Button>
        <Divider
          orientation="horizontal"
          my={1}
          w="10rem"
          colorScheme="purple"
        />
        <Button
          as="label"
          htmlFor="filesInput"
          variant="solid"
          color="white"
          bgGradient="linear(to top, #5f43b2, #8c73e9)"
          border="1px solid #b3b3b3"
          _hover={{ bg: "purple.600" }}
          size="lg"
          cursor="pointer"
          height="2.5rem"
          width="10rem"
        >
          Choose Files
        </Button>
      </Flex>
      <Input
        type="file"
        id="folderInput"
        webkitdirectory="true"
        directory=""
        style={{ display: "none" }}
        onChange={handleFolderChange}
        accept={acceptedFileTypes.join(",")}
      />
      <Input
        type="file"
        id="filesInput"
        multiple
        style={{ display: "none" }}
        onChange={handleFilesChange}
        accept={acceptedFileTypes.join(",")}
      />
    </VStack>
  );
};

export default FolderSelector;
