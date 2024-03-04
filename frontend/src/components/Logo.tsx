import React from "react";
import { AspectRatio } from "@chakra-ui/react";
import logoImage from "../../public/SSLOGO_NOBG.png";

const Logo: React.FC = () => {
  return (
    <AspectRatio maxW="100px" ratio={1}>
      <img src={logoImage} alt="Slackshots Logo" />
    </AspectRatio>
  );
};

export default Logo;
