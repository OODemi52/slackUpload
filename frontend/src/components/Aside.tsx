import React, { useState, useEffect, useContext, useCallback } from "react";
import * as uuid from "uuid";
import { Stack, VStack, Spacer, Box, Button, Text, Divider, SimpleGrid, Popover, PopoverTrigger, PopoverContent, PopoverBody, HStack, PopoverHeader, useToast, Progress } from "@chakra-ui/react";
import ChannelSelector from "./ChannelSelector";
import FolderSelector from "./FolderSelector";
import MessageBatchSize from "./MessageBatchSize";
import FileTypesSelector from "./FileTypesSelector";
import UploadComment from "./UploadComment";
import UploadButton from "./UploadButton";
import AuthContext from "../context/AuthContext";
import { useChannels } from "../hooks/useChannels";
import { useAddBot } from "../hooks/useAddBot";

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
  const [maxClientProgress, setMaxClientProgress] = useState(0);

  const { accessToken } = useContext(AuthContext);

  const toast = useToast();


  const checkFileSizes = useCallback((files: File[]) => {
    const uploadableFiles = files.filter(file => file.size <= MAX_FILE_BATCH_SIZE);
    const largeFiles = files.filter(file => file.size > MAX_FILE_BATCH_SIZE).map(file => file.name);
    return { uploadableFiles, largeFiles };
  }, []);

  const createBatches = useCallback( (files: File[]): File[][] => {
    const batches: File[][] = [];
    let currentBatch: File[] = [];
    let currentBatchSize = 0;

    files.forEach(file => {
      if (currentBatchSize + file.size > MAX_FILE_BATCH_SIZE) {
        batches.push(currentBatch);
        currentBatch = [];
        currentBatchSize = 0;
      }
      currentBatch.push(file);
      currentBatchSize += file.size;
    });

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  },[]);

  const createFormData = useCallback( (files: File[], formState: FormState) => {
    const formData = new FormData();
    formData.append("channel", formState.channel);
    formData.append("sessionID", formState.sessionID);
    formData.append("comment", formState.uploadComment);
    formData.append("messageBatchSize", formState.messageBatchSize.toString());
    files.forEach((file) => {
      formData.append("files", file, file.name);
    });
    return formData;
  }, []);

  const uploadBatch = useCallback( async (files: File[]) => {

    const formData = createFormData(files, formState);
  
    return new Promise<{ abort: () => void }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/uploadFiles`, true);
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve({ abort: () => xhr.abort() });
        } else {
          reject(new Error(xhr.responseText));
        }
      };
  
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setMaxClientProgress(prevProgress => Math.max(prevProgress, progress));
          setClientProgress(maxClientProgress);
        }
      };
  
      xhr.onerror = () => reject(new Error('Network error'));
  
      xhr.send(formData);
  
      resolve({
        abort: () => {
          xhr.abort();
          reject(new Error('Upload cancelled'));
        }
      });

  })
  }, [accessToken, createFormData, formState, maxClientProgress]);

  const uploadLastBatch = useCallback( async (files: File[]) => {
    
    const formData = createFormData(files, formState);

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
  }, [accessToken, createFormData, formState]);

  const uploadBatches = useCallback( async (batches: File[][]) => {
    for (let i = 0; i < batches.length; i++) {
      try {
        if (i === batches.length - 1) {
          await uploadLastBatch(batches[i]);
        } else {
          const upload = await uploadBatch(batches[i]);
          setCurrentUpload(upload);
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'Upload cancelled') {
          toast({
            title: "Upload Cancelled",
            description: `User cancelled the upload process.`,
            status: "info",
            isClosable: true,
            duration: 5000,
          });
          break;
        } else {
          throw new Error(`Error uploading batches ${error}`);
        }
      }
    }
  }, [toast, uploadBatch, uploadLastBatch])

  const startProgressStream = useCallback(async (sessionID: string) => {
    const response = await fetch(`${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/uploadProgress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ sessionID })
    });
  
    if (!response.body) {
      console.error("Response body is undefined");
      return;
    }
  
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      
      if (value) {
        const messages = value.split('\n\n').filter(msg => msg.trim() !== '');
        for (const message of messages) {
          if (message.startsWith('data: ')) {
            try {
              const data = JSON.parse(message.slice(6));
              if (data.type === 'progress') {
                setServerProgress(data.progress);
              } else if (data.type === 'complete') {
                console.log('Upload complete signal received');
                setIsUploading(false);
                setUploadComplete(true);
                break;
              }
            } catch (error) {
              console.error("Error parsing SSE message:", error);
            }
          }
        }
      }
    }
  
    reader.releaseLock();
  }, [accessToken, setIsUploading, setUploadComplete]);

    /* Will implement after SSE is confirmed to be working
  const cancelUpload = useCallback(() => {
    if (currentUpload) {
      currentUpload.abort();
      setClientProgress(0);
        setServerProgress(0);
    }
  }, [currentUpload, setIsUploading]);
  */

  const performUpload = useCallback(async () => {
  
    const filteredFiles = Array.from(formState.files ?? []).filter((file) =>
      file.name.toLowerCase().endsWith(selectedFileTypes.join(","))
    );
  
    const { uploadableFiles, largeFiles } = checkFileSizes(filteredFiles);
  
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

    const batches = createBatches(uploadableFiles);

    try {
      await uploadBatches(batches);
      setCurrentUpload(null);
      console.log("All batches uploaded successfully!");
    } catch (error) {
      throw new Error(`Error uploading files ${error}`)
    }

}, [formState.files, checkFileSizes, createBatches, selectedFileTypes, toast, uploadBatches]);


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
  
  const handleFileUpload = useCallback(() => {
    setIsUploading(true);
    setUploadAttempted(true);
    const newSessionID = uuid.v4();
    setFormState({ sessionID: newSessionID });
    setStartUpload(true);
    startProgressStream(newSessionID);
  }, [setIsUploading, setUploadAttempted, setFormState, setStartUpload, startProgressStream]);

  if (currentUpload) {
    console.log("Current Upload")
  }

  useEffect(() => {
    if (startUpload && formState.sessionID) {
      performUpload();
      setStartUpload(false);
    }
  }, [formState.sessionID, performUpload, setStartUpload, startUpload]);


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
