// TODO: for some reason this doesn't track properly on first load, but a hotreload works
import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Vector2, Vector3, Raycaster } from 'three';
import cursor from '../assets/models/cursor.gltf';

function Cursor(props) {
  const { planeRef, blobRef } = props;
  const cursorRef = useRef(new Vector3());
  const pointer = useRef(new Vector2());
  const target = useRef(new Vector3());
  const { camera } = useThree();
  const width = useRef(window.innerWidth);
  const height = useRef(window.innerHeight);
  const gltf = useGLTF(cursor);
  const raycaster = useRef(new Raycaster());

  const handlePointerMove = (e) => {
    pointer.current.x = (e.clientX / width.current) * 2 - 1;
    pointer.current.y = (e.clientY / height.current) * -2 + 1;
    raycaster.current.setFromCamera(pointer.current, camera);
    const intersects = raycaster.current.intersectObjects([planeRef.current], false);
    if (intersects[0]) { // technically this should always catch at least one point
      target.current.copy(intersects[0].point);
    }
  };

  useFrame(() => {
    cursorRef.current.position.x += (target.current.x - cursorRef.current.position.x) / 20;
    cursorRef.current.position.y += (target.current.y - cursorRef.current.position.y) / 20;
  });

  const resize = () => {
    width.current = window.innerWidth;
    height.current = window.innerHeight;
  };

  addEventListener('pointermove', handlePointerMove);
  addEventListener('resize', resize);
  resize();

  return (
    <group ref={cursorRef}>
      <pointLight
        intensity={100}
        scale={10}
      />
      <primitive object={gltf.scene}>
        <meshStandardMaterial />
      </primitive>
    </group>
  );
}
export default Cursor;
