import React from "react";
import { Button } from "@chakra-ui/react";

interface UploadButtonProps {
  disabled: boolean;
  onUpload: () => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ disabled, onUpload }) => {
  return (
    <Button
      onClick={onUpload}
      isDisabled={disabled}
      variant="solid"
      bgGradient="linear(to top, #5f43b2, #8c73e9)"
      color="white"
      border="1px solid #b3b3b3"
      size="md"
      width="100%"
    >
      Upload
    </Button>
  );
};

export default UploadButton;
