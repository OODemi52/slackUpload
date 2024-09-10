import { useState, useEffect } from "react";
import { Tooltip, useMediaQuery } from "@chakra-ui/react";

interface DeleteManyButtonProps {
  isSelectMode: boolean;
  selectedImages: string[];
}

const DeleteManyButton: React.FC<DeleteManyButtonProps> = ({
  isSelectMode,
  selectedImages,
}) => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const [strokeColor, setStrokeColor] = useState("white");

  useEffect(() => {
    if (isLargerThan768) {
      setStrokeColor(selectedImages.length > 0 ? "white" : "gray");
    } else {
      setStrokeColor(selectedImages.length > 0 ? "#FF0000" : "white");
    }
  }, [isLargerThan768, selectedImages]);

  const handleDelete = () => {
    //Implement batch delete logic later
  };

  const handleMouseEnter = () => {
    if (isLargerThan768 && selectedImages.length > 0) {
      setStrokeColor("#FF0000");
    }
  };

  const handleMouseLeave = () => {
    if (isLargerThan768) {
      setStrokeColor(selectedImages.length > 0 ? "white" : "gray");
    }
  };

  return (
    <>
      <Tooltip
        label="Delete All Selected"
        placement="bottom"
        color="white"
        bg="#FF0000"
        display={{ base: "none", md: "block" }}
        isDisabled={selectedImages.length <= 0}
      >
        <button
          onClick={handleDelete}
          style={{
            background: "transparent",
            border: "none",
            cursor: selectedImages.length > 0 ? "pointer" : "not-allowed",
            marginRight: "2rem",
            display: isSelectMode ? "block" : "none",
            opacity: selectedImages.length > 0 ? 1 : 0.5,
          }}
          aria-label="Delete All Selected"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          disabled={selectedImages.length <= 0}
        >
          <svg
            width="18px"
            height="18px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 7H20"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 7V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V7"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </Tooltip>
    </>
  );
};

export default DeleteManyButton;
