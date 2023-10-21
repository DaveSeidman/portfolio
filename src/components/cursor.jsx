// TODO: for some reason this doesn't track properly on first load, but a hotreload works
import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Vector3, Raycaster, Color } from 'three';
import { useForceRender } from '../utils';

import cursor from '../assets/models/cursor.gltf';

function Cursor(props) {
  const { planeRef, blobRef, pointer, selected } = props;
  const cursorRef = useRef();
  const target = useRef(new Vector3(0, -2, 0));
  const { camera } = useThree();
  const gltf = useGLTF(cursor);
  const raycaster = useRef(new Raycaster());
  const forceRender = useForceRender();

  raycaster.current.setFromCamera(pointer, camera);
  if (planeRef.current) {
    const intersects = raycaster.current.intersectObjects([planeRef.current], false);
    if (intersects[0]) { // technically this should always catch at least one point
      target.current.copy(intersects[0].point);
    }
  }

  useFrame(() => {
    cursorRef.current.position.x += (target.current.x - cursorRef.current.position.x) / 20;
    cursorRef.current.position.y += (target.current.y - cursorRef.current.position.y) / 20;
    forceRender();
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
