import React from 'react';

interface UploadButtonProps {
  disabled: boolean;
  onUpload: () => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ disabled, onUpload }) => {
  const handleUpload = () => {
      onUpload();
  };

  return (
    <button 
      onClick={handleUpload} 
      disabled={disabled} 
    >
      Upload
    </button>
  );
};

export default UploadButton;
