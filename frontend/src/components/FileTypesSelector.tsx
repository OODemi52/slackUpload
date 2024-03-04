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
          multiValue: (provided) => ({
            ...provided,
            backgroundColor: "purple.300",
            overflow: "hidden",
          }),
          multiValueLabel: (provided) => ({
            ...provided,
            color: "black",
            overflow: "hidden",
          }),
          multiValueRemove: (provided) => ({
            ...provided,
            color: "black",
            ":hover": {
              backgroundColor: "purple.400",
              color: "black",
            },
          }),
        }}
      />
    </Box>
  );
};

export default FileTypeSelector;
