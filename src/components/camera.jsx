import React, { useEffect, useRef, useState } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Vector2, Vector3 } from 'three';

function Camera(props) {
  const { selected } = props;
  const cameraRef = useRef();
  const pointer = useRef(new Vector2());
  const width = useRef(window.innerWidth);
  const height = useRef(window.innerHeight);

  const wide = new Vector3(0, 0, 5);
  const close = new Vector3(0, 1.5, 2); // TODO: evaluate model bounding box here to set better offset
  const focus = new Vector3(0, 0, 0);

  const [cameraPosition, setCameraPosition] = useState(wide);

  const handlePointerMove = (e) => {
    // pointer.current.x = (e.clientX / width.current) * 2 - 1;
    // pointer.current.y = (e.clientY / height.current) * -2 + 1;
  };

  useFrame((state, delta) => {
    const nextcameraPosition = new Vector3(
      cameraPosition.x + ((selected !== null ? close.x : wide.x) + (pointer.current.x / 5) - cameraPosition.x) / (2500 * delta),
      cameraPosition.y + ((selected !== null ? close.y : wide.y) + (pointer.current.y / 5) - cameraPosition.y) / (2500 * delta),
      cameraPosition.z + ((selected !== null ? close.z : wide.z) - cameraPosition.z) / (2500 * delta),
    );

    setCameraPosition(nextcameraPosition);

    // cameraRef.current.position.x = pointer.current.x * 0.25;
    // cameraRef.current.position.y = pointer.current.y * 0.25;
    // cameraRef.current.lookAt(focus);
  });

  const resize = () => {
    width.current = window.innerWidth;
    height.current = window.innerHeight;
  };

  return (
    <PerspectiveCamera
      makeDefault
      far={10}
      near={0.1}
      fov={35}
      position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]}
      ref={cameraRef}
    />
  );
}

export default Camera;
