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
import MagnifyPlusOutlineIcon from "@2fd/ant-design-icons/lib/MagnifyPlusOutline";
import MagnifyMinusOutlineIcon from "@2fd/ant-design-icons/lib/MagnifyMinusOutline";
import MagnifyExpandIcon from "@2fd/ant-design-icons/lib/MagnifyExpand";
import ArrowTopRightThinIcon from "@2fd/ant-design-icons/lib/ArrowTopRightThin";

import { CloseOutlined } from "@ant-design/icons";

const ARROW_TYPE = "arrow";

const DEFAULT_SHAPE_FILL = "#F93D4EC0";

const SUPPORTS_FILL = ["circle", "rect", "textbox"];
const SUPPORTS_BACKGROUND_COLOR = ["textbox"];
const SUPPORTS_STROKE = ["circle", "rect", ARROW_TYPE];
const SUPPORTS_STROKE_WIDTH = ["circle", "rect"];

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 20;

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

  // Drag and pan related state
  const [isDragging, setIsDragging] = React.useState(false);
  const [lastDragX, setLastDragX] = React.useState(null);
  const [lastDragY, setLastDragY] = React.useState(null);
  const [viewpoint, setViewpoint] = React.useState([1, 0, 0, 1, 0, 0]);

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

  const resetCanvasZoomAndPosition = () => {
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.renderAll();
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

      canvas.on("mouse:wheel", handleCanvasZoom);

      canvas.on("object:scaling", function (e) {
        if (e.target.get("type") === ARROW_TYPE) {
          adjustArrowsSize(e.target._objects, e.target.get("scaleY"));
        }
      });

      canvas.on("object:scaled", function (e) {
        if (e.target.get("type") === ARROW_TYPE) {
          adjustArrowsSize(e.target._objects, e.target.get("scaleY"));
        }
      });

      // http://fabricjs.com/fabric-intro-part-5 These handlers are not
      // delegated to separate methods because we need direct namespace access
      // to the canvas object
      canvas.on("mouse:down", function (opt) {
        if (!opt.e?.altKey) return false;

        this.isDragging = true;
        this.selection = false;
        this.lastPosX = opt.e?.clientX;
        this.lastPosY = opt.e?.clientY;
      });

      canvas.on("mouse:move", function (opt) {
        if (!this.isDragging) return;
        const e = opt.e;
        const vpt = this.viewportTransform;
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;
        this.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
      });

      canvas.on("mouse:up", function (opt) {
        this.setViewportTransform(this.viewportTransform);
        this.isDragging = false;
        this.selection = true;
      });

      setLoadedChart(true);
    });
  };

  const handleCanvasZoom = (opt) => {
    const delta = opt.e.deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > MAX_ZOOM) zoom = MAX_ZOOM;
    if (zoom < MIN_ZOOM) zoom = MIN_ZOOM;
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  };

  const zoomIn = () => {
    const zoom = Math.min(canvas.getZoom() * 1.1, MAX_ZOOM);
    canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, zoom);
  };

  const zoomOut = () => {
    const zoom = Math.max(canvas.getZoom() * 0.9, MIN_ZOOM);
    canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, zoom);
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

  function adjustArrowsSize(arrowObjects, objectScaleY) {
    let triangleCount = 0;
    const triangles = [];

    arrowObjects.forEach(function (object) {
      if (object.get("type") === "triangle") {
        triangles[triangleCount] = object;
        triangleCount++;
        let ratio = 1 / objectScaleY;
        object.set("scaleY", ratio);
      }
    });

    canvas.requestRenderAll();
  }

  const adjustArrowProperty = (arrow, property, val) => {
    if (property === "stroke") {
      arrow._objects.forEach((obj) => {
        if (obj.get("type") === "line") {
          obj.set({ stroke: val });
        } else if (obj.get("type") === "triangle") {
          obj.set({ fill: val });
        }
      });
    } else if (property === "strokeWidth") {
      arrow._objects.forEach((obj) => {
        if (obj.get("type") === "line") {
          obj.set({ strokeWidth: val });
        }
      });
    }
  };

  const addArrow = () => {
    const arrowLength = 150;
    const arrowStroke = 6;
    const arrowHeadWidth = 20;
    const arrowHeadHeight = 20;
    const line = new fabric.Line([0, 0, 0, arrowLength - arrowHeadHeight], {
      strokeUniform: true,
      lockScalingX: true,
      borderColor: "transparent",
      left: arrowHeadWidth / 2 - arrowStroke / 2,
      top: arrowHeadHeight / 4,
      strokeWidth: arrowStroke,
      stroke: "#000",
    });
    const arrowHead = new fabric.Triangle({
      width: arrowHeadWidth,
      height: arrowHeadHeight,
      fill: "#000",
      scaleX: 1,
      scaleY: 1,
      strokeUniform: true,
      lockScalingX: true,
      lockScalingY: true,
      left: 0,
      top: 0,
    });
    const groupItems = [line, arrowHead];
    const group = new fabric.Group(groupItems, {
      hasControls: true,
      left: canvas.width / 2,
      top: canvas.height / 2,
      strokeUniform: true,
      lockScalingX: true,
      angle: 45,
    })
      .setControlsVisibility({
        ...lockControlVisibility,
        mt: true,
        mb: true,
        mtr: true,
      })
      .set("type", ARROW_TYPE)
      .set("stroke", "#000");

    addObjectToCanvas(group);
  };

  const downloadImage = () => {
    //resetCanvasZoomAndPosition();
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
    if (activeObject.type === ARROW_TYPE) {
      adjustArrowProperty(activeObject, property, val);
    }
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
        <>
          <div className="flex gap-4">
            <div>
              <div className="text-xl">Draw</div>
              <div className="p-4 card gap-3 drawPalette">
                <Button icon={<CircleOutlineIcon />} onClick={addCircle} />
                <Button icon={<SquareOutlineIcon />} onClick={addRectangle} />
                <Button icon={<FormatText />} onClick={addTextbox} />
                <Button icon={<ArrowTopRightThinIcon />} onClick={addArrow} />
              </div>
            </div>

            <div className="col">
              <div className="text-xl">Style</div>
              <div className="p-4 card">
                {!activeObject && (
                  <div>Select an existing object, or draw a new one.</div>
                )}
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
                            handlePalettePropertyChange(
                              "fill",
                              val.toHexString()
                            )
                          }
                          allowClear={true}
                          onClear={() =>
                            handlePalettePropertyChange("fill", null)
                          }
                        />
                      )}

                      {SUPPORTS_BACKGROUND_COLOR.includes(
                        activeObject.type
                      ) && (
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

                      {SUPPORTS_STROKE_WIDTH.includes(activeObject.type) &&
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

            <div>
              <div className="text-xl">Zoom</div>
              <div className="p-4 card flex gap-3 zoomPalette">
                <Button icon={<MagnifyPlusOutlineIcon />} onClick={zoomIn} />
                <Button icon={<MagnifyMinusOutlineIcon />} onClick={zoomOut} />
                <Button
                  icon={<MagnifyExpandIcon />}
                  onClick={resetCanvasZoomAndPosition}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
