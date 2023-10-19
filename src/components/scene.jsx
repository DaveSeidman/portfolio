import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, useGLTF } from '@react-three/drei';
import { PointLight, SphereGeometry, Vector3 } from 'three';
import tvStudio from '../assets/images/tv_studio_2k.hdr';
// import './index.scss';
import Blob from './blob';
import Camera from './camera';
import PostProcessing from './postprocessing';
import Cursor from './cursor';

function Scene(props) {
  const { projects, scrollPercent, scrollSpeed, selected } = props;

  return (
    <div
      className="scene"
    >
      <Canvas dpr={[0.5, 1.5]}>
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
        <Cursor />
        {/* <PostProcessing /> */}
      </Canvas>
    </div>
  );
}

export default Scene;
