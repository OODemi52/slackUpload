import React from "react";
import { Button, ButtonGroup, Menu, MenuButton, MenuList, MenuItem, useMediaQuery } from "@chakra-ui/react";

interface GridSizeToggleProps {
    gridSize: 'sm' | 'md' | 'lg';
    setGridSize: (size: 'sm' | 'md' | 'lg') => void;
}

const GridSizeToggle: React.FC<GridSizeToggleProps> = ({ gridSize, setGridSize }) => {

    const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

    return isLargerThan768 ? (
        <ButtonGroup isAttached paddingLeft={[2, 4]}>
            <Button
                variant="subtle"
                color="white"
                border="1px solid #383838"
                borderRight="1px solid transparent"
                bg="#383838"
                size={["xs", "sm"]}
                width={["33%", "50%"]}
                _hover={{ border: "1px solid white" }}
                onClick={() => setGridSize('sm')}
                isActive={gridSize === 'sm'}
                _active={{ bg: "#282828" }}
            >
                S
            </Button>
            <Button
                variant="subtle"
                color="white"
                border="1px solid #383838"
                borderX="1px solid transparent"
                bg="#383838"
                size={["xs", "sm"]}
                width={["33%", "50%"]}
                _hover={{ border: "1px solid white" }}
                onClick={() => setGridSize('md')}
                isActive={gridSize === 'md'}
                _active={{ bg: "#282828" }}
            >
                M
            </Button>
            <Button
                variant="subtle"
                color="white"
                border="1px solid #383838"
                borderLeft="1px solid transparent"
                bg="#383838"
                size={["xs", "sm"]}
                width={["33%", "50%"]}
                _hover={{ border: "1px solid white" }}
                onClick={() => setGridSize('lg')}
                isActive={gridSize === 'lg'}
                _active={{ bg: "#282828" }}
            >
                L
            </Button>
        </ButtonGroup>
    ) : (
        <Menu>
            <MenuButton
                as={Button}
                variant="subtle"
                color="white"
                border="1px solid #383838"
                bg="#383838"
                size="sm"
                _hover={{ border: "1px solid white" }}
            >
                {gridSize === 'sm' ? 'Small' : gridSize === 'md' ? 'Medium' : 'Large'}
            </MenuButton>
            <MenuList
                bgGradient="linear(to bottom right, #202020, #080808)"
                border="1px solid #202020"
                dropShadow="0px 4px 4px rgba(0, 0, 0, 1)"
                ml={4}
            >
                <MenuItem
                    color="white"
                    bg={gridSize === 'sm' ? "#282828" : "transparent"}
                    _hover={{ bg: "#282828" }}
                    onClick={() => setGridSize('sm')}
                >
                    Small
                </MenuItem>
                <MenuItem
                    color="white"
                    bg={gridSize === 'md' ? "#282828" : "transparent"}
                    _hover={{ bg: "#282828" }}
                    onClick={() => setGridSize('md')}
                >
                    Medium
                </MenuItem>
                <MenuItem
                    color="white"
                    bg={gridSize === 'lg' ? "#282828" : "transparent"}
                    _hover={{ bg: "#282828" }}
                    onClick={() => setGridSize('lg')}
                >
                    Large
                </MenuItem>
            </MenuList>
        </Menu>
    );
}

export default GridSizeToggle;