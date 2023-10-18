import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, useGLTF } from '@react-three/drei';
import { PointLight, SphereGeometry, Vector3 } from 'three';
import tvStudio from '../../assets/images/tv_studio_2k.hdr';
import './index.scss';
import Blob from './blob';
import Camera from './camera';
import PostProcessing from './postprocessing';
import cursor from '../../assets/models/cursor.gltf';

function Light(props) {
  const pointLightRef = useRef();
  const pointer = useRef(new Vector3());
  const pointerTarget = useRef(new Vector3());
  const { camera } = useThree();
  // const sceneRef = useRef();
  // const width = useRef(0);
  const width = window.innerWidth;
  const height = window.innerHeight;
  const gltf = useGLTF(cursor);
  // const height = useRef(0);
  // const origin = new Vector3(0, 0, 0);
  // console.log(pointLightRef.current);
  const targetZ = 0;
  const handlePointerMove = (e) => {
    pointer.current.set(
      (e.clientX / width) * 2 - 1,
      (e.clientY / height) * -2 + 1,
      0,
    );
    pointer.current.unproject(camera);
    pointer.current.sub(camera.position).normalize();
    const distance = (targetZ - camera.position.z) / pointer.current.z;
    pointerTarget.current.copy(camera.position).add(pointer.current.multiplyScalar(distance));
    // pointLightRef.current.position.copy(camera.position).add(pointer.current.multiplyScalar(distance));
  };

  useFrame(() => {
    pointLightRef.current.position.x += (pointerTarget.current.x - pointLightRef.current.position.x) / 20;
    pointLightRef.current.position.y += (pointerTarget.current.y - pointLightRef.current.position.y) / 20;
    // pointLightRef.current.position.copy(pointer.current);
    // pointLightRef.current.position.x += (pointer.current.x - pointLightRef.current.position.x) / 10;
    // pointLightRef.current.position.y += (pointer.current.y - pointLightRef.current.position.y) / 10;
    // pointLightRef.current.lookAt(origin);
    // console.log(pointLightRef.current.position);
    // pointLightRef.current.position.copy(camera.position).add(pointer)
  });

  useEffect(() => {
    addEventListener('pointermove', handlePointerMove);
    // width.current = sceneRef.current.getBoundingClientRect().width;
    // height.current = sceneRef.current.getBoundingClientRect().height;
    return () => {
      removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <group
      ref={pointLightRef}
      position={[0, 0, 0]}
    >
      <pointLight
        intensity={20}
        scale={100}

      />
      {/* <mesh scale={0.5}>
        <sphereGeometry />
        <meshStandardMaterial />
      </mesh> */}
      <primitive object={gltf.scene}>
        <meshStandardMaterial />
      </primitive>

    </group>
    // <rectAreaLight
    //   power={2000}
    //   width={2}
    //   height={1}
    //   scale={20}
    //   ref={pointLightRef}
    //   position={[0, 0, -1]}
    // />
  );
}

function Scene(props) {
  const { projects, scrollPercent, scrollSpeed, selected } = props;

  return (
    <div
      className="scene"
    >
      <Canvas
        dpr={[0.5, 1.5]}
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
        <Light />
        <PostProcessing />
      </Canvas>
    </div>
  );
}

export default Scene;
