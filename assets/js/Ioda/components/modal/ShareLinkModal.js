import * as React from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  RedditShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  TelegramIcon,
  WhatsappIcon,
  RedditIcon,
  EmailIcon,
} from "react-share";

import { Button, Input, Modal } from "antd";
import {
  CheckOutlined,
  CopyOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

export default function ShareLinkModal(props) {
  const [showMessage, setShowMessage] = React.useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(props.link);
    setShowMessage(true);
  };

  React.useEffect(() => {
    let timeout;
    if (showMessage) {
      timeout = setTimeout(() => setShowMessage(false), 2000);
    }
    return () => clearTimeout(timeout);
  }, [showMessage]);

  const shareUrl = props.link;
  const title = `Follow near realtime Internet connectivity signals in ${props.entityName}:\n`;

  const entityNameHashtag = props.entityName
    ? `#${props.entityName.replace(/\s+/g, "")}`
    : "";

  const twitterUrl = `${props.link} \n\n@IODA_live ${entityNameHashtag} #Internet #disruption`;

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

      <div className="linkShareModal__share-items">
        <div className="linkShareModal__share-method">
          <TwitterShareButton url={twitterUrl} title={title}>
            <TwitterIcon size={36} round />
          </TwitterShareButton>
        </div>

        <div className="linkShareModal__share-method">
          <FacebookShareButton url={shareUrl} quote={title}>
            <FacebookIcon size={36} round />
          </FacebookShareButton>
        </div>

        <div className="linkShareModal__share-method">
          <TelegramShareButton url={shareUrl} title={title}>
            <TelegramIcon size={36} round />
          </TelegramShareButton>
        </div>

        <div className="linkShareModal__share-method">
          <WhatsappShareButton url={shareUrl} title={title} separator=":: ">
            <WhatsappIcon size={36} round />
          </WhatsappShareButton>
        </div>

        <div className="linkShareModal__share-method">
          <RedditShareButton
            url={shareUrl}
            title={title}
            windowWidth={660}
            windowHeight={460}
          >
            <RedditIcon size={36} round />
          </RedditShareButton>
        </div>

        <div className="linkShareModal__share-method">
          <EmailShareButton url={shareUrl} subject={title} body={title}>
            <EmailIcon size={36} round />
          </EmailShareButton>
        </div>
      </div>
    </Modal>
  );
}
