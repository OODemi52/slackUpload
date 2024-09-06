import {
  Tooltip,
} from "@chakra-ui/react";

interface MultipleSelectProps {
    onToggleSelectMode: () => void;
  }
  
  const MultipleSelect: React.FC<MultipleSelectProps> = ({ onToggleSelectMode }) => {

return (
    <>
        <Tooltip
            label="Select Multiple Images"
            aria-label="Select Multiple Images Button"
            placement="bottom"
            color="white"
            bg="#080808"
        >
            <button
                onClick={onToggleSelectMode}
                style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    marginRight: "2rem",
                }}
                aria-label="Select Multiple Images"
            >
                <svg
                    width="25px"
                    height="25px"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="white"
                >
                    <g>
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path
                            fillRule="nonzero"
                            d="M7 7V3a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-4v3.993c0 .556-.449 1.007-1.007 1.007H3.007A1.006 1.006 0 0 1 2 20.993l.003-12.986C2.003 7.451 2.452 7 3.01 7H7zm2 0h6.993C16.549 7 17 7.449 17 8.007V15h3V4H9v3zM4.003 9L4 20h11V9H4.003z"
                        />
                    </g>
                </svg>
            </button>
        </Tooltip>
    </>
);
    };

export default MultipleSelect;