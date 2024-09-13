import React, { useState, useCallback } from "react";
import { Box, Flex, Button, Tooltip } from "@chakra-ui/react";
import { Select, chakraComponents, OptionProps } from "chakra-react-select";

type Channel = { value: string; label: string; isMember: boolean };

interface ChannelSelectorProps {
  channels: Channel[];
  onChannelChange: (channelId: string) => void;
  onAddBot: (channelId: string) => void;
  loadingBotChannels: { [key: string]: boolean };
  
}

const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  channels,
  onChannelChange,
  onAddBot,
  loadingBotChannels,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const handleChannelSelect = useCallback(
    (channel: Channel) => {
      if (channel.isMember) {
        setSelectedChannel(channel);
        onChannelChange(channel.value);
      }
    },
    [onChannelChange]
  );

  const CustomOption = React.memo(
    ({ children, ...props }: OptionProps<Channel, false>) => {
    const { data, innerProps, innerRef } = props;
    return (
      <chakraComponents.Option {...props} >
        <Box flex="1">{children}</Box>
        <Flex
          ref={innerRef}
          {...innerProps}
          justifyContent="space-between"
          alignItems="center"
        >
          {!data.isMember && (
            <Tooltip
            label="Add SlackShots To This Channel"
            color="white"
            bg="#080808"
            placement="right"
            display={{ base: "none", md: "block" }}
          >
            <Button
              size="xs"
              color="white"
              bg="#282828"
              onClick={(e) => {
                e.stopPropagation();
                onAddBot(data.value);
              }}
              isLoading={loadingBotChannels[data.value]}
              loadingText=""
            >
              +
            </Button>
            </Tooltip>
          )}
        </Flex>
      </chakraComponents.Option>
    );
  });

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
        components={{ Option: CustomOption }}
        isOptionDisabled={(option) => !option.isMember}
        selectedOptionStyle="check"
        chakraStyles={{
          control: (provided) => ({
            ...provided,
            border: "2px solid",
            borderColor: "#202020",
            bgGradient: "linear(to bottom right, #080808, #202020)",
            boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.5)",
            "&:hover": { border: "1px solid white" },
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            bgGradient: "linear(to bottom right, #080808, #202020)",
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
          option: (provided, state) => ({
            ...provided,
            backgroundColor: "transparent",
            color: state.isDisabled ? "rgba(255, 255, 255, 0.25)" : "white",
            cursor: state.isDisabled ? "not-allowed" : "pointer",
            _hover: { bg: "rgba(255, 255, 255, 0.05)" },
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
            bgGradient: "linear(to bottom right, #202020, #080808)",
            color: "white",
            borderColor: "#202020",
            dropShadow: "0px 4px 4px rgba(0, 0, 0, 1)",
            _focus: {
              borderColor: "white",
            },
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