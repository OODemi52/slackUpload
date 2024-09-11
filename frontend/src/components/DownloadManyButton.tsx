import { Tooltip } from "@chakra-ui/react";

interface DownloadManyButtonProps {
  isSelectMode: boolean;
  selectedImages: {
    url: string;
    fileID: string;
    deleteFlag: string;
    name: string;
  }[];
  onDownload?: () => void;
  isDownloading: boolean;
}

const DownloadManyButton: React.FC<DownloadManyButtonProps> = ({
  isSelectMode,
  selectedImages,
  onDownload,
  isDownloading,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (isDownloading) {
      return;
    } else {
      e.stopPropagation();
      if (onDownload) {
        onDownload();
      }
    }
  };

  return (
    <>
      <Tooltip
        label={isDownloading ? "Downloading..." : "Download All Selected"}
        placement="bottom"
        color="white"
        bg="#080808"
        display={{ base: "none", md: "block" }}
        isDisabled={selectedImages.length <= 0 || isDownloading}
      >
        <button
          onClick={handleClick}
          style={{
            background: "transparent",
            border: "none",
            cursor:
              selectedImages.length <= 0 || isDownloading
                ? "not-allowed"
                : "pointer",
            marginRight: "2rem",
            display: isSelectMode ? "block" : "none",
            opacity: selectedImages.length > 0 && !isDownloading ? 1 : 0.5,
          }}
          aria-label="Download All Selected"
          disabled={selectedImages.length <= 0}
        >
          <svg
            fill="white"
            height="14px"
            width="14px"
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 29.978 29.978"
            xmlSpace="preserve"
          >
            <g>
              <path
                d="M25.462,19.105v6.848H4.515v-6.848H0.489v8.861c0,1.111,0.9,2.012,2.016,2.012h24.967c1.115,0,2.016-0.9,2.016-2.012
            v-8.861H25.462z"
              />
              <path
                d="M14.62,18.426l-5.764-6.965c0,0-0.877-0.828,0.074-0.828s3.248,0,3.248,0s0-0.557,0-1.416c0-2.449,0-6.906,0-8.723
            c0,0-0.129-0.494,0.615-0.494c0.75,0,4.035,0,4.572,0c0.536,0,0.524,0.416,0.524,0.416c0,1.762,0,6.373,0,8.742
            c0,0.768,0,1.266,0,1.266s1.842,0,2.998,0c1.154,0,0.285,0.867,0.285,0.867s-4.904,6.51-5.588,7.193
            C15.092,18.979,14.62,18.426,14.62,18.426z"
              />
            </g>
          </svg>
        </button>
      </Tooltip>
    </>
  );
};

export default DownloadManyButton;
