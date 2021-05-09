/* tslint:disable:max-classes-per-file */

import React, { useEffect, useRef, useState } from "react";

import { InputDevice } from "./audioSystem";
import "./PianoRoll.css";
import vertShaderRaw from "./shaders/PianoRoll.vert.glsl";
import noteFragShaderRaw from "./shaders/PianoRollNote.frag.glsl";
import pitchFragShaderRaw from "./shaders/PianoRollPitch.frag.glsl";

const TIME_WIDTH_SECS = 5.0;

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
        loadShader(gl, gl.VERTEX_SHADER, vertShaderRaw)!,
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

class PitchProgram extends ShaderProgram<[number, number, number[]]> {
  readonly color: [number, number, number];

  constructor(gl: WebGLRenderingContext, color: [number, number, number]) {
    super(
      gl,
      [
        loadShader(gl, gl.VERTEX_SHADER, vertShaderRaw)!,
        loadShader(gl, gl.FRAGMENT_SHADER, pitchFragShaderRaw)!,
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

function midiNumberToYCoord(midiNumber: number, medianMidiNumber: number) {
  // We draw 21 rows behind the canvas, and we also want to be able to align
  // notes in-between rows, so we have 41 positions. We want to return
  // positions that correspond to the center of a bar or in-between two bars.
  // If we're at the median MIDI number, we should be dead-center.
  return 0.5 + (midiNumber - medianMidiNumber) / (41 + 1);
}

export default function PianoRoll(props: {
  scoringData: number[];
  videoRef: React.RefObject<HTMLVideoElement>;
  mic: InputDevice | null;
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

    const nBars = 42;
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
    let pitchOffset = 0;

    const pitchDetectionPositions: number[] = [];

    function pushPitchDetection(pitchMidiNumber: number) {
      if (!props.videoRef.current) return;
      if (pitchDetectionPositions.length >= 200 * 12) {
        for (let i = 0; i < 12; i++) {
          pitchDetectionPositions.shift();
        }
      }

      pitchDetectionPositions.push(
        ...quadToTriangles(
          props.videoRef.current.currentTime - 0.025,
          midiNumberToYCoord(pitchMidiNumber + 0.5, medianMidiNumber),
          props.videoRef.current.currentTime,
          midiNumberToYCoord(pitchMidiNumber - 0.5, medianMidiNumber)
        )
      );
    }

    const pollPitch = setInterval(() => {
      if (!props.mic || !props.videoRef.current) return;
      const { frequency, confidence } = props.mic.getPitch();
      if (
        confidence > 0.8 &&
        frequency !== 0 &&
        !props.videoRef.current.paused
      ) {
        while (
          notes[currentNoteIndex + 1].startTime <
          props.videoRef.current.currentTime
        ) {
          currentNoteIndex++;
        }
        const currentMidiNumber = notes[currentNoteIndex].midiNumber;
        pitchOffset +=
          Math.round((currentMidiNumber - (frequency + pitchOffset)) / 12) * 12;
        console.log(currentMidiNumber, frequency, pitchOffset);
        pushPitchDetection(frequency + pitchOffset);
      }
    }, 25);

    const gl = canvasRef.current.getContext("webgl", {
      premultipliedAlpha: false,
    })!;

    const noteProgram = new NoteProgram(gl, positions);
    const pitchProgram = new PitchProgram(gl, [1.0, 1.0, 0.0]);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    const draw = () => {
      if (!canvasRef.current || !props.videoRef.current) return;

      const time = props.videoRef.current.currentTime;
      const canvasWidth = canvasRef.current.width;

      gl.clear(gl.COLOR_BUFFER_BIT);

      if (positions.length > 0) {
        noteProgram.draw(time, canvasWidth);
      }

      if (pitchDetectionPositions.length > 0) {
        pitchProgram.draw(time, canvasWidth, pitchDetectionPositions);
      }

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

    return () => {
      cancelAnimationFrame(animationFrameRequestRef.current);
      window.removeEventListener("resize", updateSize);
      clearInterval(pollPitch);
    };
  }, [props]);

  return <canvas className="karaVidPianoRoll" ref={canvasRef}></canvas>;
}
