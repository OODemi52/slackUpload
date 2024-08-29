import React from "react";
import { Button } from "@chakra-ui/react";

interface UploadButtonProps {
  loading: boolean;
  disabled: boolean;
  onUpload: () => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ loading, disabled, onUpload }) => {
  return (
    <Button
      onClick={onUpload}
      isDisabled={disabled}
      isLoading={loading}
      loadingText="Uploading..."
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
