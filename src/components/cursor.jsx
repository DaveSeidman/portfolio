// TODO: for some reason this doesn't track properly on first load, but a hotreload works
import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Vector3, Raycaster } from 'three';

import cursor from '../assets/models/cursor.gltf';

function Cursor(props) {
  const { planeRef, blobRef, pointer, selected } = props;
  const cursorRef = useRef();
  const target = useRef(new Vector3(0, -2, 0));
  const { camera } = useThree();
  const gltf = useGLTF(cursor);
  const raycaster = useRef(new Raycaster());
  const intersects = useRef([]);

  useFrame(() => {
    const plane = planeRef.current;
    const cursorObject = cursorRef.current;
    if (!plane || !cursorObject) return;

    raycaster.current.setFromCamera(pointer, camera);
    intersects.current.length = 0;
    raycaster.current.intersectObject(plane, false, intersects.current);
    if (intersects.current[0]) {
      target.current.copy(intersects.current[0].point);
    }

    const xDiff = (target.current.x - cursorRef.current.position.x);
    const yDiff = (target.current.y - cursorRef.current.position.y);
    const angle = Math.atan2(yDiff, xDiff) - (Math.PI / 2);
    cursorObject.rotation.z = angle;
    cursorObject.position.x += xDiff / 20;
    cursorObject.position.y += yDiff / 20;
  });

  return (
    <group ref={cursorRef} position={[0, -2, 0]}>
      <pointLight intensity={100} color={0x976966} />
      <primitive object={gltf.scene} visible={selected === null}>
        <meshStandardMaterial />
      </primitive>
    </group>
  );
}
export default Cursor;
