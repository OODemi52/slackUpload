import React from "react";
import { Box } from "@chakra-ui/react";
import { MultiValue, Select, OptionBase } from "chakra-react-select";

interface FileTypeSelectorProps {
  selectedFileTypes: string[];
  onSelectFileTypes: (fileTypes: string[]) => void;
}

interface FileTypeOption extends OptionBase {
  value: string;
  label: string;
}

const FileTypeSelector: React.FC<FileTypeSelectorProps> = ({
  selectedFileTypes,
  onSelectFileTypes,
}) => {
  const fileTypesOptions = [
    { value: ".jpg", label: "JPG" },
    { value: ".jpeg", label: "JPEG" },
    { value: ".png", label: "PNG" },
    { value: ".cr2", label: "CR2" },
    { value: ".cr3", label: "CR3" },
    { value: ".dmg", label: "DMG" },
    { value: ".gif", label: "GIF" },
  ];

  const handleSelectChange = (newValue: MultiValue<FileTypeOption>) => {
    onSelectFileTypes(newValue.map((option: FileTypeOption) => option.value));
  };

  return (
    <Box>
      <Select
        options={fileTypesOptions}
        placeholder="Select File Types..."
        closeMenuOnSelect={false}
        isMulti
        menuPlacement="top"
        isSearchable={false}
        onChange={handleSelectChange}
        value={fileTypesOptions.filter((option) =>
          selectedFileTypes.includes(option.value),
        )}
        chakraStyles={{
          control: (provided) => ({
            ...provided,
            border: "2px solid",
            borderColor: "#202020",
            bgGradient: "linear(to bottom right, #080808, #202020)",
            boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.5)",
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            bgGradient: "linear(to bottom right, #080808, #202020)",
            color: "white",
          }),
          option: (provided) => ({
            ...provided,
            backgroundColor: "transparent",
            color: "white",
            _hover: { bg: "rgba(255, 255, 255, 0.05)" },
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
            colorScheme: "light",
            ":hover": {
              backgroundColor: "white",
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
          clearIndicator: (provided) => ({
            ...provided,
            color: "white",
          }),
        }}
      />
    </Box>
  );
};

export default FileTypeSelector;
