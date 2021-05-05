precision highp float;
uniform float time;
uniform float timeWidth;
uniform float canvasWidth;

void main() {
  if (gl_FragCoord.x / canvasWidth < mod(time, timeWidth) / timeWidth) {
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
  } else {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
}