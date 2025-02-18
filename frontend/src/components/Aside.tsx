import * as uuid from "uuid";
import { Upload } from "tus-js-client";
import UploadButton from "./UploadButton";
import UploadComment from "./UploadComment";
import FolderSelector from "./FolderSelector";
import { useAddBot } from "../hooks/useAddBot";
import ChannelSelector from "./ChannelSelector";
import AuthContext from "../context/AuthContext";
import MessageBatchSize from "./MessageBatchSize";
import { useChannels } from "../hooks/useChannels";
import FileTypesSelector from "./FileTypesSelector";
import React, { useState, useEffect, useContext, useCallback } from "react";
import { Stack, VStack, Spacer, Box, Button, Text, Divider, SimpleGrid, Popover, PopoverTrigger, PopoverContent, PopoverBody, HStack, PopoverHeader, useToast, Progress } from "@chakra-ui/react";
interface FormState {
  files: FileList | null;
  channel: string;
  uploadComment: string;
  messageBatchSize: number;
  sessionID: string;
}

interface AsideProps {
  formState: FormState;
  setFormState: (newState: Partial<FormState>) => void;
  isUploading: boolean;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  startUpload: boolean;
  setStartUpload: React.Dispatch<React.SetStateAction<boolean>>;
  setUploadComplete: React.Dispatch<React.SetStateAction<boolean>>;
  setUploadAttempted: React.Dispatch<React.SetStateAction<boolean>>;
}

const MAX_FILE_BATCH_SIZE = 9 * 1024 * 1024; // 9 MB

const Aside: React.FC<AsideProps> = ({ formState, setFormState, isUploading, setIsUploading, startUpload, setStartUpload, setUploadComplete, setUploadAttempted }) => {
  const { data: channels, /*isLoading: channelsLoading, error: channelsError, refetch: refetchChannels*/} = useChannels();
  const addBotMutation = useAddBot();
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([".jpg"]);
  const [fileSelection, setFileSelection] = useState<string>("");
  const [showProgress, setShowProgress] = useState<boolean>(false);
  const [currentUpload, setCurrentUpload] = useState<{ abort: () => void } | null>(null);
  const [clientProgress, setClientProgress] = useState(0);
  const [serverProgress, setServerProgress] = useState(0);

  const { accessToken } = useContext(AuthContext);

  const toast = useToast();

  const checkFileSizes = useCallback((files: File[]) => {
    const uploadableFiles = files.filter(file => file.size <= MAX_FILE_BATCH_SIZE);
    const largeFiles = files.filter(file => file.size > MAX_FILE_BATCH_SIZE).map(file => file.name);

  
    if (largeFiles.length > 0) {
      toast({
        title: "Single File Size Limit: 9 MB",
        description: `The following files are larger than 9MB and can't be uploaded at the moment: ${largeFiles.join(", ")}. Support for larger files will be added soon!`,
        status: "warning",
        isClosable: true,
        duration: null,
      });

      if (uploadableFiles.length > 0) {
        toast({
          title: "Uploadable Files",
          description: `The following files will be uploaded: ${uploadableFiles.map(file => file.name).join(", ")}`,
          status: "info",
          isClosable: true,
          duration: null,
        });
      }
    }

    return { uploadableFiles, largeFiles };
  }, [toast]);

  const performUploads = useCallback((files: File[], sessionID: string) => {

    const { uploadableFiles } = checkFileSizes(files)

    uploadableFiles.forEach((file) => {
      const upload = new Upload(file, {
      endpoint: `${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/files/`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      metadata: {
        filename: file.name,
        filetype: file.type,
        sessionID,
        channel: formState.channel,
        comment: formState.uploadComment,
        messageBatchSize: formState.messageBatchSize.toString(),
      },
      retryDelays: [0, 1000, 3000, 5000],
      onError: (error) => {
        console.error("Tus upload error:", error);
        toast({
        title: "Upload Failed",
        description: `Error: ${error.message || JSON.stringify(error)}`,
        status: "error",
        isClosable: true,
        });
        setIsUploading(false);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const progress = (bytesUploaded / bytesTotal) * 100;
        setClientProgress(progress);
      },
      onSuccess: () => {
        console.log("Upload complete, file available at: " + upload.url);
        toast({
        title: "Upload Successful",
        description: `File "${file.name}" uploaded successfully.`,
        status: "success",
        isClosable: true,
        });
        setUploadComplete(true);
        setIsUploading(false);
      },
      });
      setCurrentUpload(upload);
      upload.start();
    });
  }, [checkFileSizes, formState.channel, formState.uploadComment, formState.messageBatchSize, toast, setIsUploading, setUploadComplete, accessToken]);


  const handleFolderSelection = (files: FileList | null): void => {
    setFormState({ files });
  };
  
  const handleChannelSelection = (channel: string) => {
    setFormState({ channel });
  };
  
  const handleCommentChange = (uploadComment: string) => {
    setFormState({ uploadComment });
  };
  
  const handleMessageBatchSizeChange = (messageBatchSize: number) => {
    setFormState({ messageBatchSize });
  };

  const handleAddBot = async (channelId: string) => {
    try {

      await addBotMutation.mutateAsync(channelId);

      toast({
        title: "Slackshots Added",
        description: "Slackshots has been successfully added to the channel.",
        status: "success",
        duration: null,
        isClosable: true,
        position: "top",
      });

    } catch (error) {

      toast({
        title: "Failed To Add Slackshots",
        description: "There was an error adding Slackshots to the channel.",
        status: "error",
        duration: null,
        isClosable: true,
        position: "top",
      });

    }
  };

  if (currentUpload) {
    console.log("Current Upload")
  }

  const handleFileUpload = useCallback(() => {
    setIsUploading(true);
    setUploadAttempted(true);
    const newSessionID = uuid.v4();
    setFormState({ sessionID: newSessionID });
    const filesArray = Array.from(formState.files ?? []);
    performUploads(filesArray, newSessionID);
  }, [formState.files, setFormState, setIsUploading, setUploadAttempted, performUploads]);

  useEffect(() => {
    if (startUpload && formState.sessionID) {
      const filesArray = Array.from(formState.files ?? []);
      performUploads(filesArray, formState.sessionID);
      setStartUpload(false);
    }
  }, [formState.files, formState.sessionID, performUploads, setStartUpload, startUpload]);


  useEffect(() => {
    if (isUploading) {
      setShowProgress(true);
    } else {
        setClientProgress(100);
        setServerProgress(100);
      const timer = setTimeout(() => {
        setShowProgress(false)
        setClientProgress(0);
        setServerProgress(0);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isUploading]);

  return (
    <>
    <Box
      height={showProgress ? "8px" : "0px"}
      transition="height 0.3s ease-in-out"
      overflow="hidden"
    >
      <Progress
        hasStripe
        value={(clientProgress + serverProgress) / 2}
        max={100}
        isAnimated
        colorScheme="green"
        height="8px"
      />
    </Box>
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
          <HStack>
          <Text color="white" fontSize="18px" fontWeight="bold">
            Channel:
          </Text>
          <Popover placement="top" size="xl">
            <PopoverTrigger>
              <Button size="xs" bgGradient="linear(to bottom right, #181818, #282828)" color="white" borderRadius={20} border="1px solid #282828" _hover={{border: "1px solid white"}} boxShadow="4px 4px 4px rgba(0, 0, 0, 0.5)" aria-label="Channel Seletector Info Popover">
                ?
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              bgGradient="linear(to bottom right, #080808, #202020)" 
              color="white" 
              border="2px solid #282828"
              boxShadow="4px 4px 4px rgba(0, 0, 0, 0.5)"
              mr={8}
            >
              <PopoverHeader border="0"><Text color="white" fontSize="18px" fontWeight="bold">Add SlackShots To Channel</Text></PopoverHeader>
              <PopoverBody justifyContent="center" textAlign="center">To upload files to a channel, SlackShots must first be added to it. Click the "+" next to a disabled channel or manually add the bot to the channel.</PopoverBody>
            </PopoverContent>
          </Popover>
          </HStack>
          <Box>
            <ChannelSelector
              channels={channels}
              onChannelChange={handleChannelSelection}
              onAddBot={handleAddBot}
              loadingBotChannels={addBotMutation.isPending}
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
        <HStack>
          <Text color="white" fontSize="18px" fontWeight="bold">
            Channel:
          </Text>
          <Popover placement="top" size="xl" matchWidth>
            <PopoverTrigger>
              <Button size="xs" bgGradient="linear(to bottom right, #181818, #282828)" color="white" borderRadius={20} border="1px solid #282828" _hover={{border: "1px solid white"}} boxShadow="4px 4px 4px rgba(0, 0, 0, 0.5)" aria-label="Channel Seletector Info Popover">
                ?
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              bgGradient="linear(to bottom right, #080808, #202020)" 
              color="white" 
              border="2px solid #282828"
              boxShadow="4px 4px 4px rgba(0, 0, 0, 0.5)"
              mr={8}
            >
              <PopoverHeader border="0"><Text color="white" fontSize="18px" fontWeight="bold">Add SlackShots To Channel</Text></PopoverHeader>
              <PopoverBody justifyContent="center" textAlign="center">To upload files to a channel, SlackShots must first be added to it. Click the "+" next to a disabled channel or manually add the bot to the channel.</PopoverBody>
            </PopoverContent>
          </Popover>
          </HStack>
        <Box mt="1rem">
          <ChannelSelector
            channels={channels}
            onChannelChange={handleChannelSelection}
            onAddBot={handleAddBot}
            loadingBotChannels={addBotMutation.isPending}
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
    </>
  );
};

export default Aside;
