import React, { useState } from "react";
import { Box, Textarea } from "@chakra-ui/react";

interface UploadCommentProps {
  onCommentChange: (comment: string) => void;
}

const UploadComment: React.FC<UploadCommentProps> = ({ onCommentChange }) => {
  const [comment, setComment] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newComment = e.target.value;
    setComment(newComment);
    onCommentChange(newComment);
  };

  return (
    <Box>
      <Textarea
        value={comment}
        onChange={handleChange}
        placeholder="Comment (optional)..."
        size="sm"
        resize="vertical"
        bg="white"
        borderColor="#b3b3b3"
        borderRadius={5}
      />
    </Box>
  );
};

export default UploadComment;
