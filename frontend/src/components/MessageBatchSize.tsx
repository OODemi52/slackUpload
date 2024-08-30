import React, { useState } from "react";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  Box,
} from "@chakra-ui/react";

interface MessageBatchSizeProps {
  onMessageBatchSizeChange: (value: number) => void;
}

const MessageBatchSize: React.FC<MessageBatchSizeProps> = ({
  onMessageBatchSizeChange,
}) => {
  const [sliderValue, setSliderValue] = useState(10);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleBatchSizeChange = (value: number) => {
    setSliderValue(value);
    onMessageBatchSizeChange(value);
  };

  return (
    <Box
      bgGradient="linear(to bottom right, #080808, #202020)"
      rounded={5}
      p={2}
      pb={5}
      border="2px solid #202020"
      boxShadow="4px 4px 4px rgba(0, 0, 0, 0.5)"
      _hover={{ border: "1px solid white" }}
    >
      <Slider
        id="slider"
        defaultValue={10}
        min={1}
        max={14}
        colorScheme="blackAlpha"
        onChange={handleBatchSizeChange}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <SliderMark value={1} mt="2" ml="0" fontSize="sm" color="white">
          1
        </SliderMark>
        <SliderMark value={14} mt="2" ml="-2.5" fontSize="sm" color="white">
          14
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <Tooltip
          borderRadius={5}
          bg="#202020"
          border="1px solid #b3b3b3"
          color="white"
          placement="bottom"
          isOpen={showTooltip}
          label={`${sliderValue}`}
        >
          <SliderThumb />
        </Tooltip>
      </Slider>
    </Box>
  );
};

export default MessageBatchSize;
