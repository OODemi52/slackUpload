import React from "react";
import "../index.css";

const Modal = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="modal-overlay" />
      <div className="modal-content">{children}</div>
    </>
  );
};

export default Modal;
