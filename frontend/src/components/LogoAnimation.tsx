import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/SlackShots Placeholder.json';

const LogoAnimation: React.FC = () => {
    return (
        <div className="logo-animation" style={{display: "flex", width: "35%", justifyContent: "center", margin: "0 auto"}}>
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
};

export default LogoAnimation;