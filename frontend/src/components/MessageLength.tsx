import React from 'react'
import {
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    SliderMark,
    Tooltip
  } from '@chakra-ui/react'

const MessageLength: React.FC = () => {
    const [sliderValue, setSliderValue] = React.useState(10)
    const [showTooltip, setShowTooltip] = React.useState(false)

    return (
      <Slider
        id='slider'
        defaultValue={10}
        min={1}
        max={14}
        colorScheme='purple'
        onChange={(v) => setSliderValue(v)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <SliderMark value={1} mt='2' ml='0' fontSize='sm' color="white">
          1
        </SliderMark>
        <SliderMark value={14} mt='2' ml='-2.5' fontSize='sm' color="white">
          14
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <Tooltip
          hasArrow
          bg='purple.500'
          color='white'
          placement='bottom'
          isOpen={showTooltip}
          label={`${sliderValue}`}
        >
          <SliderThumb />
        </Tooltip>
      </Slider>
    )
}

export default MessageLength