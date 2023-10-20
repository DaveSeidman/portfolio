import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Vector2, Vector3, Raycaster } from 'three';
import cursor from '../assets/models/cursor.gltf';

function Cursor(props) {
  const { planeRef, blobRef } = props;
  const pointLightRef = useRef();
  const pointer = useRef(new Vector2());
  const target = useRef(new Vector3());
  const { camera } = useThree();
  const width = useRef(window.innerWidth);
  const height = useRef(window.innerHeight);
  const gltf = useGLTF(cursor);
  const raycaster = useRef(new Raycaster());
  // const height = useRef(0);
  // const origin = new Vector3(0, 0, 0);
  // console.log(pointLightRef.current);
  const targetZ = 0;

  const handlePointerMove = (e) => {
    pointer.current.set((e.clientX / width.current) * 2 - 1, (e.clientY / height.current) * -2 + 1);
    raycaster.current.setFromCamera(pointer.current, camera);
    const intersects = raycaster.current.intersectObjects([planeRef.current], false);
    if (intersects[0]) { // technically this should always catch at least one point
      target.current.copy(intersects[0].point);
    }
  };

  const resize = () => {
    width.current = window.innerWidth;
    height.current = window.innerHeight;
  };

  useFrame(() => {
    pointLightRef.current.position.x += (target.current.x - pointLightRef.current.position.x) / 20;
    pointLightRef.current.position.y += (target.current.y - pointLightRef.current.position.y) / 20;
    pointLightRef.current.position.z += (target.current.z - pointLightRef.current.position.z) / 20;
    // const diffX = pointerTarget.current.x - pointLightRef.current.position.x;
    // const diffY = pointerTarget.current.y - pointLightRef.current.position.y;
    // pointLightRef.current.position.x += diffX / 20;
    // pointLightRef.current.position.y += diffY / 20;
    // pointLightRef.current.rotation.z = Math.atan2(diffY, diffX);
  });

  useEffect(() => {
    addEventListener('pointermove', handlePointerMove);
    addEventListener('resize', resize);
    resize();
    // width.current = sceneRef.current.getBoundingClientRect().width;
    // height.current = sceneRef.current.getBoundingClientRect().height;
    return () => {
      removeEventListener('pointermove', handlePointerMove);
      removeEventListener('resize', resize);
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
