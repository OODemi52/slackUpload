import React, { useEffect, useState } from "react";
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import XHRUpload from "@uppy/xhr-upload";

const Text = () => {
  const [uppy, setUppy] = useState<Uppy<
    Record<string, unknown>,
    Record<string, unknown>
  > | null>(null);

  useEffect(() => {
    const uppyInstance = new Uppy({
      restrictions: {
        maxNumberOfFiles: 20,
      },
      autoProceed: true,
    }).use(XHRUpload, {
      endpoint: "your_endpoint_here",
      formData: true,
      fieldName: "files[]",
    });

    // Async function for upload success
    const handleUploadSuccess = async (file, response) => {
      // Async actions here
      console.log(`Upload success: ${file.name}`, response);
    };

    // Async function for upload error
    const handleUploadError = async (file, error, response) => {
      // Async actions here
      console.error(`Upload error: ${file.name}`, error, response);
    };

    // Attach event listeners
    uppyInstance.on("upload-success", (file, response) =>
      handleUploadSuccess(file, response),
    );
    uppyInstance.on("upload-error", (file, error, response) =>
      handleUploadError(file, error, response),
    );
    uppyInstance.on("complete", (result) => {
      console.log("Upload complete: ", result.successful);
      // Handle post-upload actions
    });

    setUppy(uppyInstance);
  }, []);

  return (
    <div>
      {uppy && <Dashboard uppy={uppy} proudlyDisplayPoweredByUppy={false} />}
    </div>
  );
};

export default Text;
