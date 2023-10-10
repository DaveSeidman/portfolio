// TODO: account for pixelRatio

import { Vector2 } from 'three';

const VignetteShader = {
  uniforms: {
    tDiffuse: { type: 't', value: null },
    resolution: { type: 'v2', value: new Vector2() },
  },
  vertexShader: [
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}',
  ].join('\n'),
  fragmentShader: [
    'uniform sampler2D tDiffuse;',
    'uniform vec2 resolution;',
    'varying vec2 vUv;',

    'void main() {',
    '  vec4 color = texture2D( tDiffuse, vUv );',
    '  vec3 c = color.rgb;',

    '  vec2 uv = gl_FragCoord.xy / resolution.xy;',
    '  uv *=  1.0 - uv.yx;',
    '  float vig = uv.x * uv.y * 15.0;',
    '  vig = pow(vig, 0.025);',
    '  gl_FragColor = color * vec4(vig);',
    '}',
  ].join('\n'),
};

export { VignetteShader };
