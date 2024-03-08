type SpacerProps = {
  size: number;
};

const Spacer = ({ size }: SpacerProps) => {
  const spacerStyle = {
    padding: `${size}rem`,
  };

  return <div style={spacerStyle} />;
};

export default Spacer;
