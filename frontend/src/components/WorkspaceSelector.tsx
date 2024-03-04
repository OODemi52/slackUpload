import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  RadioGroup,
  Radio,
  Stack,
} from "@chakra-ui/react";

interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceSelectorProps {
  onChannelChange: (channelId: string) => void;
}

const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  onChannelChange,
}) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedChannel, setSelectedChannel] = useState("");

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/getChannels");
      const data = await response.json();
      setWorkspaces(data);
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    onChannelChange(channelId);
  };

  return (
    <Box border="2px solid" borderRadius="md" p={1} color="white" width="200px">
      <Accordion allowToggle bgColor="purple.500">
        <AccordionItem sx={{ borderBottomWidth: 0 }}>
          <h2>
            <AccordionButton
              _expanded={{ bg: "purple.500", color: "white" }}
              bgGradient="linear(to-b, #5f43b2, #8c73e9)"
            >
              <Box flex="1" textAlign="left" color="whites">
                Select Workspace
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4} bg="#191919">
            <RadioGroup onChange={handleChannelSelect} value={selectedChannel}>
              <Stack spacing={2} direction="column" color="purple.500">
                {workspaces.map((workspace) => (
                  <Radio key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default WorkspaceSelector;
