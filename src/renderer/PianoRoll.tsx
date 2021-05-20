/* tslint:disable:max-classes-per-file */

import convert from "color-convert";
import Spline from "cubic-spline";
import React, { useEffect, useRef, useState } from "react";

import { InputDevice } from "./audioSystem";
import "./PianoRoll.css";
import midiVertShaderRaw from "./shaders/PianoRollMidi.vert.glsl";
import noteFragShaderRaw from "./shaders/PianoRollNote.frag.glsl";
import seekVertShaderRaw from "./shaders/PianoRollSeek.vert.glsl";
import singleColorFragShaderRaw from "./shaders/PianoRollSingleColor.frag.glsl";

const TIME_WIDTH_SECS = 5.0;
const PITCH_RESOLUTION = 16;

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
      this.gl.uniform3fv(this.uniformLocations.color, [0.9, 0.9, 0.9]);
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
      this.gl.uniform3fv(this.uniformLocations.color, this.color);
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
      this.buffer.splice(0, PITCH_RESOLUTION * 12);
    }

    if (this.buffer.length >= 1) {
      const spline = new Spline(
        this.buffer.map((obj) => obj.time),
        this.buffer.map((obj) => obj.value)
      );

      const lastIndex = this.buffer.length - 1;

      let currX = this.buffer[lastIndex].time;
      let currY = spline.at(currX);

      this.positions.push(
        ...quadToTriangles(
          currX - 0.025,
          midiNumberToYCoord(currY + 0.5, medianMidiNumber),
          currX,
          midiNumberToYCoord(currY - 0.5, medianMidiNumber)
        )
      );

      for (let i = 1; i < PITCH_RESOLUTION; i++) {
        // We don't try to interpolate if there is only one note, the time gap between
        // two notes is too large, or the pitch gap between two notes is too large.
        if (this.buffer.length > 1) {
          const timeGap =
            this.buffer[lastIndex].time - this.buffer[lastIndex - 1].time;
          const pitchGap = Math.abs(
            this.buffer[lastIndex].value - this.buffer[lastIndex - 1].value
          );

          if (timeGap < 0.1 && pitchGap < 8) {
            currX =
              this.buffer[lastIndex - 1].time +
              (i * timeGap) / PITCH_RESOLUTION;
            currY = spline.at(currX);
          }
        }

        this.positions.push(
          ...quadToTriangles(
            currX - 0.025,
            midiNumberToYCoord(currY + 0.5, medianMidiNumber),
            currX,
            midiNumberToYCoord(currY - 0.5, medianMidiNumber)
          )
        );
      }
    }
  }

  clear() {
    this.buffer = [];
    this.positions = [];
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
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRequestRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current || !props.videoRef.current) return;

    const view = new Uint32Array(Uint8Array.from(props.scoringData).buffer);
    const noteCount = view[1];

    const notes: {
      startTime: number;
      endTime: number;
      midiNumber: number;
    }[] = [];

    const nBars = 36;
    const barSize = 1 / nBars;

    for (let i = 0; i < noteCount * 4; i += 4) {
      notes.push({
        startTime: view[6 + i] / 1000,
        endTime: view[6 + i + 1] / 1000,
        midiNumber: view[6 + i + 2],
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

    const pitchPollers: [
      PitchDetectionBuffer,
      PitchProgram,
      NodeJS.Timeout
    ][] = props.mics.map((mic, i) => {
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

    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    const draw = () => {
      if (!canvasRef.current || !props.videoRef.current) return;

      const time = props.videoRef.current.currentTime;
      const canvasWidth = canvasRef.current.width;

      gl.clear(gl.COLOR_BUFFER_BIT);

      if (positions.length > 0) {
        noteProgram.draw(time, canvasWidth);
      }

      pitchPollers.forEach(([buffer, shader, _]) => {
        if (buffer.positions.length > 0) {
          shader.draw(time, canvasWidth, buffer.positions);
        }
      });

      seekProgram.draw(time);

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

  return <canvas className="karaVidPianoRoll" ref={canvasRef}></canvas>;
}
