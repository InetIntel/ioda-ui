import * as React from "react";
import IconButton from "@material-ui/core/IconButton";
import FileCopyOutlined from "@material-ui/icons/FileCopyOutlined";
import Check from "@material-ui/icons/Check";
import Dialog from "@material-ui/core/Dialog";

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

  const twitterUrl = `${props.link} \n\n${entityNameHashtag} #connectivity`;

  const copyIcon = showMessage ? (
    <Check htmlColor="#fff" fontSize="large" />
  ) : (
    <FileCopyOutlined htmlColor="#fff" fontSize="large" />
  );

  return (
    <Dialog
      className="linkShareModal"
      open={props.open}
      onClose={props.hideModal}
    >
      <div className="linkShareModal__modal-body">
        <div className="linkShareModal__modal-title">Share Link</div>
        <div className="linkShareModal__modal-content">
          <div
            className="linkShareModal__download-link"
            onClick={props.handleDownload}
          >
            Download an image to share
          </div>

          <div className="linkShareModal__copy-link">
            <div className="linkShareModal__link">{props.link}</div>
            <IconButton
              aria-label="copy link"
              component="label"
              style={{ borderRadius: 5, backgroundColor: "#2c3e50" }}
              size="medium"
              onClick={handleCopyLink}
            >
              {copyIcon}
            </IconButton>
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
        </div>
      </div>
    </Dialog>
  );
}
