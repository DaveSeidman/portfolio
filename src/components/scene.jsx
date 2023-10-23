import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { PlaneGeometry, Vector2 } from 'three';
import tvStudio from '../assets/images/tv_studio_2k.hdr';
import Blob from './blob';
import Camera from './camera';
import PostProcessing from './postprocessing';
import Cursor from './cursor';

function Scene(props) {
  const { projects, scrollPercent, scrollSpeed, selected } = props;
  const planeRef = useRef();
  const width = useRef(window.innerWidth);
  const height = useRef(window.innerHeight);
  const pointer = useRef(new Vector2());

  const handlePointerMove = (e) => {
    pointer.current.x = (e.clientX / width.current) * 2 - 1;
    pointer.current.y = (e.clientY / height.current) * -2 + 1;
  };

  const handleResize = () => {
    width.current = window.innerWidth;
    height.current = window.innerHeight;
  };

  useEffect(() => {
    addEventListener('pointermove', handlePointerMove);
    addEventListener('resize', handleResize);
    return () => {
      removeEventListener('pointermove', handlePointerMove);
      removeEventListener('resize', handleResize);
    };
  });

  return (
    <div className="scene">
      <Canvas dpr={[0.5, 1.5]}>
        <Camera selected={selected} />
        <Blob
          projects={projects}
          scrollPercent={scrollPercent}
          scrollSpeed={scrollSpeed}
          selected={selected}
        />
        <mesh
          ref={planeRef}
          geometry={new PlaneGeometry(10, 10)}
          visible={false}
        />
        <Environment
          files={tvStudio}
          blur={0.2}
        />
        <Cursor
          planeRef={planeRef}
          pointer={pointer.current}
          selected={selected}
        // blobRef={blobRef}
        />
        {/* <PostProcessing /> */}
      </Canvas>
    </div>
  );
}

export default Scene;
