import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Vector3 } from 'three';
import cursor from '../assets/models/cursor.gltf';

function Cursor(props) {
  const pointLightRef = useRef();
  const pointer = useRef(new Vector3());
  const pointerTarget = useRef(new Vector3());
  const { camera } = useThree();
  const width = window.innerWidth;
  const height = window.innerHeight;
  const gltf = useGLTF(cursor);
  // const height = useRef(0);
  // const origin = new Vector3(0, 0, 0);
  // console.log(pointLightRef.current);
  const targetZ = -1;

  const handlePointerMove = (e) => {
    pointer.current.set((e.clientX / width) * 2 - 1, (e.clientY / height) * -2 + 1, 0);
    pointer.current.unproject(camera);
    pointer.current.sub(camera.position).normalize();
    const distance = (targetZ - camera.position.z) / pointer.current.z;
    pointerTarget.current.copy(camera.position).add(pointer.current.multiplyScalar(distance));
    // pointLightRef.current.position.copy(camera.position).add(pointer.current.multiplyScalar(distance));
  };

  useFrame(() => {
    pointLightRef.current.position.x += (pointerTarget.current.x - pointLightRef.current.position.x) / 20;
    pointLightRef.current.position.y += (pointerTarget.current.y - pointLightRef.current.position.y) / 20;
    pointLightRef.current.rotation.z = Math.atan2(pointerTarget.current.y - pointLightRef.current.position.y, pointerTarget.current.x - pointLightRef.current.position.x);
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
    >
      <pointLight
        intensity={100}
        scale={10}
      />
      {/* <mesh scale={0.5}>
        <sphereGeometry />
        <meshStandardMaterial />
      </mesh> */}
      <primitive object={gltf.scene}>
        <meshStandardMaterial />
      </primitive>

    </group>
  );
}
export default Cursor;
