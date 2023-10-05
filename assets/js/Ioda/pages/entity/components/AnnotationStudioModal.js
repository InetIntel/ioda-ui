import * as React from "react";
import {
  Button,
  ColorPicker,
  Input,
  Modal,
  Popover,
  Radio,
  Slider,
  Tooltip,
} from "antd";
import { fabric } from "fabric";

import iodaWatermark from "images/ioda-canvas-watermark.svg";

import FormatText from "@2fd/ant-design-icons/lib/FormatText";
import SquareOutlineIcon from "@2fd/ant-design-icons/lib/SquareOutline";
import CircleOutlineIcon from "@2fd/ant-design-icons/lib/CircleOutline";
import ArrangeBringForwardIcon from "@2fd/ant-design-icons/lib/ArrangeBringForward";
import ArrangeSendBackwardIcon from "@2fd/ant-design-icons/lib/ArrangeSendBackward";
import ArrangeBringToFrontIcon from "@2fd/ant-design-icons/lib/ArrangeBringToFront";
import ArrangeSendToBackIcon from "@2fd/ant-design-icons/lib/ArrangeSendToBack";
import MagnifyPlusOutlineIcon from "@2fd/ant-design-icons/lib/MagnifyPlusOutline";
import MagnifyMinusOutlineIcon from "@2fd/ant-design-icons/lib/MagnifyMinusOutline";
import MagnifyExpandIcon from "@2fd/ant-design-icons/lib/MagnifyExpand";
import ArrowTopRightThinIcon from "@2fd/ant-design-icons/lib/ArrowTopRightThin";
import DeleteIcon from "@2fd/ant-design-icons/lib/Delete";
import ContentDuplicateIcon from "@2fd/ant-design-icons/lib/ContentDuplicate";
import DrawIcon from "@2fd/ant-design-icons/lib/Draw";
import DrawingIcon from "@2fd/ant-design-icons/lib/Drawing";
import CursorDefaultIcon from "@2fd/ant-design-icons/lib/CursorDefault";

import { CloseOutlined, DownOutlined, EditOutlined } from "@ant-design/icons";
import Icon from "@ant-design/icons/lib/components/Icon";

const ARROW_TYPE = "arrow";

const DEFAULT_SHAPE_FILL = "#F93D4E30";

const SUPPORTS_FILL = ["circle", "rect", "textbox"];
const SUPPORTS_BACKGROUND_COLOR = ["textbox"];
const SUPPORTS_STROKE = ["circle", "rect", ARROW_TYPE, "path"];
const SUPPORTS_STROKE_WIDTH = ["circle", "rect", "path"];

const MIN_ZOOM = 1;
const MAX_ZOOM = 20;

const EXPORT_QUALITY = {
  LOW: 1,
  MED: 1.5,
  HIGH: 2,
};

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
      img.width = 4000;
      img.height = 2250;

      // Wait for the image to load
      img.onload = function () {
        // Create a Canvas element
        const canvas = document.createElement("canvas");
        canvas.width = 4000;
        canvas.height = 2250;

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

  const [exportQuality, setExportQuality] = React.useState(EXPORT_QUALITY.MED);
  const [fileName, setFileName] = React.useState(exportFileName);

  React.useEffect(() => {
    if (exportFileName !== fileName) {
      setFileName(exportFileName);
    }
  }, [exportFileName]);

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
        const watermarkWidth = canvas.width / 5;
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
      exitFreeDrawingMode();
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
          top: obj.top + 10,
          left: obj.left + 10,
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

  const duplicateSelection = () => {
    canvas.getActiveObject().clone((clonedObj) => {
      canvas.discardActiveObject();
      clonedObj.set({
        left: clonedObj.left + 10,
        top: clonedObj.top + 10,
        evented: true,
      });
      if (clonedObj.type === "activeSelection") {
        clonedObj.canvas = canvas;
        clonedObj.forEachObject(function (obj) {
          canvas.add(obj);
        });
        clonedObj.setCoords();
      } else {
        canvas.add(clonedObj);
      }
      canvas.setActiveObject(clonedObj);
      canvas.requestRenderAll();
    });
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

  const [drawShapePopoverOpen, setDrawShapePopoverOpen] = React.useState(false);

  const [freeDrawingMode, setFreeDrawingMode] = React.useState(false);
  const [freeDrawStroke, setFreeDrawStroke] = React.useState("#000000");
  const [freeDrawStrokeWidth, setFreeDrawStrokeWidth] = React.useState(5);

  const enterFreeDrawingMode = () => {
    canvas.discardActiveObject().renderAll();
    setFreeDrawingMode(true);
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = freeDrawStrokeWidth;
    canvas.freeDrawingBrush.color = freeDrawStroke;
  };

  const exitFreeDrawingMode = () => {
    setFreeDrawingMode(false);
    canvas.isDrawingMode = false;
    bringWatermarkToFront();
  };

  const toggleFreeDrawingMode = () => {
    if (freeDrawingMode) {
      exitFreeDrawingMode();
    } else {
      enterFreeDrawingMode();
    }
  };

  const handleFreeDrawStrokeChange = (val) => {
    setFreeDrawStroke(val);
    canvas.freeDrawingBrush.color = val;
  };

  const handleFreeDrawStrokeWidthChange = (val) => {
    setFreeDrawStrokeWidth(val);
    canvas.freeDrawingBrush.width = val;
  };

  const beforeDrawShape = () => {
    exitFreeDrawingMode();
  };

  const addCircle = () => {
    beforeDrawShape();
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
    beforeDrawShape();
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
    beforeDrawShape();
    const textbox = new fabric.Textbox("Double click to type", {
      width: 175,
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
    beforeDrawShape();

    const arrowLength = 150;
    const arrowStroke = 4;
    const arrowHeadWidth = 20;
    const arrowHeadHeight = 20;
    const line = new fabric.Line([0, 0, 0, arrowLength - arrowHeadHeight], {
      strokeUniform: true,
      lockScalingX: true,
      borderColor: "transparent",
      left: arrowHeadWidth / 2 - arrowStroke / 2,
      top: arrowHeadHeight / 2,
      strokeWidth: arrowStroke,
      stroke: "#000",
      strokeLineCap: "round",
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
    bringWatermarkToFront();
    const dataURL = canvas.toDataURL({
      width: canvas.width,
      height: canvas.height,
      format: "png",
      quality: 1,
      multiplier: exportQuality,
      enableRetinaScaling: true,
    });
    const link = document.createElement("a");
    link.download = `${fileName}.png`;
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
            <div className="flex">
              <Button
                type="primary"
                onClick={downloadImage}
                style={{
                  borderTopRightRadius: "0px",
                  borderBottomRightRadius: "0px",
                }}
              >
                Save
              </Button>
              <Popover
                placement="bottomRight"
                trigger="click"
                content={
                  <div className="w-96">
                    <div className="mb-2">
                      <div>File Name:</div>
                      <Input
                        defaultValue={exportFileName}
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                      />
                    </div>
                    <div>
                      <div>Image Quality:</div>
                      <Radio.Group
                        defaultValue={EXPORT_QUALITY.MED}
                        onChange={(e) => setExportQuality(e.target.value)}
                        buttonStyle="solid"
                        className="w-full"
                      >
                        <Radio.Button value={EXPORT_QUALITY.LOW}>
                          Low
                        </Radio.Button>
                        <Radio.Button value={EXPORT_QUALITY.MED}>
                          Med
                        </Radio.Button>
                        <Radio.Button value={EXPORT_QUALITY.HIGH}>
                          High
                        </Radio.Button>
                      </Radio.Group>
                    </div>
                  </div>
                }
              >
                <Button
                  type="primary"
                  icon={<DownOutlined />}
                  style={{
                    borderTopLeftRadius: "0px",
                    borderBottomLeftRadius: "0px",
                    borderLeft: "1px solid #fff",
                  }}
                />
              </Popover>
            </div>
          )}
          <Button
            className="ml-4"
            icon={<CloseOutlined />}
            onClick={confirmClose}
          />
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
      <div className="flex items-start gap-3">
        {loadedChart && (
          <div className="flex-column gap-4">
            <div className="flex-column gap-2 p-2 card">
              <Tooltip placement="right" title="Select">
                <Button
                  icon={<CursorDefaultIcon />}
                  type={!freeDrawingMode ? "primary" : "default"}
                  onClick={toggleFreeDrawingMode}
                />
              </Tooltip>
              <Tooltip placement="right" title="Free Draw">
                <Button
                  icon={<DrawIcon />}
                  type={freeDrawingMode ? "primary" : "default"}
                  onClick={toggleFreeDrawingMode}
                />
              </Tooltip>

              <Tooltip placement="right" title="Text">
                <Button icon={<FormatText />} onClick={addTextbox} />
              </Tooltip>

              <Popover
                open={drawShapePopoverOpen}
                onOpenChange={setDrawShapePopoverOpen}
                placement="rightTop"
                trigger="click"
                content={
                  <div
                    className="flex-column gap-2"
                    onClick={() => setDrawShapePopoverOpen(false)}
                  >
                    <Tooltip placement="right" title="Rectangle">
                      <Button
                        icon={<SquareOutlineIcon />}
                        onClick={addRectangle}
                      />
                    </Tooltip>
                    <Tooltip placement="right" title="Arrow">
                      <Button
                        icon={<ArrowTopRightThinIcon />}
                        onClick={addArrow}
                      />
                    </Tooltip>
                    <Tooltip placement="right" title="Circle">
                      <Button
                        icon={<CircleOutlineIcon />}
                        onClick={addCircle}
                      />
                    </Tooltip>
                  </div>
                }
              >
                <Tooltip placement="right" title="Draw Shape">
                  <Button icon={<DrawingIcon />} />
                </Tooltip>
              </Popover>
            </div>

            <div className="flex-column gap-2 p-2 card">
              <Tooltip placement="right" title="Zoom In">
                <Button icon={<MagnifyPlusOutlineIcon />} onClick={zoomIn} />
              </Tooltip>
              <Tooltip placement="right" title="Zoom Out">
                <Button icon={<MagnifyMinusOutlineIcon />} onClick={zoomOut} />
              </Tooltip>
              <Tooltip placement="right" title="Reset Zoom">
                <Button
                  icon={<MagnifyExpandIcon />}
                  onClick={resetCanvasZoomAndPosition}
                />
              </Tooltip>
            </div>

            <div className="flex-column gap-2 p-2 card">
              <Tooltip placement="right" title="Copy Selection">
                <Button
                  icon={<ContentDuplicateIcon />}
                  onClick={duplicateSelection}
                />
              </Tooltip>
              <Tooltip placement="right" title="Delete Selection">
                <Button
                  icon={<DeleteIcon />}
                  danger
                  onClick={canvasDeleteHandler}
                />
              </Tooltip>
            </div>
          </div>
        )}
        <div className="col">
          <div
            ref={canvasContainer}
            tabIndex="1000"
            onKeyDown={handleCanvasKeys}
            style={{ outline: "none" }}
            className="w-full relative mb-4 card flex items-center justify-center"
          >
            {!loadedChart && (
              <div className="absolute z-1 text-center w-1/3">
                <Icon
                  className="mb-4"
                  style={{ fontSize: "60px" }}
                  component={EditOutlined}
                />
                <p className="text-2xl font-bold">
                  Introducing the Annotation Studio
                </p>
                <p className="text-xl mt-4">
                  Use the annotation studio to markup the current chart view.
                  When you're done, save the image to share.
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
          {/* Show style control if we've selected a shape OR we're currently free drawing */}
          {loadedChart && (freeDrawingMode || activeObject) && (
            <div>
              <div className="text-xl">Style</div>
              <div className="p-4 card">
                <div className="flex gap-3 stylePalette">
                  {/* Controls for free drawing */}
                  {freeDrawingMode && (
                    <>
                      <ColorPicker
                        format="hex"
                        value={freeDrawStroke}
                        destroyTooltipOnHide={true}
                        showText={() => "Stroke"}
                        onChange={(val) =>
                          handleFreeDrawStrokeChange(val.toHexString())
                        }
                      />
                      <div className="card flex items-center gap-3 w-72 px-2">
                        <div style={{ marginBottom: "-2px" }}>Stroke Width</div>
                        <Slider
                          className="col-1 h-1"
                          min={1}
                          max={20}
                          onChange={(val) =>
                            handleFreeDrawStrokeWidthChange(val)
                          }
                          value={freeDrawStrokeWidth}
                        />
                      </div>
                    </>
                  )}

                  {/* Controls for selected object */}
                  {activeObject && (
                    <>
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
                      {
                        <>
                          <Tooltip placement="top" title="Bring Forward">
                            <Button
                              icon={<ArrangeBringForwardIcon />}
                              onClick={() => {
                                bringActiveObjectForward();
                                focusCanvasContainer();
                              }}
                            />
                          </Tooltip>
                          <Tooltip placement="top" title="Bring to Front">
                            <Button
                              icon={<ArrangeBringToFrontIcon />}
                              onClick={() => {
                                bringActiveObjectToFront();
                                focusCanvasContainer();
                              }}
                            />
                          </Tooltip>
                          <Tooltip placement="top" title="Send Backward">
                            <Button
                              icon={<ArrangeSendBackwardIcon />}
                              onClick={() => {
                                sendActiveObjectBackward();
                                focusCanvasContainer();
                              }}
                            />
                          </Tooltip>
                          <Tooltip placement="top" title="Send to Back">
                            <Button
                              icon={<ArrangeSendToBackIcon />}
                              onClick={() => {
                                sendActiveObjectToBack();
                                focusCanvasContainer();
                              }}
                            />
                          </Tooltip>
                        </>
                      }
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
