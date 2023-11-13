import * as React from "react";
import { Button } from "antd";
import ShareButtons from "../../../components/modal/ShareButtons";
import { DownloadOutlined } from "@ant-design/icons";

export default function MarkupStudioShare({
  show,
  imagePreviewUrl,
  entityName,
  shareLink,

  onBackToEditing,
  onDownload,
}) {
  const [imageDimensions, setImageDimensions] = React.useState({ w: 0, h: 0 });

  const imageFileSizeBytes = ((imagePreviewUrl?.length ?? 0) * 3) / 4 - 2;
  const imageFileSizeKb = Math.round(imageFileSizeBytes / 1024);

  const getImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = function () {
        resolve({ w: i.width, h: i.height });
      };
      i.src = file;
    });
  };

  React.useEffect(() => {
    if (imagePreviewUrl) {
      getImageDimensions(imagePreviewUrl).then((dimensions) => {
        setImageDimensions(dimensions);
      });
    }
  }, [imagePreviewUrl]);

  return (
    <div
      className="absolute z-1 w-full h-full bg-white"
      style={{
        display: show ? "block" : "none",
      }}
    >
      <div className="flex flex-column items-center w-full h-full">
        <div
          className="w-full p-6"
          style={{ borderBottom: "1px solid #D9D9D9" }}
        >
          Success! Your visualization has been downloaded. Share it on social
          media, and don't forget to tag IODA in your post!
        </div>

        {imagePreviewUrl && (
          <div
            className="col flex items-center justify-center w-full"
            style={{ backgroundColor: "#FAFAFA" }}
          >
            <div className="w-3/5">
              <img
                src={imagePreviewUrl}
                alt=""
                className="w-full card"
                style={{ border: "2px solid #D9D9D9" }}
              />
              <div
                className="flex items-center mt-2"
                style={{ color: "#8C8C8C" }}
              >
                <p className="col">Size: {imageFileSizeKb} KB</p>
                <p>
                  {imageDimensions.w} x {imageDimensions.h} px
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className="w-full py-4 px-6 flex items-center gap-2"
          style={{ borderTop: "1px solid #D9D9D9" }}
        >
          <Button onClick={onBackToEditing}>Back to Editing</Button>
          <Button onClick={onDownload} icon={<DownloadOutlined />} />

          <div className="col" />

          <ShareButtons link={shareLink} entityName={entityName} />
        </div>
      </div>
    </div>
  );
}
