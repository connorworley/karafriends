import React, { useEffect, useRef } from "react";
import invariant from "ts-invariant";

import "./JoysoundRenderer.css";

import parseJoysoundData, {
  decodeJoysoundText,
  JoysoundLyricsBlock,
  JoysoundMetadata,
} from "../common/joysoundParser";

import { RUBY_FONT_SIZE, RUBY_FONT_STROKE } from "../common/constants";

// XXX: These should be in their own file

const vsSource = `#version 300 es
  in vec2 a_position;
  in vec2 a_texCoord;
  in float a_scroll;
  in float a_scrollType;

  uniform vec2 u_resolution;

  out vec2 v_texCoord;
  out vec2 v_position;
  out float v_scroll;
  out float v_scrollType;

  void main() {
    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

    v_texCoord = a_texCoord;
    v_position = a_position;
    v_scroll = a_scroll;
    v_scrollType = a_scrollType;
  }
`;

const fsSource = `#version 300 es
  precision highp float;

  uniform sampler2D u_image;

  in vec2 v_texCoord;
  in vec2 v_position;
  in float v_scroll;
  in float v_scrollType;

  out vec4 outColor;

  void main() {
    vec4 textureColor = texture(u_image, v_texCoord);

    if (
      (v_scrollType == 0.0 && v_position.x <= v_scroll) ||
      (v_scrollType == 1.0 && v_position.x > v_scroll)
    ) {
      outColor = vec4(0.0, 0.0, 0.0, 0.0);
    } else {
      outColor = vec4(textureColor.r, textureColor.g, textureColor.b, textureColor.a);
    }
  }
`;

// XXX: Move these to some setting somewhere?
// XXX: RUBY_FONT_SIZE and RUBY_FONT_STROKE live in src/common/constants.ts for *reasons*

// XXX: This needs to be calculated correctly
let TEXTURE_OFF_X = 0;
let TEXTURE_OFF_Y = 0;

const TITLE_FONT_SIZE = 48;
const TITLE_FONT_STROKE = 4;

const ARTIST_FONT_SIZE = 32;
const ARTIST_FONT_STROKE = 4;

const METADATA_FONT_SIZE = 24;
const METADATA_FONT_STROKE = 3;

const MAIN_FONT_SIZE = 40;
const MAIN_FONT_STROKE = 4;

const ROMAJI_FONT_SIZE = 18;
const ROMAJI_FONT_STROKE = 3;

const SCREEN_WIDTH = 720;
const SCREEN_HEIGHT = 480;
const TEXT_PADDING = 8;

let EXPAND_RATE = 1.0;
const TIMING_OFFSET = -200;

const JP_FONT_FACE = "notoSerifJP";
const KR_FONT_FACE = "notoSerifKR";

interface LyricsBlockTextures {
  preTexture: WebGLTexture;
  postTexture: WebGLTexture;
}

interface JoysoundTitleRow {
  text: string;
  width: number;
}

interface JoysoundDisplayBuffers {
  position: WebGLBuffer;
  texCoord: WebGLBuffer;
  scroll: WebGLBuffer;
  scrollType: WebGLBuffer;
}

function getFontFace(fontCode: number): string {
  switch (fontCode) {
    case 0:
      return JP_FONT_FACE;
      break;
    case 1:
      return KR_FONT_FACE;
      break;
    default:
      return JP_FONT_FACE;
  }
}

function createShader(
  gl: WebGL2RenderingContext,
  type:
    | WebGLRenderingContextBase["VERTEX_SHADER"]
    | WebGLRenderingContextBase["FRAGMENT_SHADER"],
  source: string
) {
  const shader = gl.createShader(type);
  invariant(shader);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) {
  const program = gl.createProgram();
  invariant(program);

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  return program;
}

function quadToTriangles(
  x0: number,
  y0: number,
  x1: number,
  y1: number
): number[] {
  return [x0, y0, x1, y0, x0, y1, x0, y1, x1, y0, x1, y1];
}

function createTextureFromImage(
  gl: WebGL2RenderingContext,
  bitmap: HTMLCanvasElement
): WebGLTexture {
  const texture = gl.createTexture();
  invariant(texture);

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);

  return texture;
}

function getLyricsBlockWidth(lyricsBlock: JoysoundLyricsBlock): number {
  const mainBlockWidth = lyricsBlock.chars.reduce(
    (acc, curr) => acc + curr.width,
    0
  );

  const rightmostFuriganaBlock =
    lyricsBlock.furigana[lyricsBlock.furigana.length - 1];
  const furiganaBlockWidth = rightmostFuriganaBlock
    ? rightmostFuriganaBlock.xPos +
      (RUBY_FONT_SIZE + RUBY_FONT_STROKE * 2) *
        rightmostFuriganaBlock.chars.length
    : 0;

  return (
    MAIN_FONT_STROKE * 2 +
    Math.max(mainBlockWidth, furiganaBlockWidth) +
    TEXT_PADDING * 2
  );
}

function getLyricsBlockHeight(lyricsBlock: JoysoundLyricsBlock): number {
  return (
    MAIN_FONT_SIZE +
    MAIN_FONT_STROKE * 2 +
    RUBY_FONT_SIZE +
    RUBY_FONT_STROKE * 2 +
    TEXT_PADDING * 2
  );
}

function setupTextCanvas(
  textCtx: CanvasRenderingContext2D,
  lyricsBlock: JoysoundLyricsBlock,
  fillColor: number[],
  strokeColor: number[]
): void {
  textCtx.canvas.width = getLyricsBlockWidth(lyricsBlock) * EXPAND_RATE;
  textCtx.canvas.height = getLyricsBlockHeight(lyricsBlock) * EXPAND_RATE;
  textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);

  textCtx.textBaseline = "top";
  textCtx.lineJoin = "round";
  textCtx.fillStyle = `rgb(${fillColor.join(", ")})`;
  textCtx.strokeStyle = `rgb(${strokeColor.join(", ")})`;
}

function setupTitleCanvas(textCtx: CanvasRenderingContext2D): void {
  textCtx.canvas.width = (SCREEN_WIDTH + TEXT_PADDING * 2) * EXPAND_RATE;
  textCtx.canvas.height = (SCREEN_HEIGHT + TEXT_PADDING * 2) * EXPAND_RATE;
  textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);

  textCtx.textBaseline = "top";
  textCtx.lineJoin = "round";
  textCtx.fillStyle = `rgb(255, 255, 255)`;
  textCtx.strokeStyle = `rgb(8, 8, 8)`;
}

function createTitleRows(
  textCtx: CanvasRenderingContext2D,
  title: string
): JoysoundTitleRow[] {
  const titleRows = [];

  let currTitleText = "";
  let currTitleWidth = 0;

  for (const nextChar of title) {
    const nextTitleWidth = textCtx.measureText(currTitleText + nextChar).width;

    if (nextTitleWidth >= SCREEN_WIDTH) {
      titleRows.push({ text: currTitleText, width: currTitleWidth });

      currTitleText = nextChar;
      currTitleWidth = textCtx.measureText(nextChar).width;
    } else {
      currTitleText += nextChar;
      currTitleWidth = nextTitleWidth;
    }
  }

  titleRows.push({ text: currTitleText, width: currTitleWidth });

  return titleRows;
}

function drawTitleRowsToCanvas(
  textCtx: CanvasRenderingContext2D,
  titleRows: JoysoundTitleRow[],
  fontSize: number,
  fontStroke: number,
  yPos: number
) {
  for (const titleRow of titleRows) {
    const xPos = Math.max(0, (SCREEN_WIDTH - titleRow.width) / 2);

    drawTextToCanvas(textCtx, fontSize, fontStroke, xPos, yPos, titleRow.text);

    yPos += fontSize + fontStroke * 2;
  }
}

function createTitleTexture(
  gl: WebGL2RenderingContext,
  metadata: JoysoundMetadata,
  isRomaji: boolean
): WebGLTexture {
  const textCtx = document.createElement("canvas").getContext("2d");
  invariant(textCtx);

  setupTitleCanvas(textCtx);

  const titleFontSize =
    metadata.musicName.length < 48 ? TITLE_FONT_SIZE : ARTIST_FONT_SIZE;
  textCtx.font = `${titleFontSize}px ${JP_FONT_FACE}`;

  const titleRows = createTitleRows(textCtx, metadata.musicName);
  const titleHeight =
    (titleFontSize + TITLE_FONT_STROKE * 2) * titleRows.length;

  const artistFontSize =
    metadata.artistName.length < 64 ? ARTIST_FONT_SIZE : METADATA_FONT_SIZE;
  textCtx.font = `${artistFontSize}px ${JP_FONT_FACE}`;

  const artistRows = createTitleRows(textCtx, "♪ " + metadata.artistName);
  const artistHeight =
    (artistFontSize + ARTIST_FONT_STROKE * 2) * artistRows.length;

  textCtx.font = `${METADATA_FONT_SIZE}px ${JP_FONT_FACE}`;

  const lyricistText =
    (isRomaji ? "Lyrics: " : "作詞 ") + metadata.lyricistName;
  const lyricistMeasure = textCtx.measureText(lyricistText);
  const lyricistHeight =
    lyricistMeasure.actualBoundingBoxAscent +
    lyricistMeasure.actualBoundingBoxDescent;

  const composerText =
    (isRomaji ? "Composer: " : "作曲 ") + metadata.composerName;
  const composerMeasure = textCtx.measureText(composerText);
  const composerHeight =
    composerMeasure.actualBoundingBoxAscent +
    composerMeasure.actualBoundingBoxDescent;

  const titleYPos =
    (SCREEN_HEIGHT -
      titleHeight -
      artistHeight -
      lyricistHeight -
      composerHeight -
      128) /
    2;
  const artistYPos = titleYPos + titleHeight + 64;
  const lyricistYPos = artistYPos + artistHeight + 48;
  const composerYPos = lyricistYPos + lyricistHeight + 16;

  drawTitleRowsToCanvas(
    textCtx,
    titleRows,
    titleFontSize,
    TITLE_FONT_STROKE,
    titleYPos
  );
  drawTitleRowsToCanvas(
    textCtx,
    artistRows,
    artistFontSize,
    ARTIST_FONT_STROKE,
    artistYPos
  );

  drawTextToCanvas(
    textCtx,
    METADATA_FONT_SIZE,
    METADATA_FONT_STROKE,
    48,
    lyricistYPos,
    lyricistText
  );

  drawTextToCanvas(
    textCtx,
    METADATA_FONT_SIZE,
    METADATA_FONT_STROKE,
    48,
    composerYPos,
    composerText
  );

  const result = createTextureFromImage(gl, textCtx.canvas);

  textCtx.canvas.remove();

  return result;
}

function createLyricsBlockTexture(
  gl: WebGL2RenderingContext,
  textCtx: CanvasRenderingContext2D,
  lyricsBlock: JoysoundLyricsBlock,
  fillColor: number[],
  strokeColor: number[],
  isRomaji: boolean
): WebGLTexture {
  setupTextCanvas(textCtx, lyricsBlock, fillColor, strokeColor);

  drawMainTextToCanvas(textCtx, lyricsBlock);

  if (isRomaji) {
    drawRomajiTextToCanvas(textCtx, lyricsBlock);
  } else {
    drawFuriganaTextToCanvas(textCtx, lyricsBlock);
  }

  return createTextureFromImage(gl, textCtx.canvas);
}

function getTextOffset(
  textCtx: CanvasRenderingContext2D,
  text: string,
  charWidth: number
): number {
  const measure = textCtx.measureText(text);

  if (charWidth >= measure.width) {
    return 0;
  }

  if (
    measure.actualBoundingBoxLeft === 0 ||
    measure.actualBoundingBoxRight === 0
  ) {
    return (charWidth - measure.width) / 2;
  }

  const boundingBoxWidth =
    measure.actualBoundingBoxLeft + measure.actualBoundingBoxRight;
  const widthDiff = measure.width - charWidth;
  const halfDiff = widthDiff / 2;

  let leftOverflow = -1 * measure.actualBoundingBoxLeft;
  let rightOverflow = measure.width - measure.actualBoundingBoxRight;

  let isLeftOverflow = false;

  if (leftOverflow >= halfDiff) {
    leftOverflow -= halfDiff;
    isLeftOverflow = true;
  }

  let isRightOverflow = false;

  if (rightOverflow >= halfDiff) {
    rightOverflow -= halfDiff;
    isRightOverflow = true;
  }

  if (isLeftOverflow) {
    if (isRightOverflow) {
      return leftOverflow + measure.actualBoundingBoxLeft;
    } else if (leftOverflow >= halfDiff - rightOverflow) {
      return (
        leftOverflow -
        (halfDiff - rightOverflow) +
        measure.actualBoundingBoxLeft
      );
    }
  } else if (isRightOverflow && rightOverflow >= widthDiff - leftOverflow) {
    return measure.actualBoundingBoxLeft;
  }

  return (charWidth - boundingBoxWidth) / 2 + measure.actualBoundingBoxLeft;
}

function getRomajiTextOffset(
  textCtx: CanvasRenderingContext2D,
  text: string,
  sourceWidth: number
): number {
  const measure = textCtx.measureText(text);

  return (sourceWidth - measure.width) / 2;
}

function drawTextToCanvas(
  textCtx: CanvasRenderingContext2D,
  fontSize: number,
  fontStroke: number,
  xPos: number,
  yPos: number,
  text: string,
  fontCode: number = 0
): void {
  textCtx.font = `${fontSize * EXPAND_RATE}px ${getFontFace(fontCode)}`;
  textCtx.lineWidth = fontStroke * 2 * EXPAND_RATE;

  textCtx.strokeText(
    text,
    (xPos + fontStroke + TEXT_PADDING) * EXPAND_RATE,
    (yPos + fontStroke + TEXT_PADDING) * EXPAND_RATE
  );

  textCtx.fillText(
    text,
    (xPos + fontStroke + TEXT_PADDING) * EXPAND_RATE,
    (yPos + fontStroke + TEXT_PADDING) * EXPAND_RATE
  );
}

function drawMainTextToCanvas(
  textCtx: CanvasRenderingContext2D,
  lyricsBlock: JoysoundLyricsBlock
): void {
  let currX = 0;

  for (const glyphChar of lyricsBlock.chars) {
    const text = decodeJoysoundText(glyphChar.charCode, glyphChar.font);

    textCtx.font = `${MAIN_FONT_SIZE + MAIN_FONT_STROKE}px ${getFontFace(
      glyphChar.font
    )}`;
    textCtx.lineWidth = MAIN_FONT_STROKE;

    const xPos = currX + getTextOffset(textCtx, text, glyphChar.width);

    drawTextToCanvas(
      textCtx,
      MAIN_FONT_SIZE,
      MAIN_FONT_STROKE,
      xPos,
      RUBY_FONT_SIZE + RUBY_FONT_STROKE * 2,
      text,
      glyphChar.font
    );

    currX += glyphChar.width;
  }
}

function drawFuriganaTextToCanvas(
  textCtx: CanvasRenderingContext2D,
  lyricsBlock: JoysoundLyricsBlock
): void {
  for (const furiganaBlock of lyricsBlock.furigana) {
    let currX = furiganaBlock.xPos;

    for (const charCode of furiganaBlock.chars) {
      const unicodeChar = decodeJoysoundText(charCode);

      drawTextToCanvas(
        textCtx,
        RUBY_FONT_SIZE,
        RUBY_FONT_STROKE,
        currX,
        0,
        unicodeChar
      );

      currX += RUBY_FONT_SIZE + RUBY_FONT_STROKE;
    }
  }
}

function drawRomajiTextToCanvas(
  textCtx: CanvasRenderingContext2D,
  lyricsBlock: JoysoundLyricsBlock
): void {
  const sortedRomaji = lyricsBlock.romaji.sort((a, b) => a.xPos - b.xPos);

  for (const romajiBlock of sortedRomaji) {
    const xPos = Math.max(0, romajiBlock.xPos);
    const xOff = getRomajiTextOffset(
      textCtx,
      romajiBlock.phrase,
      romajiBlock.sourceWidth
    );

    drawTextToCanvas(
      textCtx,
      ROMAJI_FONT_SIZE,
      ROMAJI_FONT_STROKE,
      xPos + xOff,
      0,
      romajiBlock.phrase
    );
  }
}

function createLyricsBlockTextures(
  gl: WebGL2RenderingContext,
  lyricsData: JoysoundLyricsBlock[],
  isRomaji: boolean
): LyricsBlockTextures[] {
  const textCtx = document.createElement("canvas").getContext("2d");
  invariant(textCtx);

  const lyricsBlockTextures = [];

  for (const lyricsBlock of lyricsData) {
    const preTexture = createLyricsBlockTexture(
      gl,
      textCtx,
      lyricsBlock,
      lyricsBlock.preFill.rgb,
      lyricsBlock.preBorder.rgb,
      isRomaji
    );

    const postTexture = createLyricsBlockTexture(
      gl,
      textCtx,
      lyricsBlock,
      lyricsBlock.postFill.rgb,
      lyricsBlock.postBorder.rgb,
      isRomaji
    );

    lyricsBlockTextures.push({ preTexture, postTexture });
  }

  textCtx.canvas.remove();

  return lyricsBlockTextures;
}

function getScrollXPos(
  lyricsBlock: JoysoundLyricsBlock,
  refreshTime: number
): number {
  let xOff = 0;

  for (let i = 0; i < lyricsBlock.scrollEvents.length; i++) {
    const currScrollEvent = lyricsBlock.scrollEvents[i];

    if (refreshTime < currScrollEvent.time) {
      break;
    }

    let nextScrollEvent = null;

    if (i < lyricsBlock.scrollEvents.length - 1) {
      nextScrollEvent = lyricsBlock.scrollEvents[i + 1];
    }

    if (!nextScrollEvent || refreshTime < nextScrollEvent.time) {
      xOff +=
        (currScrollEvent.speed * (refreshTime - currScrollEvent.time)) / 1000;
    } else {
      xOff +=
        (currScrollEvent.speed *
          (nextScrollEvent.time - currScrollEvent.time)) /
        1000;
    }
  }

  return lyricsBlock.xPos + xOff;
}

function drawTitle(
  gl: WebGL2RenderingContext,
  glBuffers: JoysoundDisplayBuffers,
  titleTexture: WebGLTexture
): void {
  const scrollArray = new Float32Array(Array(6).fill(TEXTURE_OFF_X));
  const positions = quadToTriangles(
    TEXTURE_OFF_X - TEXT_PADDING,
    TEXTURE_OFF_Y - TEXT_PADDING,
    (SCREEN_WIDTH + TEXT_PADDING) * EXPAND_RATE + TEXTURE_OFF_X,
    (SCREEN_HEIGHT + TEXT_PADDING) * EXPAND_RATE + TEXTURE_OFF_Y
  );

  drawLyricsTexture(gl, glBuffers, titleTexture, positions, scrollArray, false);
}

function drawLyricsTexture(
  gl: WebGL2RenderingContext,
  glBuffers: JoysoundDisplayBuffers,
  texture: WebGLTexture,
  positions: number[],
  scrollArray: Float32Array,
  isPostTexture: boolean
) {
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers.scroll);
  gl.bufferData(gl.ARRAY_BUFFER, scrollArray, gl.STATIC_DRAW);

  const scrollTypeArray = new Float32Array(
    Array(6).fill(isPostTexture ? 1.0 : 0.0)
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers.scrollType);
  gl.bufferData(gl.ARRAY_BUFFER, scrollTypeArray, gl.STATIC_DRAW);

  const texCoordArray = new Float32Array(quadToTriangles(0.0, 0.0, 1.0, 1.0));

  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers.texCoord);
  gl.bufferData(gl.ARRAY_BUFFER, texCoordArray, gl.STATIC_DRAW);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers.position);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
}

function drawLyricsBlock(
  gl: WebGL2RenderingContext,
  glBuffers: JoysoundDisplayBuffers,
  lyricsBlock: JoysoundLyricsBlock,
  lyricsBlockTextures: LyricsBlockTextures[],
  index: number,
  refreshTime: number
) {
  const scrollXPos = Math.floor(getScrollXPos(lyricsBlock, refreshTime));
  const scrollArray = new Float32Array(
    Array(6).fill((scrollXPos - TEXT_PADDING) * EXPAND_RATE + TEXTURE_OFF_X)
  );

  const currX = lyricsBlock.xPos;
  const currY =
    lyricsBlock.yPos - (RUBY_FONT_SIZE + RUBY_FONT_STROKE * 2 + TEXT_PADDING);

  const rectWidth = getLyricsBlockWidth(lyricsBlock);
  const rectHeight = getLyricsBlockHeight(lyricsBlock);

  const positions = quadToTriangles(
    (currX - TEXT_PADDING) * EXPAND_RATE + TEXTURE_OFF_X,
    (currY - TEXT_PADDING) * EXPAND_RATE + TEXTURE_OFF_Y,
    (currX + rectWidth - TEXT_PADDING) * EXPAND_RATE + TEXTURE_OFF_X,
    (currY + rectHeight - TEXT_PADDING) * EXPAND_RATE + TEXTURE_OFF_Y
  );

  if (scrollXPos <= currX + getLyricsBlockWidth(lyricsBlock)) {
    drawLyricsTexture(
      gl,
      glBuffers,
      lyricsBlockTextures[index].preTexture,
      positions,
      scrollArray,
      false
    );
  }

  if (scrollXPos > currX) {
    drawLyricsTexture(
      gl,
      glBuffers,
      lyricsBlockTextures[index].postTexture,
      positions,
      scrollArray,
      true
    );
  }
}

export default function JoysoundRenderer(props: {
  telop: ArrayBuffer;
  videoRef: React.RefObject<HTMLVideoElement>;
  isRomaji: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRequestRef = useRef<number>(0);

  const updateSize = () => {
    const canvasElement = canvasRef.current;
    invariant(canvasElement);

    canvasElement.width = canvasElement.clientWidth * window.devicePixelRatio;
    canvasElement.height = canvasElement.clientHeight * window.devicePixelRatio;

    // XXX: Global variables but it works
    EXPAND_RATE = Math.min(
      canvasElement.width / SCREEN_WIDTH,
      canvasElement.height / SCREEN_HEIGHT
    );

    if (
      canvasElement.width / SCREEN_WIDTH >=
      canvasElement.height / SCREEN_HEIGHT
    ) {
      TEXTURE_OFF_X =
        (canvasElement.width -
          (canvasElement.height / SCREEN_HEIGHT) * SCREEN_WIDTH) /
        2;
    } else {
      TEXTURE_OFF_Y =
        (canvasElement.height -
          (canvasElement.width / SCREEN_WIDTH) * SCREEN_HEIGHT) /
        2;
    }

    const gl = canvasElement.getContext("webgl2", {
      antialias: false,
      premultipliedAlpha: false,
    });

    invariant(gl);
    gl.viewport(0, 0, canvasElement.width, canvasElement.height);
  };

  useEffect(() => {
    console.log("Joysound Renderer -- triggered re-render");

    updateSize();
    window.addEventListener("resize", updateSize);

    // Yeah we parse the data on each re-render, ffuck it
    const joysoundData = parseJoysoundData(props.telop);

    const metadata = joysoundData.metadata;
    const lyricsData = joysoundData.lyrics;
    const timeline = joysoundData.timeline;

    invariant(canvasRef.current);
    const gl = canvasRef.current.getContext("webgl2", {
      antialias: false,
      premultipliedAlpha: false,
    });
    invariant(gl);

    const titleTexture = createTitleTexture(gl, metadata, props.isRomaji);
    const lyricsBlockTextures = createLyricsBlockTextures(
      gl,
      lyricsData,
      props.isRomaji
    );

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const program = createProgram(gl, vertexShader, fragmentShader);

    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    );
    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    const scrollLocation = gl.getAttribLocation(program, "a_scroll");
    const scrollTypeLocation = gl.getAttribLocation(program, "a_scrollType");
    const resolutionUniformLocation = gl.getUniformLocation(
      program,
      "u_resolution"
    );

    const positionBuffer = gl.createBuffer();
    const texCoordBuffer = gl.createBuffer();
    const scrollBuffer = gl.createBuffer();
    const scrollTypeBuffer = gl.createBuffer();

    invariant(positionBuffer);
    invariant(texCoordBuffer);
    invariant(scrollBuffer);
    invariant(scrollTypeBuffer);

    const glBuffers: JoysoundDisplayBuffers = {
      position: positionBuffer,
      texCoord: texCoordBuffer,
      scroll: scrollBuffer,
      scrollType: scrollTypeBuffer,
    };

    function draw(now: number) {
      invariant(gl);
      invariant(props.videoRef.current);

      const refreshTime =
        props.videoRef.current.currentTime * 1000 + TIMING_OFFSET;
      invariant(refreshTime);

      gl.clearColor(0.0, 0.0, 0.0, 0.1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(
        gl.SRC_ALPHA,
        gl.ONE_MINUS_SRC_ALPHA,
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
      );

      gl.useProgram(program);

      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(
        positionAttributeLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );

      gl.enableVertexAttribArray(texCoordLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(scrollLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, scrollBuffer);
      gl.vertexAttribPointer(scrollLocation, 1, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(scrollTypeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, scrollTypeBuffer);
      gl.vertexAttribPointer(scrollTypeLocation, 1, gl.FLOAT, false, 0, 0);

      gl.uniform2f(
        resolutionUniformLocation,
        gl.canvas.width,
        gl.canvas.height
      );

      if (refreshTime < metadata.fadeoutTime) {
        drawTitle(gl, glBuffers, titleTexture);
      }

      for (let i = 0; i < lyricsData.length; i++) {
        const lyricsBlock = lyricsData[i];

        if (
          refreshTime >= lyricsBlock.fadeinTime &&
          refreshTime < lyricsBlock.fadeoutTime
        ) {
          drawLyricsBlock(
            gl,
            glBuffers,
            lyricsBlock,
            lyricsBlockTextures,
            i,
            refreshTime
          );
        }
      }

      animationFrameRequestRef.current = window.requestAnimationFrame(draw);
    }

    animationFrameRequestRef.current = window.requestAnimationFrame(draw);

    return () => {
      console.log("Joysound Renderer -- triggered post-render");

      window.removeEventListener("resize", updateSize);
      window.cancelAnimationFrame(animationFrameRequestRef.current);
    };
  }, [props.telop, props.isRomaji]);

  return <canvas ref={canvasRef} className="joysoundDisplay"></canvas>;
}
