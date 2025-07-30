import React from "react";
import {useEffect} from "react";
import { Button, Input, Modal } from "antd";
import {
  CheckOutlined,
  CopyOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import ShareButtons from "./ShareButtons";

export default function ShareLinkModal(props) {
  const [showMessage, setShowMessage] = React.useState(false);
  const {
    link
  } = props;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link);
    setShowMessage(true);
  };

  useEffect(() => {
    let timeout;
    if (showMessage) {
      timeout = setTimeout(() => setShowMessage(false), 2000);
    }
    return () => clearTimeout(timeout);
  }, [showMessage]);

  const copyIcon = showMessage ? <CheckOutlined /> : <CopyOutlined />;

  return (
      <Modal
          className="linkShareModal"
          open={props.open}
          onOk={props.hideModal}
          onCancel={props.hideModal}
          title="Share Link"
          footer={null}
      >
        <Button
            className="mb-3"
            type="link"
            onClick={props.handleDownload}
            icon={<DownloadOutlined />}
        >
          Download an image to share
        </Button>

        <div className="flex items-stretch">
          <Input value={props.link} className="mr-3 col" />
          <Button
              aria-label="copy link"
              type="primary"
              size="large"
              onClick={handleCopyLink}
              icon={copyIcon}
          />
        </div>
        <div className="mt-6 flex items-center justify-center">
          <div>
            <ShareButtons entityName={props.entityName} link={props.link} />
          </div>
        </div>
      </Modal>
  );
}
