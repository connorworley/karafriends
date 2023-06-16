/* tslint:disable:max-classes-per-file */

import convert from "color-convert";
import Spline from "cubic-spline";
import vec from "gl-vec2";
import getNormals from "polyline-normals";
import React, { useEffect, useRef, useState } from "react";

import { InputDevice } from "./nativeAudio";
import "./PianoRoll.css";
import midiVertShaderRaw from "./shaders/PianoRollMidi.vert.glsl";
import noteFragShaderRaw from "./shaders/PianoRollNote.frag.glsl";
import seekVertShaderRaw from "./shaders/PianoRollSeek.vert.glsl";
import singleColorFragShaderRaw from "./shaders/PianoRollSingleColor.frag.glsl";

const TIME_WIDTH_SECS = 5.0;
const PITCH_RESOLUTION = 8;
const STROKE_WIDTH = 0.03;

function loadShader(
  gl: WebGLRenderingContext,
  type:
    | WebGLRenderingContextBase["VERTEX_SHADER"]
    | WebGLRenderingContextBase["FRAGMENT_SHADER"],
  source: string
) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`Error compiling shader: ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function edgesToTriangles(top: number[][], bottom: number[][]) {
  const triangles = [];

  for (let i = 0; i < top.length - 1; i++) {
    const x0 = top[i][0];
    const y0 = top[i][1];

    const x1 = bottom[i][0];
    const y1 = bottom[i][1];

    const x2 = top[i + 1][0];
    const y2 = top[i + 1][1];

    const x3 = bottom[i + 1][0];
    const y3 = bottom[i + 1][1];

    triangles.push(...[x0, y0, x1, y1, x2, y2, x1, y1, x2, y2, x3, y3]);
  }

  return triangles;
}

function quadToTriangles(x0: number, y0: number, x1: number, y1: number) {
  /*
    (x0, y0) - (x1, y0)
       |     \    |
    (x0, y1) - (x1, y1)

    GL makes us list triangles in counter-clockwise order
  */
  return [x0, y0, x0, y1, x1, y1, x0, y0, x1, y1, x1, y0];
}

function median(nums: number[]) {
  const numsSorted = [...nums];
  numsSorted.sort();
  const middleIndex = Math.floor(nums.length / 2);
  if (nums.length % 2 === 0) {
    return (numsSorted[middleIndex - 1] + numsSorted[middleIndex]) / 2;
  } else {
    return numsSorted[middleIndex];
  }
}

abstract class ShaderProgram<T extends unknown[]> {
  readonly gl: WebGLRenderingContext;
  readonly program: WebGLProgram;
  readonly attributeLocations: { [name: string]: number };
  readonly uniformLocations: { [name: string]: WebGLUniformLocation };
  readonly buffers: { [name: string]: WebGLBuffer };

  constructor(
    gl: WebGLRenderingContext,
    shaders: WebGLShader[],
    attributeNames: string[],
    uniformNames: string[],
    bufferNames: string[]
  ) {
    this.gl = gl;
    this.program = gl.createProgram()!;
    shaders.forEach((shader) => gl.attachShader(this.program, shader));
    gl.linkProgram(this.program);
    this.attributeLocations = Object.fromEntries(
      attributeNames.map((name) => [
        name,
        gl.getAttribLocation(this.program, name),
      ])
    );
    this.uniformLocations = Object.fromEntries(
      uniformNames.map((name) => [
        name,
        gl.getUniformLocation(this.program, name)!,
      ])
    );
    this.buffers = Object.fromEntries(
      bufferNames.map((name) => [name, gl.createBuffer()!])
    );
  }

  abstract draw(...args: T): void;
}

class NoteProgram extends ShaderProgram<[number, number]> {
  readonly triangleCount: number;

  constructor(gl: WebGLRenderingContext, positions: number[]) {
    super(
      gl,
      [
        loadShader(gl, gl.VERTEX_SHADER, midiVertShaderRaw)!,
        loadShader(gl, gl.FRAGMENT_SHADER, noteFragShaderRaw)!,
      ],
      ["position"],
      ["time", "timeWidth", "canvasWidth"],
      ["positions"]
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positions);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    this.triangleCount = positions.length / 2;
  }

  draw(time: number, canvasWidth: number) {
    if (this.gl.CURRENT_PROGRAM !== this.program) {
      this.gl.useProgram(this.program);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.positions);
      this.gl.vertexAttribPointer(
        this.attributeLocations.position,
        2,
        this.gl.FLOAT,
        false,
        0,
        0
      );
      this.gl.enableVertexAttribArray(this.attributeLocations.position);
      this.gl.uniform1f(this.uniformLocations.timeWidth, TIME_WIDTH_SECS);
    }

    this.gl.uniform1f(this.uniformLocations.time, time);
    this.gl.uniform1f(this.uniformLocations.canvasWidth, canvasWidth);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.triangleCount);
  }
}

class SeekProgram extends ShaderProgram<[number]> {
  readonly triangleCount: number;

  constructor(gl: WebGLRenderingContext) {
    super(
      gl,
      [
        loadShader(gl, gl.VERTEX_SHADER, seekVertShaderRaw)!,
        loadShader(gl, gl.FRAGMENT_SHADER, singleColorFragShaderRaw)!,
      ],
      ["position"],
      ["time", "timeWidth", "color"],
      ["positions"]
    );
    const positions = quadToTriangles(-1.005, 1.0, -0.995, -1.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positions);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    this.triangleCount = positions.length / 2;
  }

  draw(time: number) {
    if (this.gl.CURRENT_PROGRAM !== this.program) {
      this.gl.useProgram(this.program);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.positions);
      this.gl.vertexAttribPointer(
        this.attributeLocations.position,
        2,
        this.gl.FLOAT,
        false,
        0,
        0
      );
      this.gl.enableVertexAttribArray(this.attributeLocations.position);
      this.gl.uniform1f(this.uniformLocations.timeWidth, TIME_WIDTH_SECS);
      this.gl.uniform4fv(this.uniformLocations.color, [0.9, 0.9, 0.9, 1.0]);
    }

    this.gl.uniform1f(this.uniformLocations.time, time);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.triangleCount);
  }
}

class PitchProgram extends ShaderProgram<[number, number, number[]]> {
  readonly color: [number, number, number];

  constructor(gl: WebGLRenderingContext, color: [number, number, number]) {
    super(
      gl,
      [
        loadShader(gl, gl.VERTEX_SHADER, midiVertShaderRaw)!,
        loadShader(gl, gl.FRAGMENT_SHADER, singleColorFragShaderRaw)!,
      ],
      ["position"],
      ["time", "timeWidth", "color"],
      ["positions"]
    );
    this.color = color;
  }

  draw(time: number, canvasWidth: number, positions: number[]) {
    if (this.gl.CURRENT_PROGRAM !== this.program) {
      this.gl.useProgram(this.program);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.positions);
      this.gl.vertexAttribPointer(
        this.attributeLocations.position,
        2,
        this.gl.FLOAT,
        false,
        0,
        0
      );
      this.gl.enableVertexAttribArray(this.attributeLocations.position);
      this.gl.uniform1f(this.uniformLocations.timeWidth, TIME_WIDTH_SECS);
      this.gl.uniform4f(this.uniformLocations.color, ...this.color, 1.0);
    }

    this.gl.uniform1f(this.uniformLocations.time, time);
    this.gl.uniform1f(this.uniformLocations.canvasWidth, canvasWidth);

    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(positions),
      this.gl.DYNAMIC_DRAW
    );
    this.gl.drawArrays(this.gl.TRIANGLES, 0, positions.length / 2);
  }
}

class FreeTimeProgram extends ShaderProgram<[number, number]> {
  readonly triangleCount: number;

  constructor(gl: WebGLRenderingContext, positions: number[]) {
    super(
      gl,
      [
        loadShader(gl, gl.VERTEX_SHADER, midiVertShaderRaw)!,
        loadShader(gl, gl.FRAGMENT_SHADER, singleColorFragShaderRaw)!,
      ],
      ["position"],
      ["time", "timeWidth", "canvasWidth", "color"],
      ["positions"]
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positions);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    this.triangleCount = positions.length / 2;
  }

  draw(time: number, canvasWidth: number) {
    if (this.gl.CURRENT_PROGRAM !== this.program) {
      this.gl.useProgram(this.program);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.positions);
      this.gl.vertexAttribPointer(
        this.attributeLocations.position,
        2,
        this.gl.FLOAT,
        false,
        0,
        0
      );
      this.gl.enableVertexAttribArray(this.attributeLocations.position);
      this.gl.uniform1f(this.uniformLocations.timeWidth, TIME_WIDTH_SECS);
      this.gl.uniform4fv(this.uniformLocations.color, [0, 0, 0, 0.5]);
    }

    this.gl.uniform1f(this.uniformLocations.time, time);
    this.gl.uniform1f(this.uniformLocations.canvasWidth, canvasWidth);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.triangleCount);
  }
}

class PitchDetectionBuffer {
  buffer: { time: number; value: number }[] = [];
  positions: number[] = [];
  pitchOffset: number = 0;

  push(
    pitchMidiNumber: number,
    medianMidiNumber: number,
    currentMidiNumber: number,
    time: number
  ) {
    this.pitchOffset +=
      Math.round(
        (currentMidiNumber - (pitchMidiNumber + this.pitchOffset)) / 12
      ) * 12;

    const pitchMidiNumberOffset = pitchMidiNumber + this.pitchOffset;

    if (
      this.buffer.length === 0 ||
      time > this.buffer[this.buffer.length - 1].time
    ) {
      this.buffer.push({
        time,
        value: pitchMidiNumberOffset,
      });
    } else {
      this.buffer[this.buffer.length - 1] = {
        time,
        value: pitchMidiNumberOffset,
      };
    }

    if (this.buffer.length > 200) {
      this.buffer.shift();
      this.positions.splice(0, 12 * (PITCH_RESOLUTION - 1));
    }

    if (this.buffer.length >= 1) {
      const lastIndex = this.buffer.length - 1;

      let timeGap = null;
      let pitchGap = null;

      if (this.buffer.length >= 3) {
        timeGap = this.buffer[lastIndex].time - this.buffer[lastIndex - 2].time;

        pitchGap = Math.max(
          Math.abs(
            this.buffer[lastIndex].value - this.buffer[lastIndex - 1].value
          ),
          Math.abs(
            this.buffer[lastIndex - 1].value - this.buffer[lastIndex - 2].value
          ),
          Math.abs(
            this.buffer[lastIndex].value - this.buffer[lastIndex - 2].value
          )
        );
      }

      // If we don't have 3 points to create a spline with, or the time/pitch gap
      // between points is too large, just draw the current point as is.
      if (!timeGap || !pitchGap || timeGap > 0.06 || pitchGap > 7) {
        const pitchPoint = quadToTriangles(
          this.buffer[lastIndex].time - 0.025,
          this.buffer[lastIndex].value - STROKE_WIDTH / 2,
          this.buffer[lastIndex].time,
          this.buffer[lastIndex].value + STROKE_WIDTH / 2
        );

        for (let i = 0; i < PITCH_RESOLUTION - 1; i++) {
          this.positions.push(...pitchPoint);
        }

        return;
      }

      const path = [];

      const bufferSlice = this.buffer.slice(lastIndex - 2, lastIndex + 1);
      const spline = new Spline(
        bufferSlice.map((obj) => obj.time),
        bufferSlice.map((obj) =>
          midiNumberToYCoord(obj.value, medianMidiNumber)
        )
      );

      for (let i = 0; i < PITCH_RESOLUTION; i++) {
        const currX =
          this.buffer[lastIndex - 2].time + i * (timeGap / PITCH_RESOLUTION);

        path.push([currX, spline.at(currX)]);
      }

      const edges: number[][][] = this.createEdges(path);
      const newLineSegment = edgesToTriangles(edges[0], edges[1]);

      // Only add the newest line segment to positions
      this.positions.push(...newLineSegment);
    }
  }

  clear() {
    this.buffer = [];
    this.positions = [];
  }

  createEdges(path: number[][]) {
    const top: number[][] = [];
    const bottom: number[][] = [];

    const normals: any = getNormals(path, false);
    const tmp = [0, 0];

    path.forEach((point, i) => {
      const normal: number[] = normals[i][0];
      const join: number = normals[i][1];

      vec.scaleAndAdd(tmp, point, normal, (join * STROKE_WIDTH) / 2);
      top.push(tmp.slice());

      vec.scaleAndAdd(tmp, point, normal, (-join * STROKE_WIDTH) / 2);
      bottom.push(tmp.slice());
    });

    return [top, bottom];
  }
}

function midiNumberToYCoord(midiNumber: number, medianMidiNumber: number) {
  // We draw 18 rows behind the canvas, and we also want to be able to align
  // notes in-between rows, so we have 36 positions. We want to return
  // positions that correspond to the center of a bar or in-between two bars.
  // If we're at the median MIDI number, we should be dead-center.
  return 0.5 + (midiNumber - medianMidiNumber) / 36;
}

export default function PianoRoll(props: {
  scoringData: readonly number[];
  videoRef: React.RefObject<HTMLVideoElement>;
  mics: InputDevice[];
  pitchShiftSemis: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRequestRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current || !props.videoRef.current) return;

    const view = new Uint32Array(Uint8Array.from(props.scoringData).buffer);
    const noteCount = view[1];
    const lyricsIntervalCount = view[2];
    const damTimeWindowIntervalCount = view[3];
    const pogIntervalCount = view[4];

    const notes: {
      startTime: number;
      endTime: number;
      midiNumber: number;
    }[] = [];

    const notesOffset = 6;
    for (let i = notesOffset; i < notesOffset + noteCount * 4; i += 4) {
      notes.push({
        startTime: view[i] / 1000,
        endTime: view[i + 1] / 1000,
        midiNumber: view[i + 2] + props.pitchShiftSemis,
      });
    }

    const medianMidiNumber = median(notes.map((note) => note.midiNumber));

    const positions = notes
      .map((note) =>
        quadToTriangles(
          note.startTime,
          midiNumberToYCoord(note.midiNumber + 1, medianMidiNumber),
          note.endTime,
          midiNumberToYCoord(note.midiNumber - 1, medianMidiNumber)
        )
      )
      .flat();

    let currentNoteIndex = 0;

    const lyricsIntervals: [number, number][] = [];
    const lyricsIntervalsOffset = notesOffset + noteCount * 4;
    for (
      let i = lyricsIntervalsOffset;
      i < lyricsIntervalsOffset + lyricsIntervalCount * 2;
      i += 2
    ) {
      lyricsIntervals.push([view[i] / 1000, view[i + 1] / 1000]);
    }
    const combinedLyricsIntervals = lyricsIntervals.reduce<[number, number][]>(
      (acc, cur) => {
        if (acc.length === 0) {
          return [cur];
        }
        const [prevStart, prevEnd] = acc[acc.length - 1];
        const [curStart, curEnd] = cur;
        if (curStart - prevEnd <= 10) {
          acc[acc.length - 1] = [prevStart, curEnd];
          return acc;
        } else {
          return acc.concat([cur]);
        }
      },
      []
    );
    const [freeTimeIntervals, lastLyricsIntervalEnd] =
      combinedLyricsIntervals.reduce<[[number, number][], number]>(
        (acc, cur) => {
          const [intervals, prevEnd] = acc;
          const [curStart, curEnd] = cur;
          return [intervals.concat([[prevEnd, curStart]]), curEnd];
        },
        [[], 0]
      );
    freeTimeIntervals.push([lastLyricsIntervalEnd, 9999]);
    const freeTimePositions = freeTimeIntervals
      .map(([start, end]) => quadToTriangles(start, 1.0, end, 0.0))
      .flat();

    const damTimeWindowIntervalsOffset =
      lyricsIntervalsOffset + lyricsIntervalCount * 2;

    const pogIntervals: [number, number][] = [];
    const pogIntervalsOffset =
      damTimeWindowIntervalsOffset + damTimeWindowIntervalCount * 2;
    for (
      let i = pogIntervalsOffset;
      i < pogIntervalsOffset + pogIntervalCount * 2;
      i += 2
    ) {
      pogIntervals.push([view[i] / 1000, view[i + 1] / 1000]);
    }

    function pollPitch(mic: InputDevice | null, buffer: PitchDetectionBuffer) {
      if (!mic || !props.videoRef.current) return;
      const { midiNumber, confidence } = mic.getPitch();
      if (
        confidence >= 0.8 &&
        midiNumber !== 0 &&
        !props.videoRef.current.paused
      ) {
        while (
          notes[currentNoteIndex].endTime <
            props.videoRef.current.currentTime &&
          currentNoteIndex < notes.length - 2
        ) {
          currentNoteIndex++;
        }
        const currentMidiNumber = notes[currentNoteIndex].midiNumber;
        buffer.push(
          midiNumber,
          medianMidiNumber,
          currentMidiNumber,
          props.videoRef.current.currentTime
        );
      }
    }

    const gl = canvasRef.current.getContext("webgl2", {
      antialias: true,
      premultipliedAlpha: false,
    })!;

    const pitchPollers: [PitchDetectionBuffer, PitchProgram, NodeJS.Timeout][] =
      props.mics.map((mic, i) => {
        const buffer = new PitchDetectionBuffer();
        return [
          buffer,
          new PitchProgram(
            gl,
            convert.hsv
              .rgb([(360 / props.mics.length) * i, 30, 100])
              .map((channel) => channel / 255) as [number, number, number]
          ),
          setInterval(() => pollPitch(mic, buffer), 25),
        ];
      });

    const noteProgram = new NoteProgram(gl, positions);
    const seekProgram = new SeekProgram(gl);
    const freeTimeProgram = new FreeTimeProgram(gl, freeTimePositions);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    const draw = () => {
      if (!canvasRef.current || !props.videoRef.current) return;

      const time = props.videoRef.current.currentTime;
      const canvasWidth = canvasRef.current.width;

      gl.clear(gl.COLOR_BUFFER_BIT);

      if (freeTimePositions.length > 0) {
        freeTimeProgram.draw(time, canvasWidth);
      }

      if (positions.length > 0) {
        noteProgram.draw(time, canvasWidth);
      }

      pitchPollers.forEach(([buffer, shader, _]) => {
        if (buffer.positions.length > 0) {
          shader.draw(time, canvasWidth, buffer.positions);
        }
      });

      seekProgram.draw(time);

      canvasRef.current.classList.toggle(
        "pianoRollPog",
        pogIntervals.some(([start, end]) => time >= start - 1 && time <= end)
      );

      animationFrameRequestRef.current = window.requestAnimationFrame(draw);
    };

    animationFrameRequestRef.current = window.requestAnimationFrame(draw);

    function updateSize() {
      if (!canvasRef.current) return;
      canvasRef.current.width =
        canvasRef.current.clientWidth * window.devicePixelRatio;
      canvasRef.current.height =
        canvasRef.current.clientHeight * window.devicePixelRatio;
      gl.viewport(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    updateSize();
    window.addEventListener("resize", updateSize);

    function clearPitchDetectionBuffers() {
      currentNoteIndex = 0;
      pitchPollers.forEach(([buffer, _1, _2]) => buffer.clear());
    }

    props.videoRef.current.addEventListener(
      "seeked",
      clearPitchDetectionBuffers
    );

    return () => {
      pitchPollers.forEach(([_1, _2, interval]) => clearInterval(interval));
      cancelAnimationFrame(animationFrameRequestRef.current);
      window.removeEventListener("resize", updateSize);
      if (props.videoRef.current) {
        props.videoRef.current.removeEventListener(
          "seeked",
          clearPitchDetectionBuffers
        );
      }
    };
  }, [props]);

  return <canvas className="pianoRollRoll" ref={canvasRef}></canvas>;
}
