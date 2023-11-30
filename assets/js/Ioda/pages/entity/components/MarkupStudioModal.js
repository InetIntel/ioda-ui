import * as React from "react";
import {
  Button,
  ColorPicker,
  Divider,
  Form,
  Input,
  Modal,
  Popover,
  Radio,
  Slider,
  Tooltip,
  Select,
} from "antd";
import { fabric } from "fabric";
import "fabric-history";
import { registerAnalyticsEvent } from "../../../utils/analytics";

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
import CursorMoveIcon from "@2fd/ant-design-icons/lib/CursorMove";
import ArrowTopRightThinIcon from "@2fd/ant-design-icons/lib/ArrowTopRightThin";
import DeleteIcon from "@2fd/ant-design-icons/lib/Delete";
import ContentDuplicateIcon from "@2fd/ant-design-icons/lib/ContentDuplicate";
import DrawIcon from "@2fd/ant-design-icons/lib/Draw";
import DrawingIcon from "@2fd/ant-design-icons/lib/Drawing";
import CursorDefaultIcon from "@2fd/ant-design-icons/lib/CursorDefault";
import RedoIcon from "@2fd/ant-design-icons/lib/Redo";
import UndoIcon from "@2fd/ant-design-icons/lib/Undo";
import VectorLineIcon from "@2fd/ant-design-icons/lib/VectorLine";
import FormatFontIcon from "@2fd/ant-design-icons/lib/FormatFont";
import FormatAlignLeftIcon from "@2fd/ant-design-icons/lib/FormatAlignLeft";
import FormatAlignCenterIcon from "@2fd/ant-design-icons/lib/FormatAlignCenter";
import FormatAlignRightIcon from "@2fd/ant-design-icons/lib/FormatAlignRight";
import FormatAlignJustifyIcon from "@2fd/ant-design-icons/lib/FormatAlignJustify";

import FormatItalicIcon from "@2fd/ant-design-icons/lib/FormatItalic";
import FormatBoldIcon from "@2fd/ant-design-icons/lib/FormatBold";
import FormatUnderlineIcon from "@2fd/ant-design-icons/lib/FormatUnderline";

import FormatColorFillIcon from "@2fd/ant-design-icons/lib/FormatColorFill";
import LayersIcon from "@2fd/ant-design-icons/lib/Layers";
import FormatLineWeightIcon from "@2fd/ant-design-icons/lib/FormatLineWeight";
import LeadPencilIcon from "@2fd/ant-design-icons/lib/LeadPencil";
import PaletteIcon from "@2fd/ant-design-icons/lib/Palette";
import CogIcon from "@2fd/ant-design-icons/lib/Cog";

import { CloseOutlined } from "@ant-design/icons";
import MarkupStudioEntry from "./MarkupStudioEntry";
import MarkupStudioShare from "./MarkupStudioShare";

const MODAL_SCREENS = {
  ENTRY: "entry",
  EDITING: "editing",
  SHARE: "share",
};

const CANVAS_MODES = {
  SELECT: "select",
  DRAW: "draw",
  PAN: "pan",
};

const ARROW_TYPE = "arrow";

const DEFAULT_SHAPE_FILL = "#F93D4E30";

const CANVAS_TYPE = "canvasObject";
const CANVAS_ID = "canvasId";

const CANVAS_TYPES = {
  CIRCLE: "circle",
  RECTANGLE: "rect",
  TEXTBOX: "textbox",
  PATH: "path",
  LINE: "line",
  ARROW: "arrow",
};

// Property support by object type
const SUPPORTS_FILL = [
  CANVAS_TYPES.CIRCLE,
  CANVAS_TYPES.RECTANGLE,
  CANVAS_TYPES.TEXTBOX,
];
const SUPPORTS_BACKGROUND_COLOR = [CANVAS_TYPES.TEXTBOX];
const SUPPORTS_STROKE = [
  CANVAS_TYPES.CIRCLE,
  CANVAS_TYPES.RECTANGLE,
  ARROW_TYPE,
  CANVAS_TYPES.PATH,
  CANVAS_TYPES.LINE,
];
const SUPPORTS_STROKE_WIDTH = [
  CANVAS_TYPES.CIRCLE,
  CANVAS_TYPES.RECTANGLE,
  CANVAS_TYPES.PATH,
  CANVAS_TYPES.LINE,
];

const MIN_ZOOM = 1;
const MAX_ZOOM = 20;

const EXPORT_QUALITY = {
  LOW: 1000,
  MED: 2000,
  HIGH: 3000,
};

const EXPORT_TYPE = {
  JPEG: "jpeg",
  PNG: "png",
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

export default function MarkupStudioModal({
  open,
  svgString,
  hideModal,
  chartTitle,
  chartSubtitle,
  exportFileName,
  entityName,
  shareLink,
}) {
  const fabricCanvas = React.useRef(null);
  const canvasContainer = React.useRef(null);

  const [modalScreen, setModalScreen] = React.useState(MODAL_SCREENS.ENTRY);

  const [loadedChart, setLoadedChart] = React.useState(false);
  const [canvas, setCanvas] = React.useState(new fabric.Canvas());

  const [activeObject, setActiveObject] = React.useState(null);
  const [activeObjectAttributes, setActiveObjectAttributes] = React.useState({
    fill: null,
    backgroundColor: null,
    stroke: null,
    strokeWidth: null,

    // Textbox specific
    fontFamily: null,
    fontSize: null,
    textAlign: null,
    fontStyle: null,
    fontWeight: null,
  });

  const [layerPopoverOpen, setLayerPopoverOpen] = React.useState(false);

  const [copySelection, setCopySelection] = React.useState(null);
  const [zoomLevel, setZoomLevel] = React.useState(1);

  const [canvasImage, setCanvasImage] = React.useState(null);
  const [exportQuality, setExportQuality] = React.useState(EXPORT_QUALITY.MED);
  const [fileName, setFileName] = React.useState(exportFileName);
  const [fileType, setFileType] = React.useState(EXPORT_TYPE.PNG);

  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);

  const panningMode = React.useRef(false);

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
    setZoomLevel(1);
  };

  const wipeCanvas = () => {
    canvas.clear();
    setCanvas(null);
    setLoadedChart(false);
    setActiveObject(null);
    setCopySelection(null);
    setModalScreen(MODAL_SCREENS.ENTRY);
  };

  const loadCanvasChartBackground = (chartImage) => {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(chartImage, (chartImage) => {
        chartImage
          .scaleToWidth(canvas.width)
          .set({
            top: 28,
            left: 0,
            selectable: false,
            evented: false,
            noScaleCache: false,
          })
          .set(CANVAS_ID, "chartBackground");
        canvas.add(chartImage).renderAll();
        resolve();
      });
    });
  };

  const loadCanvasWatermark = () => {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(iodaWatermark, (watermark) => {
        const watermarkWidth = canvas.width / 5;
        watermark
          .scaleToWidth(watermarkWidth)
          .set({
            top: 10,
            left: canvas.width - watermarkWidth - 10,
            selectable: false,
            evented: false,
            noScaleCache: false,
          })
          .set(CANVAS_ID, "watermark");
        canvas.add(watermark).renderAll();
        resolve();
      });
    });
  };

  const getObjectById = (id) => {
    return canvas.getObjects().find((obj) => obj.get(CANVAS_ID) === id) ?? null;
  };

  const getCanvasViewportCenter = () => {
    const zoom = canvas.getZoom();
    return {
      x:
        fabric.util.invertTransform(canvas.viewportTransform)[4] +
        canvas.width / zoom / 2,
      y:
        fabric.util.invertTransform(canvas.viewportTransform)[5] +
        canvas.height / zoom / 2,
    };
  };

  const loadCanvasImageBase = async () => {
    if (!canvas) return;
    const chartImage = await getBase64PNGFromSVGString(svgString);
    await loadCanvasChartBackground(chartImage);

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
      })
        .setControlsVisibility({
          ...lockControlVisibility,
        })
        .set(CANVAS_TYPE, "textbox")
    );

    canvas.add(
      new fabric.Textbox(chartSubtitle, {
        top: 32,
        left: 8,
        fill: "#000",
        backgroundColor: "#fff",
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
        width: canvas.width - 8,
        lockMovementY: true,
        lockMovementX: true,
      })
        .setControlsVisibility({
          ...lockControlVisibility,
        })
        .set(CANVAS_TYPE, "textbox")
    );

    await loadCanvasWatermark();

    canvas.on("selection:created", handleObjectSelectionChange);
    canvas.on("selection:updated", handleObjectSelectionChange);
    canvas.on("selection:cleared", handleObjectSelectionChange);

    canvas.on("mouse:wheel", handleCanvasZoom);

    canvas.on("object:scaling", function (e) {
      if (e.target.get(CANVAS_TYPE) === ARROW_TYPE) {
        adjustArrowsSize(e.target._objects, e.target.get("scaleY"));
      }
    });

    canvas.on("object:scaled", function (e) {
      if (e.target.get(CANVAS_TYPE) === ARROW_TYPE) {
        adjustArrowsSize(e.target._objects, e.target.get("scaleY"));
      }
    });

    // http://fabricjs.com/fabric-intro-part-5 These handlers are not
    // delegated to separate methods because we need direct namespace access
    // to the canvas object
    canvas.on("mouse:down", function (opt) {
      // Don't pan if alt key isn't pressed, pan mode isn't enabled, or if we're
      // currently drawing
      if (!(opt.e?.altKey || panningMode.current) || canvas.isDrawingMode) {
        return false;
      }

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

    canvas.on("history:append", captureHistoryCapabilities);
    canvas.on("history:undo", captureHistoryCapabilities);
    canvas.on("history:redo", captureHistoryCapabilities);
    canvas.on("history:clear", captureHistoryCapabilities);

    setLoadedChart(true);
    setModalScreen(MODAL_SCREENS.EDITING);
    canvas.clearHistory();
  };

  const captureHistoryCapabilities = () => {
    setCanUndo(canvas.historyUndo.length > 0);
    setCanRedo(canvas.historyRedo.length > 0);
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

    setZoomLevel(zoom);
  };

  const zoomIn = () => {
    const zoom = Math.min(canvas.getZoom() + 0.1, MAX_ZOOM);
    canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, zoom);
    setZoomLevel(zoom);
  };

  const zoomOut = () => {
    const zoom = Math.max(canvas.getZoom() - 0.1, MIN_ZOOM);
    canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, zoom);
    setZoomLevel(zoom);
  };

  const focusCanvasContainer = () => {
    canvasContainer.current?.focus();
  };

  const handleCanvasKeys = (e) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      // Delete
      e.preventDefault();
      canvasDeleteHandler();
    } else if (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) {
      // CMD/CTRL + C
      e.preventDefault();
      canvasCopyHandler();
    } else if (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) {
      // CMD/CTRL + V
      e.preventDefault();
      canvasPasteHandler();
    } else if (e.keyCode === 68 && (e.ctrlKey || e.metaKey)) {
      // CMD/CTRL + D
      e.preventDefault();
      duplicateActiveSelection();
    } else if (
      // CMD/CTRL + SHIFT + Z or CMD/CTRL + Y
      (e.keyCode === 90 && e.shiftKey && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 89 && (e.ctrlKey || e.metaKey))
    ) {
      e.preventDefault();
      canvasRedoHandler();
    } else if (e.keyCode === 90 && (e.ctrlKey || e.metaKey)) {
      // CMD/CTRL + Z
      e.preventDefault();
      canvasUndoHandler();
    } else if (e.keyCode === 48 && (e.ctrlKey || e.metaKey)) {
      // CMD/CTRL + 0
      e.preventDefault();
      resetCanvasZoomAndPosition();
    } else if (e.key === "Escape") {
      // Escape
      e.preventDefault();
      canvas.discardActiveObject().renderAll();
      handleEscape();
    } else if (e.keyCode === 37) {
      // Left Arrow
      e.preventDefault();
      nudgeSelection("left");
    } else if (e.keyCode === 38) {
      // Up Arrow
      e.preventDefault();
      nudgeSelection("up");
    } else if (e.keyCode === 39) {
      // Right Arrow
      e.preventDefault();
      nudgeSelection("right");
    } else if (e.keyCode === 40) {
      // Down Arrow
      e.preventDefault();
      nudgeSelection("down");
    } else if (e.keyCode === 187 && (e.ctrlKey || e.metaKey)) {
      // CMD/CTRL + +
      e.preventDefault();
      zoomIn();
    } else if (e.keyCode === 189 && (e.ctrlKey || e.metaKey)) {
      // CMD/CTRL + -
      e.preventDefault();
      zoomOut();
    }
  };

  const handleEscape = () => {
    setActiveObject(null);
    setLayerPopoverOpen(false);
    enterSelectMode();
  };

  const canvasUndoHandler = () => {
    canvas.undo();
  };

  const canvasRedoHandler = () => {
    canvas.redo();
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
    const selection = canvas.getActiveObject();
    setCopySelection(selection);
  };

  const canvasPasteHandler = () => {
    if (!copySelection) return;
    canvas.discardActiveObject();

    duplicateSelection(copySelection);
  };

  const duplicateActiveSelection = () => {
    duplicateSelection(canvas.getActiveObject());
  };

  const duplicateSelection = (selection) => {
    selection.clone(
      (clonedObj) => {
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
      },
      [CANVAS_TYPE, CANVAS_ID]
    );
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

        // Textbox specific
        fontFamily: item?.fontFamily ?? null,
        fontSize: item?.fontSize ?? null,
        textAlign: item?.textAlign ?? null,
        fontStyle: item?.fontStyle ?? null,
        fontWeight: item?.fontWeight ?? null,
      });
    }
  };

  // Used to ensure the chart is always at the back
  const sendChartToBack = () => {
    const chartBackground = getObjectById("chartBackground");
    if (!chartBackground) return;
    canvas.sendToBack(chartBackground);
  };

  // Used to ensure the watermark is always at the front
  const bringWatermarkToFront = () => {
    const watermark = getObjectById("watermark");
    if (!watermark) return;
    canvas.bringToFront(watermark);
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

  const [canvasMode, setCanvasMode] = React.useState(CANVAS_MODES.SELECT);

  const [freeDrawStroke, setFreeDrawStroke] = React.useState("#000000");
  const [freeDrawStrokeWidth, setFreeDrawStrokeWidth] = React.useState(5);

  const enterPanningMode = () => {
    resetCanvasModeStates();

    canvas.defaultCursor = "grab";
    setCanvasMode(CANVAS_MODES.PAN);
    panningMode.current = true;
  };

  const exitPanningMode = () => {
    resetCanvasModeStates();
  };

  const togglePanningMode = () => {
    if (canvasMode === CANVAS_MODES.PAN) {
      enterSelectMode();
    } else {
      enterPanningMode();
    }
  };

  const enterFreeDrawingMode = () => {
    canvas.defaultCursor = "crosshair";
    resetCanvasModeStates();

    canvas.discardActiveObject().renderAll();
    setCanvasMode(CANVAS_MODES.DRAW);

    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = freeDrawStrokeWidth;
    canvas.freeDrawingBrush.color = freeDrawStroke;
  };

  const exitFreeDrawingMode = () => {
    canvas.isDrawingMode = false;

    // Register all paths with our custom type
    const paths = canvas.getObjects().filter((obj) => obj.type === "path");
    paths.forEach((path) => path.set(CANVAS_TYPE, CANVAS_TYPES.PATH));

    bringWatermarkToFront();
  };

  const toggleFreeDrawingMode = () => {
    if (canvasMode === CANVAS_MODES.DRAW) {
      enterSelectMode();
    } else {
      enterFreeDrawingMode();
    }
  };

  const enterSelectMode = () => {
    resetCanvasModeStates();
    exitFreeDrawingMode();
    exitPanningMode();
    setCanvasMode(CANVAS_MODES.SELECT);
  };

  const resetCanvasModeStates = () => {
    canvas.isDrawingMode = false;
    panningMode.current = false;
    canvas.defaultCursor = "default";
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

    const { x, y } = getCanvasViewportCenter();
    const circleRadius = 50 / canvas.getZoom();

    const circle = new fabric.Circle({
      radius: circleRadius,
      fill: DEFAULT_SHAPE_FILL,
      stroke: null,
      strokeWidth: 1,
      strokeUniform: true,
      left: x - circleRadius,
      top: y - circleRadius,
    }).set(CANVAS_TYPE, CANVAS_TYPES.CIRCLE);
    addObjectToCanvas(circle);
  };

  const addRectangle = () => {
    beforeDrawShape();

    const { x, y } = getCanvasViewportCenter();
    const rectWidth = 100 / canvas.getZoom();
    const rectHeight = 100 / canvas.getZoom();

    const rect = new fabric.Rect({
      width: rectWidth,
      height: rectHeight,
      fill: DEFAULT_SHAPE_FILL,
      stroke: null,
      strokeWidth: 1,
      strokeUniform: true,
      left: x - rectWidth / 2,
      top: y - rectHeight / 2,
    }).set(CANVAS_TYPE, CANVAS_TYPES.RECTANGLE);
    addObjectToCanvas(rect);
  };

  const textAlignmentOptions = [
    { label: "Left", value: "left", icon: <FormatAlignLeftIcon /> },
    { label: "Center", value: "center", icon: <FormatAlignCenterIcon /> },
    { label: "Right", value: "right", icon: <FormatAlignRightIcon /> },
    { label: "Justify", value: "justify", icon: <FormatAlignJustifyIcon /> },
  ];

  const textFontFamilies = [
    { label: "Inter", value: "Inter, sans-serif" },
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Helvetica", value: "Helvetica, sans-serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Times New Roman", value: "Times New Roman, serif" },
    { label: "Courier New", value: "Courier New, monospace" },
    { label: "Verdana", value: "Verdana, sans-serif" },
    { label: "Tahoma", value: "Tahoma, sans-serif" },
    { label: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
    { label: "Impact", value: "Impact, sans-serif" },
  ];

  const textFontFamilyOptions = textFontFamilies.map((font) => (
    <Select.Option
      key={font.value}
      value={font.value}
      title={<span style={{ fontFamily: font.value }}>{font.label}</span>}
    >
      <span style={{ fontFamily: font.value }}>{font.label}</span>
    </Select.Option>
  ));

  const addTextbox = () => {
    beforeDrawShape();

    const { x, y } = getCanvasViewportCenter();
    const textWidth = 175 / canvas.getZoom();
    const textSize = Math.max(Math.floor(16 / canvas.getZoom()), 4);

    const textbox = new fabric.Textbox("Double click to type", {
      width: textWidth,
      fontSize: textSize,
      fill: "#000",
      backgroundColor: null,
      textAlign: "center",
      fontFamily: "Inter, sans-serif",
      left: x - textWidth / 2,
      top: y,
    }).set(CANVAS_TYPE, CANVAS_TYPES.TEXTBOX);
    addObjectToCanvas(textbox);
  };

  const addLine = () => {
    beforeDrawShape();

    const { x, y } = getCanvasViewportCenter();

    const lineLength = 100 / canvas.getZoom();
    const lineStroke = Math.max(Math.floor(4 / canvas.getZoom()), 1);

    var line = new fabric.Line(
      [
        x - lineLength / 2,
        y - lineLength / 2,
        x + lineLength / 2,
        y + lineLength / 2,
      ],
      {
        stroke: "#000",
        strokeWidth: lineStroke,
        lockScalingX: false,
        strokeUniform: true,
        objectCaching: false,
      }
    ).set(CANVAS_TYPE, CANVAS_TYPES.LINE);

    addObjectToCanvas(line);
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

    const { x, y } = getCanvasViewportCenter();

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
      left: x + 75,
      top: y - 75,
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
      .set(CANVAS_TYPE, CANVAS_TYPES.ARROW);

    addObjectToCanvas(group);
  };

  const getCanvasAsBase64 = () => {
    const scale = exportQuality / canvas.width;
    bringWatermarkToFront();
    return canvas.toDataURL({
      width: canvas.width,
      height: canvas.height,
      format: fileType,
      quality: 1,
      multiplier: Math.max(scale, 1),
    });
  };

  const downloadImageFromDataUrl = (dataURL) => {
    setCanvasImage(dataURL);
    setModalScreen(MODAL_SCREENS.SHARE);

    const link = document.createElement("a");
    link.download = `${fileName}.${fileType}`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAndShareImage = () => {
    const dataURL = getCanvasAsBase64();
    setCanvasImage(dataURL);
    setModalScreen(MODAL_SCREENS.SHARE);
    downloadImageFromDataUrl(dataURL);

    // Register metric on Google Analytics
    registerAnalyticsEvent("MarkupModal", "UserSaveImage");
  };

  const redownloadImage = () => {
    if (!canvasImage) return;
    downloadImageFromDataUrl(canvasImage);
  };

  const objectSupportsProperty = (object, property) => {
    if (!object) return false;
    if (property === "fill") {
      return SUPPORTS_FILL.includes(object.get(CANVAS_TYPE));
    } else if (property === "backgroundColor") {
      return SUPPORTS_BACKGROUND_COLOR.includes(object.get(CANVAS_TYPE));
    } else if (property === "stroke") {
      return SUPPORTS_STROKE.includes(object.get(CANVAS_TYPE));
    } else if (property === "strokeWidth") {
      return SUPPORTS_STROKE_WIDTH.includes(object.get(CANVAS_TYPE));
    }
    return false;
  };

  const handlePalettePropertyChange = (property, val) => {
    if (!activeObject) return;
    if (activeObject[CANVAS_TYPE] === ARROW_TYPE) {
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

  const chartReady = loadedChart && modalScreen === MODAL_SCREENS.EDITING;

  return (
    <Modal
      className="markupStudioModal"
      open={open}
      closeIcon={null}
      title={
        <div className="flex items-center">
          <div className="col-1 truncate">Markup Studio</div>

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
      <div className="flex items-start gap-4">
        {chartReady && (
          <div className="flex-column card p-2">
            {/* LEFT VERTICAL PANEL */}
            <Tooltip placement="left" title="Select">
              <Button
                icon={<CursorDefaultIcon />}
                type={canvasMode === CANVAS_MODES.SELECT ? "primary" : "text"}
                onClick={enterSelectMode}
              />
            </Tooltip>
            <Tooltip placement="left" title="Pan">
              <Button
                icon={<CursorMoveIcon />}
                type={canvasMode === CANVAS_MODES.PAN ? "primary" : "text"}
                onClick={togglePanningMode}
              />
            </Tooltip>
            <Tooltip placement="left" title="Free Draw">
              <Button
                icon={<DrawIcon />}
                type={canvasMode === CANVAS_MODES.DRAW ? "primary" : "text"}
                onClick={toggleFreeDrawingMode}
              />
            </Tooltip>

            <Tooltip placement="left" title="Text">
              <Button icon={<FormatText />} onClick={addTextbox} type="text" />
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
                  <Tooltip placement="left" title="Rectangle">
                    <Button
                      icon={<SquareOutlineIcon />}
                      onClick={addRectangle}
                    />
                  </Tooltip>
                  <Tooltip placement="left" title="Arrow">
                    <Button
                      icon={<ArrowTopRightThinIcon />}
                      onClick={addArrow}
                    />
                  </Tooltip>
                  <Tooltip placement="left" title="Line">
                    <Button icon={<VectorLineIcon />} onClick={addLine} />
                  </Tooltip>
                  <Tooltip placement="left" title="Circle">
                    <Button icon={<CircleOutlineIcon />} onClick={addCircle} />
                  </Tooltip>
                </div>
              }
            >
              <Tooltip placement="left" title="Draw Shape">
                <Button icon={<DrawingIcon />} type="text" />
              </Tooltip>
            </Popover>

            {(activeObject || canvasMode === CANVAS_MODES.DRAW) && (
              <Divider className="my-1" />
            )}

            {/*Free Drawing Color Control */}
            {canvasMode === CANVAS_MODES.DRAW && (
              <ColorPicker
                placement="rightTop"
                format="hex"
                value={freeDrawStroke}
                destroyTooltipOnHide={true}
                onChange={(val) =>
                  handleFreeDrawStrokeChange(val.toHexString())
                }
                allowClear={true}
                children={
                  <Tooltip placement="left" title="Stroke">
                    <Button icon={<LeadPencilIcon />} type="text" />
                  </Tooltip>
                }
              />
            )}

            {/*Free Drawing Stroke Width Control */}
            {canvasMode === CANVAS_MODES.DRAW && (
              <Popover
                placement="rightTop"
                trigger="click"
                content={
                  <div className="flex items-center w-72">
                    <Slider
                      className="col-1 h-1"
                      min={1}
                      max={20}
                      onChange={(val) => handleFreeDrawStrokeWidthChange(val)}
                      value={freeDrawStrokeWidth}
                    />
                    <div className="w-4">{freeDrawStrokeWidth ?? 1}</div>
                  </div>
                }
              >
                <Tooltip placement="left" title="Stroke Weight">
                  <Button icon={<FormatLineWeightIcon />} type="text" />
                </Tooltip>
              </Popover>
            )}

            {/* Text Format Controls */}
            {activeObject &&
              activeObject[CANVAS_TYPE] === CANVAS_TYPES.TEXTBOX && (
                <Popover
                  placement="rightTop"
                  trigger="click"
                  content={
                    <div className="p-2 w-96">
                      <div>Alignment:</div>
                      <div className="flex items-center gap-2 mb-3">
                        {textAlignmentOptions.map((opt) => {
                          let buttonType = "default";
                          if (activeObjectAttributes.textAlign === opt.value) {
                            buttonType = "primary";
                          } else if (
                            activeObjectAttributes.textAlign == null &&
                            opt.value === "center"
                          ) {
                            buttonType = "primary";
                          }
                          return (
                            <Tooltip
                              placement="top"
                              title={opt.label}
                              key={opt.value}
                            >
                              <Button
                                icon={opt.icon}
                                type={buttonType}
                                onClick={() =>
                                  handlePalettePropertyChange(
                                    "textAlign",
                                    opt.value
                                  )
                                }
                              />
                            </Tooltip>
                          );
                        })}
                      </div>

                      <div>Style:</div>
                      <div className="flex items-center gap-2 mb-3">
                        <Tooltip placement="top" title="Bold">
                          <Button
                            icon={<FormatBoldIcon />}
                            type={
                              activeObjectAttributes.fontWeight === "bold"
                                ? "primary"
                                : "default"
                            }
                            onClick={() =>
                              handlePalettePropertyChange(
                                "fontWeight",
                                activeObjectAttributes.fontWeight === "bold"
                                  ? "normal"
                                  : "bold"
                              )
                            }
                          />
                        </Tooltip>
                        <Tooltip placement="top" title="Italic">
                          <Button
                            icon={<FormatItalicIcon />}
                            type={
                              activeObjectAttributes.fontStyle === "italic"
                                ? "primary"
                                : "default"
                            }
                            onClick={() =>
                              handlePalettePropertyChange(
                                "fontStyle",
                                activeObjectAttributes.fontStyle === "italic"
                                  ? "normal"
                                  : "italic"
                              )
                            }
                          />
                        </Tooltip>
                        <Tooltip placement="top" title="Underline">
                          <Button
                            icon={<FormatUnderlineIcon />}
                            type={
                              activeObjectAttributes.underline
                                ? "primary"
                                : "default"
                            }
                            onClick={() =>
                              handlePalettePropertyChange(
                                "underline",
                                !activeObjectAttributes.underline
                              )
                            }
                          />
                        </Tooltip>
                      </div>

                      <div>Font size:</div>
                      <div className="w-full pr-2">
                        <Slider
                          className="w-full h-1"
                          min={4}
                          max={50}
                          onChange={(val) =>
                            handlePalettePropertyChange("fontSize", val)
                          }
                          value={activeObjectAttributes.fontSize ?? 4}
                        />
                      </div>

                      <div>Font family:</div>
                      <Select
                        className="w-full"
                        value={
                          activeObjectAttributes?.fontFamily ??
                          "Inter, sans-serif"
                        }
                        onChange={(val) =>
                          handlePalettePropertyChange("fontFamily", val)
                        }
                        optionLabelProp="title"
                      >
                        {textFontFamilyOptions}
                      </Select>
                    </div>
                  }
                >
                  <Tooltip placement="left" title="Format Font">
                    <Button icon={<FormatFontIcon />} type="text" />
                  </Tooltip>
                </Popover>
              )}

            {/* Fill Color Control */}
            {objectSupportsProperty(activeObject, "fill") && (
              <ColorPicker
                format="hex"
                value={activeObjectAttributes?.fill}
                destroyTooltipOnHide={true}
                placement="rightTop"
                showText={false}
                onChange={(val) =>
                  handlePalettePropertyChange("fill", val.toHexString())
                }
                allowClear={true}
                onClear={() => handlePalettePropertyChange("fill", null)}
                children={
                  <Tooltip
                    placement="left"
                    title={
                      activeObject?.get(CANVAS_TYPE) === CANVAS_TYPES.TEXTBOX
                        ? "Text Color"
                        : "Fill"
                    }
                  >
                    <Button icon={<PaletteIcon />} type="text" />
                  </Tooltip>
                }
              />
            )}

            {/* Background Color Control (Textbox only) */}
            {objectSupportsProperty(activeObject, "backgroundColor") && (
              <ColorPicker
                placement="rightTop"
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
                children={
                  <Tooltip placement="left" title="Background">
                    <Button icon={<FormatColorFillIcon />} type="text" />
                  </Tooltip>
                }
              />
            )}

            {/* Stroke Color Control */}
            {objectSupportsProperty(activeObject, "stroke") && (
              <ColorPicker
                placement="rightTop"
                format="hex"
                value={activeObjectAttributes?.stroke}
                destroyTooltipOnHide={true}
                showText={() => "Stroke"}
                onChange={(val) =>
                  handlePalettePropertyChange("stroke", val.toHexString())
                }
                allowClear={true}
                onClear={() => handlePalettePropertyChange("stroke", null)}
                children={
                  <Tooltip placement="left" title="Stroke">
                    <Button icon={<LeadPencilIcon />} type="text" />
                  </Tooltip>
                }
              />
            )}

            {/* Stroke Width Control */}
            {objectSupportsProperty(activeObject, "strokeWidth") &&
              activeObjectAttributes.stroke && (
                <Popover
                  placement="rightTop"
                  trigger="click"
                  content={
                    <div className="flex items-center w-72">
                      <Slider
                        className="col-1 h-1"
                        min={1}
                        max={20}
                        onChange={(val) =>
                          handlePalettePropertyChange("strokeWidth", val)
                        }
                        value={activeObjectAttributes?.strokeWidth ?? 1}
                      />
                      <div className="w-4">
                        {activeObjectAttributes?.strokeWidth ?? 1}
                      </div>
                    </div>
                  }
                >
                  <Tooltip placement="left" title="Stroke Weight">
                    <Button icon={<FormatLineWeightIcon />} type="text" />
                  </Tooltip>
                </Popover>
              )}

            {activeObject && (
              <Popover
                open={layerPopoverOpen}
                onOpenChange={setLayerPopoverOpen}
                placement="rightTop"
                trigger="click"
                content={
                  <div className="flex-column gap-2">
                    <Tooltip placement="left" title="Bring Forward">
                      <Button
                        icon={<ArrangeBringForwardIcon />}
                        onClick={() => {
                          bringActiveObjectForward();
                          focusCanvasContainer();
                        }}
                      />
                    </Tooltip>
                    <Tooltip placement="left" title="Bring to Front">
                      <Button
                        icon={<ArrangeBringToFrontIcon />}
                        onClick={() => {
                          bringActiveObjectToFront();
                          focusCanvasContainer();
                        }}
                      />
                    </Tooltip>
                    <Tooltip placement="left" title="Send Backward">
                      <Button
                        icon={<ArrangeSendBackwardIcon />}
                        onClick={() => {
                          sendActiveObjectBackward();
                          focusCanvasContainer();
                        }}
                      />
                    </Tooltip>
                    <Tooltip placement="left" title="Send to Back">
                      <Button
                        icon={<ArrangeSendToBackIcon />}
                        onClick={() => {
                          sendActiveObjectToBack();
                          focusCanvasContainer();
                        }}
                      />
                    </Tooltip>
                  </div>
                }
              >
                <Tooltip placement="left" title="Arrange">
                  <Button icon={<LayersIcon />} type="text" />
                </Tooltip>
              </Popover>
            )}

            <Divider className="my-1" />

            <Tooltip placement="left" title="Copy Selection">
              <Button
                icon={<ContentDuplicateIcon />}
                onClick={duplicateActiveSelection}
                type="text"
              />
            </Tooltip>
            <Tooltip placement="left" title="Delete Selection">
              <Button
                icon={<DeleteIcon />}
                danger
                onClick={canvasDeleteHandler}
                type="text"
              />
            </Tooltip>
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
            <MarkupStudioEntry
              show={modalScreen === MODAL_SCREENS.ENTRY}
              onStart={loadCanvasImageBase}
            />
            <MarkupStudioShare
              show={modalScreen === MODAL_SCREENS.SHARE}
              imagePreviewUrl={canvasImage}
              entityName={entityName}
              shareLink={shareLink}
              onBackToEditing={() => setModalScreen(MODAL_SCREENS.EDITING)}
              onDownload={() => redownloadImage()}
            />
            <canvas ref={fabricCanvas} width={800} height={448} />
          </div>

          {chartReady && (
            <div className="mt-6 w-full flex items-center">
              <div className="col flex items-center gap-3">
                <Button
                  icon={<UndoIcon />}
                  onClick={canvasUndoHandler}
                  disabled={!canUndo}
                >
                  Undo
                </Button>
                <Button
                  icon={<RedoIcon />}
                  onClick={canvasRedoHandler}
                  disabled={!canRedo}
                >
                  Redo
                </Button>
              </div>

              <div className="col flex justify-center items-center">
                <Button icon={<MagnifyMinusOutlineIcon />} onClick={zoomOut} />
                <div className="font-bold w-28 text-center">
                  {Math.round(zoomLevel * 100)}%
                </div>
                <Button icon={<MagnifyPlusOutlineIcon />} onClick={zoomIn} />
              </div>

              <div className="col flex justify-end items-center gap-3">
                <Button onClick={resetCanvasZoomAndPosition}>Reset View</Button>

                <div className="flex">
                  <Button
                    type="primary"
                    onClick={downloadAndShareImage}
                    style={{
                      borderTopRightRadius: "0px",
                      borderBottomRightRadius: "0px",
                    }}
                  >
                    Save & Share
                  </Button>
                  <Popover
                    placement="topRight"
                    trigger="click"
                    content={
                      <div style={{ width: "28rem" }}>
                        <Form onFinish={downloadAndShareImage}>
                          <div className="mb-2">
                            <div>File Name:</div>
                            <Input
                              defaultValue={exportFileName}
                              value={fileName}
                              onChange={(e) => setFileName(e.target.value)}
                            />
                          </div>
                          <div className="mb-2">
                            <div>File Type:</div>
                            <Radio.Group
                              defaultValue={EXPORT_TYPE.PNG}
                              onChange={(e) => setFileType(e.target.value)}
                              buttonStyle="solid"
                            >
                              <Radio.Button value={EXPORT_TYPE.PNG}>
                                PNG
                              </Radio.Button>
                              <Radio.Button value={EXPORT_TYPE.JPEG}>
                                JPEG
                              </Radio.Button>
                            </Radio.Group>
                          </div>
                          <div>
                            <div>Image Quality:</div>
                            <Radio.Group
                              defaultValue={EXPORT_QUALITY.MED}
                              onChange={(e) => setExportQuality(e.target.value)}
                              buttonStyle="solid"
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
                        </Form>
                      </div>
                    }
                  >
                    <Button
                      type="primary"
                      icon={<CogIcon />}
                      style={{
                        borderTopLeftRadius: "0px",
                        borderBottomLeftRadius: "0px",
                        borderLeft: "1px solid #fff",
                      }}
                    />
                  </Popover>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
