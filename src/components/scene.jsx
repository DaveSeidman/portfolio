import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Plane, useGLTF } from '@react-three/drei';
import { PointLight, SphereGeometry, Vector3 } from 'three';
import tvStudio from '../assets/images/tv_studio_2k.hdr';
// import './index.scss';
import Blob from './blob';
import Camera from './camera';
import PostProcessing from './postprocessing';
import Cursor from './cursor';

function Scene(props) {
  const { projects, scrollPercent, scrollSpeed, selected } = props;
  const planeRef = useRef();
  // const blobRef = useRef();

  return (
    <div
      className="scene"
    >
      <Canvas dpr={[0.5, 1.5]}>
        <Camera
          selected={selected}
        />
        <Blob
          // ref={blobRef}
          projects={projects}
          scrollPercent={scrollPercent}
          scrollSpeed={scrollSpeed}
          selected={selected}
        />
        <Plane
          ref={planeRef}
          scale={[5, 5, 5]}
          visible={false}
        />
        <Environment
          files={tvStudio}
          blur={0.2}
        />
        <Cursor
          planeRef={planeRef}
        // blobRef={blobRef}
        />
        {/* <PostProcessing /> */}
      </Canvas>
    </div>
  );
}

export default Scene;
