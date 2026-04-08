import React, { useRef } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

const WIDE_POSITION = new Vector3(0, 0, 5);
const CLOSE_POSITION = new Vector3(0, 1.5, 2);
const FOCUS_POINT = new Vector3(0, 0, 0);

function Camera(props) {
  const { selected } = props;
  const cameraRef = useRef();

  useFrame((_, delta) => {
    const camera = cameraRef.current;
    if (!camera) return;

    const targetPosition = selected !== null ? CLOSE_POSITION : WIDE_POSITION;
    const xyLerp = Math.min(1, 1 / Math.max(1000 * delta, 1));
    const zLerp = Math.min(1, 1 / Math.max(2500 * delta, 1));

    camera.position.x += (targetPosition.x - camera.position.x) * xyLerp;
    camera.position.y += (targetPosition.y - camera.position.y) * xyLerp;
    camera.position.z += (targetPosition.z - camera.position.z) * zLerp;
    camera.lookAt(FOCUS_POINT);
  });

  return (
    <PerspectiveCamera
      makeDefault
      far={10}
      near={0.1}
      fov={35}
      position={[WIDE_POSITION.x, WIDE_POSITION.y, WIDE_POSITION.z]}
      ref={cameraRef}
    />
  );
}

export default Camera;
