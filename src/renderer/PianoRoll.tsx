import React, { useEffect, useRef, useState } from "react";

import noteFragShaderRaw from "./shaders/PianoRollNote.frag.glsl";
import noteVertShaderRaw from "./shaders/PianoRollNote.vert.glsl";

import "./PianoRoll.css";

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

export default function PianoRoll(props: {
  scoringData: number[];
  videoRef: React.RefObject<HTMLVideoElement>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRequestRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current || !props.videoRef.current) return;

    const view = new Uint32Array(Uint8Array.from(props.scoringData).buffer);
    const noteCount = view[1] - 1; // last note seems to be crap

    const notes: {
      startTime: number;
      endTime: number;
      midiNumber: number;
    }[] = [];

    const nBars = 42;
    const barSize = 1 / nBars;

    for (let i = 0; i < noteCount * 4; i += 4) {
      notes.push({
        startTime: view[8 + i + 2] / 1000,
        endTime: view[8 + i + 3] / 1000,
        midiNumber: view[8 + i],
      });
    }

    const medianMidiNumber = median(notes.map((note) => note.midiNumber));

    const positions = notes
      .map((note) =>
        quadToTriangles(
          note.startTime,
          (((note.midiNumber - medianMidiNumber + Math.floor(nBars / 2)) %
            nBars) +
            2) *
            barSize,
          note.endTime,
          ((note.midiNumber - medianMidiNumber + Math.floor(nBars / 2)) %
            nBars) *
            barSize
        )
      )
      .flat();

    canvasRef.current.width =
      canvasRef.current.clientWidth * window.devicePixelRatio;
    canvasRef.current.height =
      canvasRef.current.clientHeight * window.devicePixelRatio;

    const gl = canvasRef.current.getContext("webgl", {
      premultipliedAlpha: false,
    })!;

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, noteVertShaderRaw)!;
    const fragmentShader = loadShader(
      gl,
      gl.FRAGMENT_SHADER,
      noteFragShaderRaw
    )!;

    const shaderProgram = gl.createProgram()!;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    const positionAttribLocation = gl.getAttribLocation(
      shaderProgram,
      "position"
    );
    const timeUniformLocation = gl.getUniformLocation(shaderProgram, "time");
    const timeWidthUniformLocation = gl.getUniformLocation(
      shaderProgram,
      "timeWidth"
    );
    const canvasWidthUniformLocation = gl.getUniformLocation(
      shaderProgram,
      "canvasWidth"
    );

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLocation);

    gl.uniform1f(timeWidthUniformLocation, 5.0);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    const draw = () => {
      if (canvasRef.current && props.videoRef.current) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(
          timeUniformLocation,
          props.videoRef.current.currentTime + 8 / 3
        ); // why is scoring data offset like this?
        gl.uniform1f(canvasWidthUniformLocation, canvasRef.current.width);
        gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
      }
      animationFrameRequestRef.current = window.requestAnimationFrame(draw);
    };

    animationFrameRequestRef.current = window.requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrameRequestRef.current);
  }, [props]);

  return <canvas className="karaVidPianoRoll" ref={canvasRef}></canvas>;
}
