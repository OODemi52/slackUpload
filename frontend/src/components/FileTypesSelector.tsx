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
        }}
      />
    </Box>
  );
};

export default FileTypeSelector;
