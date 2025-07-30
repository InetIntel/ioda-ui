import * as React from "react";
import { Button } from "antd";

import PreloadImage from "react-preload-image";
import EntryGraphic from "images/markup-entry-graphic.png";

const MarkupStudioEntry = ({ show, onStart }) => {
  return (
    <div
      className="absolute z-1 text-center w-full h-full bg-white"
      style={{
        display: show ? "block" : "none",
      }}
    >
      <div
        style={{ position: "relative", maxHeight: "320px" }}
        className="w-full h-full"
      >
        <PreloadImage
          className="w-full"
          src={EntryGraphic}
          lazy
          innerStyle={{
            backgroundSize: "contain",
            backgroundPosition: "top",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
      <div className="w-full p-6">
        <div className="flex items-start gap-6">
          <div className="col-1 flex items-start gap-5">
            <div className="markupIntroStepBadge">1</div>
            <div className="col text-left">
              <div className="f-16 font-bold">Markup</div>
              <div className="f-14 text-gray-500">
                Use the markup tools to add comments, highlight outages, or make
                other edits.
              </div>
            </div>
          </div>

          <div className="col-1 flex items-start gap-5">
            <div className="markupIntroStepBadge">2</div>
            <div className="col text-left">
              <div className="f-16 font-bold">Download</div>
              <div className="f-14 text-gray-500">
                When you're done marking up the IODA chart, download your
                creation.
              </div>
            </div>
          </div>

          <div className="col-1 flex items-start gap-5">
            <div className="markupIntroStepBadge">3</div>
            <div className="col text-left">
              <div className="f-16 font-bold">Share</div>
              <div className="f-14 text-gray-500">
                Share your chart with your team or share on social media.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 w-full flex justify-end">
          <Button type="primary" onClick={onStart}>
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MarkupStudioEntry;
