import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Checkbox,
  CheckboxGroup,
  Stack,
} from '@chakra-ui/react';

const FileTypeSelector = () => {
  const [selectedFileTypes, setSelectedFileTypes] = React.useState([]);

  const handleCheckboxChange = (values) => {
    setSelectedFileTypes(values);
  };

  return (
    <Box border="2px solid" borderRadius="md" p={1} color="white">
      <Accordion allowToggle bgColor="purple.500">
        <AccordionItem sx={{ borderBottomWidth: 0 }}>
          <h2>
            <AccordionButton _expanded={{ bg: "purple.500", color: "white" }} bgGradient="linear(to-b, #5f43b2, #8c73e9)">
              <Box flex="1" textAlign="left" color="white">
                Select File Types
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4} bg="#191919">
            <CheckboxGroup colorScheme="purple" onChange={handleCheckboxChange} value={selectedFileTypes}>
              <Stack spacing={2} direction="column" color="purple.500">
                <Checkbox value="images">Images</Checkbox>
                <Checkbox value="videos">Videos</Checkbox>
                <Checkbox value="documents">Documents</Checkbox>
                <Checkbox value="audio">Audio</Checkbox>
              </Stack>
            </CheckboxGroup>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default FileTypeSelector;
