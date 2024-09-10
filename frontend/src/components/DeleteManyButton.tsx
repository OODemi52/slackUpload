import { useState } from "react";
import { Tooltip } from "@chakra-ui/react";

interface DeleteManyButtonProps {
  isSelectMode: boolean;
  selectedImages: string[];
}

const DeleteManyButton: React.FC<DeleteManyButtonProps> = ({
  isSelectMode,
  //selectedImages,
}) => {
  const [strokeColor, setStrokeColor] = useState("white");

  const handleDelete = () => {
    //Implement batch delete logic later
  };

  return (
    <>
      <Tooltip
        label="Delete All Selected"
        placement="bottom"
        color="white"
        bg="#FF0000"
        display={{ base: "none", md: "block" }}
      >
        <button
          onClick={handleDelete}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            marginRight: "2rem",
            display: isSelectMode ? "block" : "none",
          }}
          aria-label="Delete All Selected"
        >
          <svg
            width="18px"
            height="18px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onMouseOver={() => setStrokeColor("#FF0000")}
            onMouseOut={() => setStrokeColor("white")}
          >
            <path
              d="M4 7H20"
              stroke={strokeColor}
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M6 7V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V7"
              stroke={strokeColor}
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
              stroke={strokeColor}
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </Tooltip>
    </>
  );
};

export default DeleteManyButton;
