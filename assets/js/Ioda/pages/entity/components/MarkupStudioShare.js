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
      <div className="flex justify-center items-center w-full h-full">
        <div className="w-3/4 mx-auto p-2">
          <p className="mb-8 text-2xl">
            Success! Your visualization has been downloaded. Share it on social
            media, and don't forget to tag IODA in your post!
          </p>

          {imagePreviewUrl && (
            <div className="w-4/5 mx-auto mb-8">
              <img src={imagePreviewUrl} alt="" className="w-full card" />
              <div className="flex items-center">
                <p className="col text-xl">~{imageFileSizeKb} KB</p>
                <p className="text-xl">
                  {imageDimensions.w} x {imageDimensions.h}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button onClick={onBackToEditing}>Back to Editing</Button>
            <Button onClick={onDownload} icon={<DownloadOutlined />} />

            <div className="col" />

            <ShareButtons link={shareLink} entityName={entityName} />
          </div>
        </div>
      </div>
    </div>
  );
}
