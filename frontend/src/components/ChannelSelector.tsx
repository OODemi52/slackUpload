import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';

interface Channel {
  id: string;
  name: string;
}

interface ChannelSelectorProps {
  onChannelChange: (channelId: string) => void;
}

const ChannelSelector: React.FC<ChannelSelectorProps> = ({ onChannelChange }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState('');

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/getChannels');
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    onChannelChange(channelId);
  };

  return (
    <Box border="2px solid" borderRadius="md" p={1} color="white">
      <Accordion allowToggle bgColor="purple.500">
        <AccordionItem sx={{ borderBottomWidth: 0 }}>
          <h2>
            <AccordionButton _expanded={{ bg: "purple.500", color: "white" }} bgGradient="linear(to-b, #5f43b2, #8c73e9)">
              <Box flex="1" textAlign="left" color="whites">
                Choose a Channel
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4} bg="#191919">
            <RadioGroup onChange={handleChannelSelect} value={selectedChannel}>
              <Stack spacing={2} direction="column" color="purple.500">
                {channels.map(channel => (
                  <Radio key={channel.id} value={channel.id}>
                    {channel.name}
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

export default ChannelSelector;
