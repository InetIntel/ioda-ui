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

export default function ShareButtons({ link, entityName }) {
  const shareUrl = link;
  const title = `Follow near realtime Internet connectivity signals in ${entityName}:\n`;

  const entityNameHashtag = entityName
    ? `#${entityName.replace(/\s+/g, "")}`
    : "";

  const twitterUrl = `${link} \n\n@IODA_live ${entityNameHashtag} #Internet #disruption`;

  return (
    <div className="flex items-center gap-3">
      <div>
        <TwitterShareButton url={twitterUrl} title={title}>
          <TwitterIcon size={36} round />
        </TwitterShareButton>
      </div>

      <div>
        <FacebookShareButton url={shareUrl} quote={title}>
          <FacebookIcon size={36} round />
        </FacebookShareButton>
      </div>

      <div>
        <TelegramShareButton url={shareUrl} title={title}>
          <TelegramIcon size={36} round />
        </TelegramShareButton>
      </div>

      <div>
        <WhatsappShareButton url={shareUrl} title={title} separator=":: ">
          <WhatsappIcon size={36} round />
        </WhatsappShareButton>
      </div>

      <div>
        <RedditShareButton
          url={shareUrl}
          title={title}
          windowWidth={660}
          windowHeight={460}
        >
          <RedditIcon size={36} round />
        </RedditShareButton>
      </div>

      <div>
        <EmailShareButton url={shareUrl} subject={title} body={title}>
          <EmailIcon size={36} round />
        </EmailShareButton>
      </div>
    </div>
  );
}
