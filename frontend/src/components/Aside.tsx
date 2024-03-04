import React, { useState, useEffect } from "react";
import * as uuid from "uuid";
import { HStack, VStack, Spacer, Box, Text, Divider } from "@chakra-ui/react";
import ChannelSelector from "./ChannelSelector";
import FolderSelector from "./FolderSelector";
import MessageBatchSize from "./MessageBatchSize";
import FileTypesSelector from "./FileTypesSelector";
import UploadComment from "./UploadComment";
import UploadButton from "./UploadButton";

interface FormState {
  files: FileList | null;
  channel: string;
  userID: string;
  uploadComment: string;
  messageBatchSize: number;
  sessionID: string;
}

type Channel = { value: string; label: string };

const Aside: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false); // For disabling the upload button while uploading
  const [startUpload, setStartUpload] = useState(false); // For starting the upload after the session ID is set
  const [channels, setChannels] = useState<Channel[]>([]); // For storing the fetched list of channels
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([
    ".jpg",
  ]); // For storing the selected file types
  const [fileSelection, setFileSelection] = useState<string>(""); // For displaying what files are selected
  const [formState, setFormState] = useState<FormState>({
    // For storing the state to be sent to the server
    files: null,
    channel: "",
    messageBatchSize: 10,
    uploadComment: "",
    userID: "0001",
    sessionID: "",
  });

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (startUpload && formState.sessionID) {
      performUpload();
      setStartUpload(false); // Reset the flag after starting the upload
    }
  }, [formState.sessionID, startUpload]);

  const fetchChannels = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/getChannels");
      const data = await response.json();
      const formattedChannels: Channel[] = data.map(
        (channel: [string, string]) => ({
          value: channel[0], // Channel ID
          label: channel[1], // Channel Name
        }),
      );
      setChannels(formattedChannels);
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  };

  // Set the form state with the selected FileList
  const handleFolderSelection = (files: FileList | null): void => {
    setFormState((prevState) => ({
      ...prevState,
      files,
    }));
  };

  // Set the form state with the selected channel
  const handleChannelSelection = (channelId: string) => {
    setFormState((prevState) => ({
      ...prevState,
      channel: channelId,
    }));
  };

  // Set the form state with the upload comment
  const handleCommentChange = (uploadComment: string) => {
    setFormState((prevState) => ({
      ...prevState,
      uploadComment,
    }));
  };

  const handleMessageBatchSizeChange = (messageBatchSize: number) => {
    setFormState((prevState) => ({
      ...prevState,
      messageBatchSize,
    }));
  };

  // Upload the files to the server
  const handleFileUpload = async (): Promise<void> => {
    setIsUploading(true);
    const newSessionID = uuid.v4();
    setFormState((prevState) => ({
      ...prevState,
      sessionID: newSessionID,
    }));
    setStartUpload(true);
  };

  const performUpload = async () => {
    console.log("Performing upload with session ID:", formState.sessionID);
        const maxBatchSize = 100 * 1024 * 1024; // 100 MB
      let currentBatchSize = 0;
      let currentBatch: File[] = [];
      const batches: File[][] = [];

      const filteredFiles = Array.from(formState.files ?? []).filter((file) =>
        file.name.toLowerCase().endsWith(selectedFileTypes.join(",")),
      );

      for (const file of filteredFiles) {
        if (currentBatchSize + file.size > maxBatchSize) {
          batches.push(currentBatch);
          currentBatch = [];
          currentBatchSize = 0;
        }
        currentBatch.push(file);
        currentBatchSize += file.size;
      }

      if (currentBatch.length > 0) {
        batches.push(currentBatch);
      }

      // Uploads last batch of files. This endpoint intiates file processing on the server
      const uploadLastBatch = async (files: File[]) => {
        const formData = new FormData();
        formData.append("channel", formState.channel);
        formData.append("userID", formState.userID);
        formData.append("sessionID", formState.sessionID);
        formData.append("comment", formState.uploadComment);
        formData.append("messageBatchSize", formState.messageBatchSize.toString());
        files.forEach((file) => {
          formData.append("files", file, file.name);
        });

        try {
          const response = await fetch(
            "http://localhost:3000/api/uploadFinalFiles",
            {
              method: "POST",
              body: formData,
            },
          );

          if (!response.ok) {
            throw new Error(await response.text());
          }
        } catch (error) {
          console.error("Error uploading final batch:", error);
        }
      };

      const uploadBatch = async (files: File[]) => {
        const formData = new FormData();
        formData.append("channel", formState.channel);
        formData.append("userID", formState.userID);
        formData.append("sessionID", formState.sessionID);
        formData.append("comment", formState.uploadComment);
        formData.append("messageBatchSize", formState.messageBatchSize.toString());
        files.forEach((file) => {
          formData.append("files", file, file.name);
        });

        try {
          const response = await fetch(
            "http://localhost:3000/api/uploadFiles",
            {
              method: "POST",
              body: formData,
            },
          );

          if (!response.ok) {
            throw new Error(await response.text());
          }
        } catch (error) {
          console.error("Error uploading batch:", error);
        }
        console.log("Batch uploaded successfully!");
      };

      for (let i = 0; i < batches.length; i++) {
        if (i === batches.length - 1) {
          await uploadLastBatch(batches[i]);
          setIsUploading(false);
        } else {
          await uploadBatch(batches[i]);
        }
      }

      console.log("All batches uploaded successfully!");
    } 



  return (
    <HStack
      spacing={4}
      align="stretch"
      height="full"
      justify="space-around"
      paddingY={3}
      position="relative"
      zIndex={1}
      boxShadow="0px -4px 4px rgba(0, 0, 0, 1)"
    >
      <VStack
        align="stretch"
        height="full"
        justify="space-around"
        width="15rem"
        pl="2.5rem"
      >
        <Text color="white" fontSize="18px" fontWeight="bold">
          Files: {fileSelection}{" "}
        </Text>
        <Box alignSelf="flex-start">
          <FolderSelector
            onFileChange={handleFolderSelection}
            acceptedFileTypes={selectedFileTypes}
            returnFileSelection={setFileSelection}
          />
        </Box>
      </VStack>
      <VStack
        align="stretch"
        height="full"
        justify="space-around"
        width="15rem"
      >
        <Text
          alignSelf="flex-start"
          color="white"
          fontSize="18px"
          fontWeight="bold"
        >
          Channel:
        </Text>
        <Box mt="1rem">
          <ChannelSelector
            channels={channels}
            onChannelChange={handleChannelSelection}
          />
        </Box>
      </VStack>
      <VStack
        align="stretch"
        height="full"
        justify="space-around"
        width="15rem"
      >
        <Text
          alignSelf="flex-start"
          color="white"
          fontSize="18px"
          fontWeight="bold"
        >
          Message Batch Size:
        </Text>
        <Box>
          <MessageBatchSize
            onMessageBatchSizeChange={handleMessageBatchSizeChange}
          />
        </Box>
      </VStack>
      <VStack
        align="stretch"
        height="full"
        justify="space-around"
        width="15rem"
      >
        <Text
          alignSelf="flex-start"
          color="white"
          fontSize="18px"
          fontWeight="bold"
        >
          File Types:
        </Text>
        <Box mt="1rem">
          <FileTypesSelector
            selectedFileTypes={selectedFileTypes}
            onSelectFileTypes={setSelectedFileTypes}
          />
        </Box>
      </VStack>
      <Box width="20%" alignSelf="flex-end">
        <UploadComment onCommentChange={handleCommentChange} />
      </Box>
      <Spacer />
      <Divider orientation="vertical" />
      <Box width="20%" alignSelf="center" mr="1.2rem" mt="1.2rem">
        <UploadButton
          disabled={!formState.files || !formState.channel || isUploading}
          onUpload={handleFileUpload}
        />
      </Box>
    </HStack>
  );
};

export default Aside;
