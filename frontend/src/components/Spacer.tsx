import React from 'react';

const Spacer = ({ size }) => {
  const spacerStyle = {
    padding: `${size}rem`,
  };

  return <div style={spacerStyle} />;
};

export default Spacer;