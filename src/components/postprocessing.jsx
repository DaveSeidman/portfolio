import React from 'react';
import { extend, useThree } from '@react-three/fiber';
import { SSAOPass, BokehPass, UnrealBloomPass } from 'three-stdlib';
import { Effects } from '@react-three/drei';
import { MeshBasicMaterial, Vector2 } from 'three';

extend({ SSAOPass, BokehPass, UnrealBloomPass });

function PostProcessing() {
  const { scene, camera } = useThree();
  const material = new MeshBasicMaterial();
  return (
    <Effects
      multisamping={8}
      renderIndex={1}
      disableGamma
    >
      {/* <sSAOPass
        args={[scene, camera, 100, 100]}
        kernelRadius={1.2}
        kernelSize={1}
      /> */}
      <bokehPass
        args={[scene, camera, 10, 0.0001, 1]}
      />
      {/* <unrealBloomPass args={[new Vector2(window.innerWidth / 1, window.innerHeight / 1), 1, 0.8, 0.5]} /> */}
    </Effects>
  );
}
export default PostProcessing;
