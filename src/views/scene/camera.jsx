import React, { useRef, useState } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

function Camera(props) {
  const { selected } = props;
  const cameraRef = useRef();

  const wide = [0, 0, 5];
  const close = [0, 1.5, 2];

  const [cameraTarget, setCameraTarget] = useState(wide);

  useFrame((state, delta) => {
    const nextCameraTarget = [
      cameraTarget[0] + ((selected !== null ? close[0] : wide[0]) - cameraTarget[0]) / (2500 * delta),
      cameraTarget[1] + ((selected !== null ? close[1] : wide[1]) - cameraTarget[1]) / (2500 * delta),
      cameraTarget[2] + ((selected !== null ? close[2] : wide[2]) - cameraTarget[2]) / (2500 * delta),
    ];
    setCameraTarget(nextCameraTarget);
  });

  return (
    <PerspectiveCamera
      makeDefault
      far={10}
      near={0.1}
      fov={35}
      position={cameraTarget}
      ref={cameraRef}
    />
  );
}

export default Camera;
