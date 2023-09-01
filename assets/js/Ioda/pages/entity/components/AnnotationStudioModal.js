import * as React from "react";
import { Button, ColorPicker, Modal, Popconfirm, Slider } from "antd";
import { fabric } from "fabric";

import iodaWatermark from "images/ioda-canvas-watermark.png";

import FormatText from "@2fd/ant-design-icons/lib/FormatText";
import SquareOutlineIcon from "@2fd/ant-design-icons/lib/SquareOutline";
import CircleOutlineIcon from "@2fd/ant-design-icons/lib/CircleOutline";
import TriangleOutlineIcon from "@2fd/ant-design-icons/lib/TriangleOutline";
import ArrangeBringForwardIcon from "@2fd/ant-design-icons/lib/ArrangeBringForward";
import ArrangeSendBackwardIcon from "@2fd/ant-design-icons/lib/ArrangeSendBackward";
import ArrangeBringToFrontIcon from "@2fd/ant-design-icons/lib/ArrangeBringToFront";
import ArrangeSendToBackIcon from "@2fd/ant-design-icons/lib/ArrangeSendToBack";

import { CloseOutlined } from "@ant-design/icons";

const DEFAULT_SHAPE_FILL = "#F93D4EC0";

const SUPPORTS_FILL = ["circle", "rect", "textbox", "triangle"];
const SUPPORTS_BACKGROUND_COLOR = ["textbox"];
const SUPPORTS_STROKE = ["circle", "rect", "triangle"];

const controlProperties = {
  centeredRotation: true,
  cornerStyle: "circle",
  padding: 0,
  cornerSize: 12,
  rotatingPointOffset: 10,
  transparentCorners: false,
  uniformScaling: false,
};

const lockControlVisibility = {
  mtr: false,
  mt: false,
  mb: false,
  ml: false,
  mr: false,
  bl: false,
  br: false,
  tl: false,
  tr: false,
};

fabric.Object.prototype.set({
  ...controlProperties,
});

const getBase64PNGFromSVGString = (svgString) => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();

      // Set the SVG source as the image source
      img.src =
        "data:image/svg+xml;base64," +
        window.btoa(unescape(encodeURIComponent(svgString)));
      img.width = 2000;
      img.height = 1125;

      // Wait for the image to load
      img.onload = function () {
        // Create a Canvas element
        const canvas = document.createElement("canvas");
        canvas.width = 2000;
        canvas.height = 1125;

        // Get the Canvas rendering context
        const ctx = canvas.getContext("2d");

        // Draw the image onto the Canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert the Canvas content to a base64 PNG string
        const pngBase64 = canvas.toDataURL("image/png");

        // Extract the base64 data part
        const base64String = pngBase64.split(",")[1];
        resolve("data:image/png;base64," + base64String);
      };
    } catch (err) {
      reject(err);
    }
  });
};

export default function AnnotationStudioModal({
  open,
  svgString,
  hideModal,
  chartTitle,
  chartSubtitle,
  exportFileName,
}) {
  const fabricCanvas = React.useRef(null);
  const canvasContainer = React.useRef(null);

  const [loadedChart, setLoadedChart] = React.useState(false);
  const [canvas, setCanvas] = React.useState(new fabric.Canvas());

  const [activeObject, setActiveObject] = React.useState(null);
  const [activeObjectAttributes, setActiveObjectAttributes] = React.useState({
    fill: null,
    backgroundColor: null,
    stroke: null,
    strokeWidth: null,
  });

  const [copySelection, setCopySelection] = React.useState(null);

  const [chartElement, setChartElement] = React.useState(null);
  const [watermarkElement, setWatermarkElement] = React.useState(null);

  const initCanvas = () => {
    const canvas = new fabric.Canvas(fabricCanvas.current, {
      height: 480,
      width: 800,
      backgroundColor: "#fff",
      uniformScaling: false,
      uniScaleKey: "shiftKey",
      preserveObjectStacking: true,
    });

    return canvas;
  };

  const wipeCanvas = () => {
    canvas.clear();
    setCanvas(null);
    setLoadedChart(false);
    setActiveObject(null);
    setCopySelection(null);
  };

  const loadCanvasImageBase = async () => {
    if (!canvas) return;
    const chartImage = await getBase64PNGFromSVGString(svgString);
    fabric.Image.fromURL(chartImage, (chartImage) => {
      // Load background image in
      setChartElement(chartImage);
      chartImage.scaleToWidth(canvas.width).set({
        top: 28,
        left: 0,
        selectable: false,
        evented: false,
        noScaleCache: false,
      });
      canvas.add(chartImage).renderAll();

      // Load watermark image
      fabric.Image.fromURL(iodaWatermark, (watermark) => {
        setWatermarkElement(watermark);
        const watermarkWidth = canvas.width / 8;
        watermark.scaleToWidth(watermarkWidth).set({
          top: 10,
          left: canvas.width - watermarkWidth - 10,
          selectable: false,
          evented: false,
          noScaleCache: false,
        });
        canvas.add(watermark).renderAll();
      });

      // Add title and subtitle
      canvas.add(
        new fabric.Textbox(chartTitle, {
          top: 10,
          left: 8,
          fill: "#000",
          backgroundColor: "#fff",
          fontFamily: "Inter, sans-serif",
          fontWeight: "bold",
          fontSize: 16,
          width: canvas.width / 2,
          lockMovementY: true,
          lockMovementX: true,
        }).setControlsVisibility({
          ...lockControlVisibility,
        })
      );
      canvas.add(
        new fabric.Textbox(chartSubtitle, {
          top: 32,
          left: 8,
          fill: "#000",
          backgroundColor: "#fff",
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          width: canvas.width - 16,
          lockMovementY: true,
          lockMovementX: true,
        }).setControlsVisibility({
          ...lockControlVisibility,
        })
      );
      canvas.renderAll();

      canvas.on("selection:created", handleObjectSelectionChange);
      canvas.on("selection:updated", handleObjectSelectionChange);
      canvas.on("selection:cleared", handleObjectSelectionChange);

      setLoadedChart(true);
    });
  };

  const focusCanvasContainer = () => {
    canvasContainer.current?.focus();
  };

  const handleCanvasKeys = (e) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      canvasDeleteHandler();
    } else if (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) {
      canvasCopyHandler();
    } else if (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) {
      canvasPasteHandler();
    } else if (e.key === "Escape") {
      canvas.discardActiveObject().renderAll();
    } else if (e.keyCode === 37) {
      nudgeSelection("left");
    } else if (e.keyCode === 38) {
      nudgeSelection("up");
    } else if (e.keyCode === 39) {
      nudgeSelection("right");
    } else if (e.keyCode === 40) {
      nudgeSelection("down");
    }
  };

  const canvasDeleteHandler = () => {
    const selection = canvas.getActiveObjects();
    selection.forEach((obj) => {
      canvas.remove(obj);
    });
    canvas.discardActiveObject().renderAll();
  };

  const nudgeSelection = (direction) => {
    const selection = canvas.getActiveObjects();
    if (!selection) return;

    const NUDGE_AMOUNT = 2;
    let nudgeAxis = null;
    let nudgeDirection = -1;
    switch (direction) {
      case "left":
        nudgeAxis = "left";
        nudgeDirection = -1;
        break;
      case "right":
        nudgeAxis = "left";
        nudgeDirection = 1;
        break;
      case "up":
        nudgeAxis = "top";
        nudgeDirection = -1;
        break;
      case "down":
        nudgeAxis = "top";
        nudgeDirection = 1;
        break;
    }
    selection.forEach((obj) => {
      obj.set({
        [nudgeAxis]: obj[nudgeAxis] + nudgeDirection * NUDGE_AMOUNT,
      });
    });
    canvas.renderAll();
  };

  const canvasCopyHandler = () => {
    const selection = canvas.getActiveObjects();
    setCopySelection(selection);
  };

  const canvasPasteHandler = () => {
    if (!copySelection) return;
    canvas.discardActiveObject();

    const copiedObjects = [];
    copySelection.forEach((obj) => {
      obj.clone((clone) => {
        clone.set({
          top: clone.top + 10,
          left: clone.left + 10,
        });
        canvas.add(clone);
        copiedObjects.push(clone);
      });
    });

    const newSelection = new fabric.ActiveSelection(copiedObjects, {
      canvas: canvas,
    });
    canvas.setActiveObject(newSelection);
    canvas.renderAll();
  };

  const handleObjectSelectionChange = (e) => {
    const selection = canvas.getActiveObjects();
    if (selection?.length !== 1) {
      setActiveObject(null);
    } else {
      const item = selection?.at(0) ?? null;
      if (!item) {
        setActiveObject(null);
        return;
      }
      setActiveObject(selection?.at(0) ?? null);
      setActiveObjectAttributes({
        fill: item?.fill ?? null,
        backgroundColor: item?.backgroundColor ?? null,
        stroke: item?.stroke ?? null,
        strokeWidth: item?.strokeWidth ?? null,
      });
    }
  };

  // Used to ensure the chart is always at the back
  const sendChartToBack = () => {
    if (!chartElement) return;
    canvas.sendToBack(chartElement);
  };

  // Used to ensure the watermark is always at the front
  const bringWatermarkToFront = () => {
    if (!watermarkElement) return;
    canvas.bringToFront(watermarkElement);
  };

  const bringActiveObjectForward = () => {
    if (!activeObject) return;
    canvas.bringForward(activeObject);
    bringWatermarkToFront();
  };

  const bringActiveObjectToFront = () => {
    if (!activeObject) return;
    canvas.bringToFront(activeObject);
    bringWatermarkToFront();
  };

  const sendActiveObjectBackward = () => {
    if (!activeObject) return;
    canvas.sendBackwards(activeObject);
    sendChartToBack();
  };

  const sendActiveObjectToBack = () => {
    if (!activeObject) return;
    canvas.sendToBack(activeObject);
    sendChartToBack();
  };

  const addObjectToCanvas = (obj) => {
    canvas.add(obj).setActiveObject(obj);
    // Ensure that the watermark is always at the front when adding a new object
    bringWatermarkToFront();
    focusCanvasContainer();
  };

  const addCircle = () => {
    const circle = new fabric.Circle({
      radius: 50,
      fill: DEFAULT_SHAPE_FILL,
      stroke: null,
      strokeWidth: 1,
      strokeUniform: true,
      left: canvas.width / 2 - 50 / 2,
      top: canvas.height / 2 - 50 / 2,
    });
    addObjectToCanvas(circle);
  };

  const addRectangle = () => {
    const rect = new fabric.Rect({
      width: 100,
      height: 100,
      fill: DEFAULT_SHAPE_FILL,
      stroke: null,
      strokeWidth: 1,
      strokeUniform: true,
      left: canvas.width / 2 - 100 / 2,
      top: canvas.height / 2 - 100 / 2,
    });
    addObjectToCanvas(rect);
  };

  const addTextbox = () => {
    const textbox = new fabric.Textbox("Enter text", {
      width: 75,
      fontSize: 16,
      fill: "#000",
      backgroundColor: null,
      textAlign: "center",
      fontFamily: "Inter, sans-serif",
      left: canvas.width / 2,
      top: canvas.height / 2,
    });
    addObjectToCanvas(textbox);
  };

  const addTriangle = () => {
    const triangle = new fabric.Triangle({
      width: 100,
      height: 100,
      fill: DEFAULT_SHAPE_FILL,
      stroke: null,
      strokeWidth: 1,
      strokeUniform: true,
      left: canvas.width / 2 - 100 / 2,
      top: canvas.height / 2 - 100 / 2,
    });
    addObjectToCanvas(triangle);
  };

  const downloadImage = () => {
    const dataURL = canvas.toDataURL({
      width: canvas.width,
      height: canvas.height,
      format: "png",
      quality: 1,
      multiplier: 2,
      enableRetinaScaling: true,
    });
    const link = document.createElement("a");
    link.download = `${exportFileName}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePalettePropertyChange = (property, val) => {
    if (!activeObject) return;
    activeObject.set({ [property]: val });
    setActiveObjectAttributes({ ...activeObjectAttributes, [property]: val });
    canvas.renderAll();
  };

  const confirmClose = () => {
    if (!loadedChart) {
      hideModal();
      return;
    }
    const response = confirm(
      "Are you sure you want to close? Any unsaved changes will be lost."
    );
    if (response) {
      hideModal();
    }
  };

  return (
    <Modal
      className="annotationStudioModal"
      open={open}
      closeIcon={null}
      title={
        <div className="flex items-center">
          <div className="col-1 truncate">Annotation Studio</div>
          {loadedChart && (
            <Button type="primary" className="mr-3" onClick={downloadImage}>
              Save
            </Button>
          )}
          <Button icon={<CloseOutlined />} onClick={confirmClose} />
        </div>
      }
      footer={null}
      width={"min-content"}
      keyboard={false}
      afterOpenChange={(open) => {
        if (!loadedChart && open) {
          setCanvas(initCanvas());
        } else {
          wipeCanvas();
        }
      }}
      destroyOnClose={true}
    >
      <div
        ref={canvasContainer}
        tabIndex="1000"
        onKeyDown={handleCanvasKeys}
        style={{ outline: "none" }}
        className="relative mb-4 card flex items-center justify-center"
      >
        {!loadedChart && (
          <div className="absolute z-1 text-center w-1/3">
            <p className="text-2xl font-bold">
              Introducing the Annotation Studio
            </p>
            <p className="text-xl mt-4">
              Use the annotation studio to markup the current chart view. When
              you're done, save the image to share.
            </p>
            <Button
              className="mx-auto mt-4"
              type="primary"
              onClick={loadCanvasImageBase}
            >
              Start
            </Button>
          </div>
        )}
        <canvas ref={fabricCanvas} width={800} height={448} />
      </div>

      {loadedChart && (
        <div className="flex gap-4">
          <div>
            <div className="text-xl">Draw</div>
            <div className="p-4 card gap-3 drawPalette">
              <Button icon={<CircleOutlineIcon />} onClick={addCircle} />
              <Button icon={<SquareOutlineIcon />} onClick={addRectangle} />
              <Button icon={<FormatText />} onClick={addTextbox} />
              <Button icon={<TriangleOutlineIcon />} onClick={addTriangle} />
            </div>
          </div>

          <div className="col">
            <div className="text-xl">Style</div>
            <div className="p-4 card">
              {!activeObject && <div>Select an existing object, or draw a new one.</div>}
              {activeObject && (
                <>
                  <div className="flex gap-3 mb-3 stylePalette">
                    {SUPPORTS_FILL.includes(activeObject.type) && (
                      <ColorPicker
                        format="hex"
                        value={activeObjectAttributes?.fill}
                        destroyTooltipOnHide={true}
                        showText={() => "Fill"}
                        onChange={(val) =>
                          handlePalettePropertyChange("fill", val.toHexString())
                        }
                        allowClear={true}
                        onClear={() =>
                          handlePalettePropertyChange("fill", null)
                        }
                      />
                    )}

                    {SUPPORTS_BACKGROUND_COLOR.includes(activeObject.type) && (
                      <ColorPicker
                        format="hex"
                        value={activeObjectAttributes?.backgroundColor}
                        destroyTooltipOnHide={true}
                        showText={() => "Background"}
                        onChange={(val) =>
                          handlePalettePropertyChange(
                            "backgroundColor",
                            val.toHexString()
                          )
                        }
                        allowClear={true}
                        onClear={() =>
                          handlePalettePropertyChange("backgroundColor", null)
                        }
                      />
                    )}

                    {SUPPORTS_STROKE.includes(activeObject.type) && (
                      <ColorPicker
                        format="hex"
                        value={activeObjectAttributes?.stroke}
                        destroyTooltipOnHide={true}
                        showText={() => "Stroke"}
                        onChange={(val) =>
                          handlePalettePropertyChange(
                            "stroke",
                            val.toHexString()
                          )
                        }
                        allowClear={true}
                        onClear={() =>
                          handlePalettePropertyChange("stroke", null)
                        }
                      />
                    )}

                    {SUPPORTS_STROKE.includes(activeObject.type) &&
                      activeObjectAttributes.stroke && (
                        <div className="card flex items-center gap-3 w-72 px-2">
                          <div style={{ marginBottom: "-2px" }}>
                            Stroke Width
                          </div>
                          <Slider
                            className="col-1 h-1"
                            min={1}
                            max={20}
                            onChange={(val) =>
                              handlePalettePropertyChange("strokeWidth", val)
                            }
                            value={activeObjectAttributes?.strokeWidth ?? 1}
                          />
                        </div>
                      )}
                  </div>
                  <div className="flex gap-3 arrangePalette">
                    <Button
                      icon={<ArrangeBringForwardIcon />}
                      onClick={() => {
                        bringActiveObjectForward();
                        focusCanvasContainer();
                      }}
                    />
                    <Button
                      icon={<ArrangeBringToFrontIcon />}
                      onClick={() => {
                        bringActiveObjectToFront();
                        focusCanvasContainer();
                      }}
                    />
                    <Button
                      icon={<ArrangeSendBackwardIcon />}
                      onClick={() => {
                        sendActiveObjectBackward();
                        focusCanvasContainer();
                      }}
                    />
                    <Button
                      icon={<ArrangeSendToBackIcon />}
                      onClick={() => {
                        sendActiveObjectToBack();
                        focusCanvasContainer();
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
