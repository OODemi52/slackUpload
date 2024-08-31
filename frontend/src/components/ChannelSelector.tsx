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
            border: "2px solid",
            borderColor: "#202020",
            bgGradient: "linear(to bottom right, #080808, #202020)",
            boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.5)",
            "&:hover": { border: "1px solid white" }
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            bgGradient: "linear(to bottom right, #080808, #202020)",
            color: "white",
          }),
          option: (provided) => ({
            ...provided,
            backgroundColor: "#080808",
            color: "white",
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "white",
          }),
          multiValue: (provided) => ({
            ...provided,
            backgroundColor: "#202020",
            overflow: "hidden",
          }),
          multiValueLabel: (provided) => ({
            ...provided,
            color: "white",
            backgroundColor: "#202020",
            overflow: "hidden",
          }),
          multiValueRemove: (provided) => ({
            ...provided,
            color: "white",
            ":hover": {
              backgroundColor: "#202020",
              color: "white",
            },
          }),
          menuList: (provided) => ({
            ...provided,
            backgroundColor: "#080808",
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
