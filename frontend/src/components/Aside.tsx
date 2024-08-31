import React, { useState, useEffect, useContext } from "react";
import * as uuid from "uuid";
import { Stack, VStack, Spacer, Box, Text, Divider, SimpleGrid } from "@chakra-ui/react";
import ChannelSelector from "./ChannelSelector";
import FolderSelector from "./FolderSelector";
import MessageBatchSize from "./MessageBatchSize";
import FileTypesSelector from "./FileTypesSelector";
import UploadComment from "./UploadComment";
import UploadButton from "./UploadButton";
import AuthContext from "../context/AuthContext";

interface FormState {
  files: FileList | null;
  channel: string;
  uploadComment: string;
  messageBatchSize: number;
  sessionID: string;
}

type Channel = { value: string; label: string };

const Aside: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [startUpload, setStartUpload] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([".jpg"]);
  const [fileSelection, setFileSelection] = useState<string>("");
  const [formState, setFormState] = useState<FormState>({
    // For storing the state to be sent to the server
    files: null,
    channel: "",
    messageBatchSize: 10,
    uploadComment: "",
    sessionID: "",
  });

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (startUpload && formState.sessionID) {
      performUpload();
      setStartUpload(false);
    }
  }, [formState.sessionID, startUpload]);

  const { accessToken } = useContext(AuthContext);

  const fetchChannels = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/getChannels`, {headers: {
        Authorization: `Bearer ${accessToken}`,
      },});
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

  const handleChannelSelection = (channelId: string) => {
    setFormState((prevState) => ({
      ...prevState,
      channel: channelId,
    }));
  };

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
    const maxBatchSize = 9 * 1024 * 1024; // 9 MB
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
      formData.append("sessionID", formState.sessionID);
      formData.append("comment", formState.uploadComment);
      formData.append(
        "messageBatchSize",
        formState.messageBatchSize.toString(),
      );
      files.forEach((file) => {
        formData.append("files", file, file.name);
      });

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/uploadFinalFiles`,
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
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
      formData.append("sessionID", formState.sessionID);
      formData.append("comment", formState.uploadComment);
      formData.append(
        "messageBatchSize",
        formState.messageBatchSize.toString(),
      );
      files.forEach((file) => {
        formData.append("files", file, file.name);
      });

      try {
        const response = await fetch(`${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/uploadFiles`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

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
  };

  return (
    <Stack
      spacing={4}
      align="stretch"
      height="full"
      width="full"
      justify="space-around"
      paddingY={3}
      paddingX={2}
      position="relative"
      zIndex={1}
      direction={{ base: "column", md: "row" }}
    >
      {/* For base (mobile) screens */}
      <SimpleGrid
        columns={{ base: 2, md: 1 }}
        spacing={4}
        width="full"
        alignItems="start"
        display={{ base: "grid", md: "none" }}
      >
        {/* Files and Channel Selectors */}
        <VStack align="stretch">
          <Text color="white" fontSize="18px" fontWeight="bold">
            Files: {fileSelection}
          </Text>
          <Box alignSelf="flex-start">
            <FolderSelector
              onFileChange={handleFolderSelection}
              acceptedFileTypes={selectedFileTypes}
              returnFileSelection={setFileSelection}
            />
          </Box>
        </VStack>

        <VStack align="stretch">
          <Text color="white" fontSize="18px" fontWeight="bold">
            Channel:
          </Text>
          <Box>
            <ChannelSelector
              channels={channels}
              onChannelChange={handleChannelSelection}
            />
          </Box>
        </VStack>

        {/* Message Batch Size and File Types Selectors */}
        <VStack align="stretch">
          <Text color="white" fontSize="18px" fontWeight="bold">
            Message Batch Size:
          </Text>
          <Box>
            <MessageBatchSize
              onMessageBatchSizeChange={handleMessageBatchSizeChange}
            />
          </Box>
        </VStack>

        <VStack align="stretch">
          <Text color="white" fontSize="18px" fontWeight="bold">
            File Types:
          </Text>
          <Box>
            <FileTypesSelector
              selectedFileTypes={selectedFileTypes}
              onSelectFileTypes={setSelectedFileTypes}
            />
          </Box>
        </VStack>
      </SimpleGrid>

      {/* Rest of layout for larger screens */}
      <VStack
        align="stretch"
        height="full"
        justify="space-around"
        width={{ base: "100%", md: "15rem" }}
        pl={{ base: "0", md: "2.5rem" }}
        display={{ base: "none", md: "flex" }}
      >
        <Text color="white" fontSize="18px" fontWeight="bold">
          Files: {fileSelection}
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
        width={{ base: "100%", md: "15rem" }}
        display={{ base: "none", md: "flex" }}
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
        width={{ base: "100%", md: "15rem" }}
        display={{ base: "none", md: "flex" }}
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
        width={{ base: "100%", md: "15rem" }}
        display={{ base: "none", md: "flex" }}
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

      {/* Comment and Upload Section */}
      <Box width={{ base: "100%", md: "20%" }} alignSelf="flex-end">
        <UploadComment onCommentChange={handleCommentChange} />
      </Box>

      <Spacer display={{ base: "none", md: "block" }} />
      <Divider display={{ base: "none", md: "block" }} orientation="vertical" />

      <Box
        width={{ base: "100%", md: "20%" }}
        alignSelf={{ base: "center", md: "center" }}
        mr={{ base: 0, md: "1.2rem" }}
        mt={{ base: 0, md: "1.2rem" }}
      >
        <UploadButton
          loading={isUploading}
          disabled={!formState.files || !formState.channel}
          onUpload={handleFileUpload}
        />
      </Box>
    </Stack>
  );
};

export default Aside;
