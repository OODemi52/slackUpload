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
        bgGradient="linear(to bottom right, #080808, #202020)"
        borderColor="#202020"
        border="2px solid #202020"
        borderRadius={5}
        boxShadow="4px 4px 4px rgba(0, 0, 0, 0.5)"
        color="white"
        resize="none"
      />
    </Box>
  );
};

export default UploadComment;
