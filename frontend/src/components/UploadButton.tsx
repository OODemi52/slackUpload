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
      bgGradient="linear(to bottom right, #080808, #202020)"
      color="white"
      border="2px solid #202020"
      size="md"
      width="100%"
      _hover={{ border: "1px solid white" }}
      boxShadow="4px 4px 4px rgba(0, 0, 0, 0.5)"
    >
      Upload
    </Button>
  );
};

export default UploadButton;
