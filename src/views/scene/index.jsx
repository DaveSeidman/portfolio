import React from 'react';
import { Canvas, extend, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
// import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import tvStudio from '../../assets/images/tv_studio_2k.hdr';
import './index.scss';
import Blob from './blob';
import Camera from './camera';
import PostProcessing from './postprocessing';

function Scene(props) {
  const { projects, scrollPercent, scrollSpeed, selected } = props;

  return (
    <div className="scene">
      <Canvas
        dpr={[0.5, 1.5]}
        // camera={{ position: cameraTarget.current, fov: 35 }}
        style={{ backgroundColor: 'black' }}
      >
        <Camera
          selected={selected}
        />
        <Blob
          projects={projects}
          scrollPercent={scrollPercent}
          scrollSpeed={scrollSpeed}
          selected={selected}
        />
        <Environment
          files={tvStudio}
          blur={0.2}
        />
        <PostProcessing />
        {/* <EffectComposer> */}
        {/* <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} height={900} /> */}
        {/* <DepthOfField /> */}
        {/* <Noise opacity={0.2} /> */}
        {/* </EffectComposer> */}
      </Canvas>
    </div>
  );
}

export default Scene;
