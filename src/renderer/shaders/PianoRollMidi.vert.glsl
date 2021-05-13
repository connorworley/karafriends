attribute vec2 position;
// position.x will range from 0 to song end timestamp

uniform float time;
uniform float timeWidth;

void main() {
  gl_Position = vec4((position.x - floor(time / timeWidth) * timeWidth) / timeWidth * 2.0 - 1.0, position.y * 2.0 - 1.0, 0.0, 1.0);
}