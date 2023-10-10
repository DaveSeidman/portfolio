const SplitShader = {

  uniforms: {
    tDiffuse: { type: 't', value: null },
    percent: { type: 'f', value: 0.0 },
    aspect: { type: 'f', value: 1.0 },
  },

  vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,

  fragmentShader:
  `
    uniform sampler2D tDiffuse;
    uniform float percent;
    uniform float aspect;
    varying vec2 vUv;

    void main() {
      vec2 p = vUv;
      if((p.x + (p.y * (-0.25 * aspect)) + (0.125 * aspect)) < 0.5) { `
        // left side                                   not quite right ↓
        + `gl_FragColor = texture2D(tDiffuse, vec2(p.x + percent, p.y));
      } else {`
        // right side
        + `gl_FragColor = texture2D(tDiffuse, vec2(p.x - percent, p.y));
      }`
      // left slant amount ↓              left slant position ↓
      + 'if((p.x + (p.y * (-0.25 * aspect)) + (0.125 * aspect)) > ((1.0 - percent) / 1.0) - 0.5) {'
      // right slant amount ↓              right slant position ↓
        + 'if((p.x + (p.y * (-0.25 * aspect)) + (0.125 * aspect)) < (percent / 1.0) + 0.5) {'
          // middle
          + `gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        }
      }
    }
  `,

};

export { SplitShader };
