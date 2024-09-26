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

interface Channel { 
  value: string;
  label: string;
  isMember: boolean;
}

const Aside: React.FC<AsideProps> = ({ formState, setFormState, isUploading, setIsUploading, startUpload, setStartUpload, setUploadComplete, setUploadAttempted }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([".jpg"]);
  const [fileSelection, setFileSelection] = useState<string>("");
  const [loadingBotChannels, setLoadingBotChannels] = useState<{ [key: string]: boolean }>({});
  const [showProgress, setShowProgress] = useState<boolean>(false);
  const [currentUpload, setCurrentUpload] = useState<{ abort: () => void } | null>(null);
  const [clientProgress, setClientProgress] = useState(0);
  const [serverProgress, setServerProgress] = useState(0);

  const { accessToken } = useContext(AuthContext);

  const toast = useToast();

  const fetchChannels = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/getChannels`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      const formattedChannels: Channel[] = data.map(
      (channel: { id: string, name: string, isMember: boolean }) => ({
        value: channel.id,
        label: channel.name,
        isMember: channel.isMember,
      }),
    );
      setChannels(formattedChannels);
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  }, [accessToken]);
  
    useEffect(() => {
        fetchChannels();
    }, [accessToken, fetchChannels]);

  const handleAddBot = async (channelId: string) => {
    setLoadingBotChannels(prev => ({ ...prev, [channelId]: true }));
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/addBotToChannel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ channelId }),
      });
  
      if (response.ok) {
        fetchChannels();
      } else {
        console.error('Failed to add bot to channel');
      }

      toast({
        title: "Slackshots Added",
        description: "Slackshots has been successfully added to the channel.",
        status: "success",
        duration: null,
        isClosable: true,
        position: "top",
      });

    } catch (error) {
      console.error('Error adding bot to channel:', error);

      toast({
        title: "Failed To Add Slackshots",
        description: "There was an error adding Slackshots to the channel.",
        status: "error",
        duration: null,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoadingBotChannels(prev => ({ ...prev, [channelId]: false }));
    }
  };

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
  
  const handleFileUpload = async (): Promise<void> => {
    setIsUploading(true);
    setUploadAttempted(true);
    const newSessionID = uuid.v4();
    setFormState({ sessionID: newSessionID });
    setStartUpload(true);
    startSSE(newSessionID);
  };

  const checkFileSizes = (files: File[]) => {
    const maxFileSize = 9 * 1024 * 1024; // 9 MB
    const uploadableFiles: File[] = [];
    const largeFiles: string[] = [];
  
    files.forEach(file => {
      if (file.size <= maxFileSize) {
        uploadableFiles.push(file);
      } else {
        largeFiles.push(file.name);
      }
    });

    console.log("Checked file sizes")
    return { uploadableFiles, largeFiles };
  };

  const startSSE = useCallback(async (sessionID: string) => {
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
  if (currentUpload) {
    console.log("Current Upload")
  }


  const performUpload = useCallback(async () => {
    console.log("Performing upload with session ID:", formState.sessionID);

    const maxBatchSize = 9 * 1024 * 1024; // 9 MB
    let maxClientProgress= 0;
  
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
  
    let currentBatchSize = 0;
    let currentBatch: File[] = [];
    const batches: File[][] = [];
  
    for (const file of uploadableFiles) {
      if (currentBatchSize + file.size > maxBatchSize) {
        batches.push(currentBatch);
        currentBatch = [];
        currentBatchSize = 0;
      }
      currentBatch.push(file);
      currentBatchSize += file.size;
      console.log("Pushed a batch")
    }
  
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

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
    
      return new Promise<{ abort: () => void }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/uploadFiles`, true);
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            maxClientProgress = Math.max(maxClientProgress, progress);
            console.log("Client progress", maxClientProgress);
            setClientProgress(maxClientProgress);
          }
        };
    
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve({ abort: () => xhr.abort() });
          } else {
            reject(new Error(xhr.responseText));
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
    };

    for (let i = 0; i < batches.length; i++) {
      console.log(`Uploading batch ${i + 1} of ${batches.length}`);
      try {
        if (i === batches.length - 1) {
          console.log("Uploading final batch");
          await uploadLastBatch(batches[i]);
        } else {
          const upload = await uploadBatch(batches[i]);
          setCurrentUpload(upload);
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'Upload cancelled') {
          console.log('Upload was cancelled');
          break;
        } else {
          throw error;
        }
      }
    }

    setCurrentUpload(null);
    console.log("All batches uploaded successfully!");
}, [formState.sessionID, formState.files, formState.channel, formState.uploadComment, formState.messageBatchSize, selectedFileTypes, toast, accessToken]);

  useEffect(() => {
    if (startUpload && formState.sessionID) {
      performUpload();
      setStartUpload(false);
    }
  }, [formState.sessionID, performUpload, setStartUpload, startUpload]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

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
              loadingBotChannels={loadingBotChannels}
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
            loadingBotChannels={loadingBotChannels}
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
