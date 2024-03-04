import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import { Select } from "chakra-react-select";

type Channel = { value: string; label: string };

interface ChannelSelectorProps {
  channels: Channel[];
  onChannelChange: (channelId: string) => void;
}

const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  channels,
  onChannelChange,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    onChannelChange(channel.value);
  };

  return (
    <Box>
      <Select
        options={channels}
        placeholder="Select Channel"
        menuPlacement="top"
        isSearchable={false}
        onChange={(newValue: Channel | null) =>
          handleChannelSelect(newValue as Channel)
        }
        value={selectedChannel}
        chakraStyles={{
          control: (provided) => ({
            ...provided,
            borderColor: "#b3b3b3",
            bgGradient: "linear(to top, #5f43b2, #8c73e9)",
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            color: "black",
          }),
          option: (provided) => ({
            ...provided,
            color: "black",
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "white",
          }),
          singleValue: (provided) => ({
            ...provided,
            color: "white",
          }),
        }}
      />
    </Box>
  );
};

export default ChannelSelector;
