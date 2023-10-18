import React from 'react';
import { extend, useThree } from '@react-three/fiber';
import { SSAOPass, BokehPass } from 'three-stdlib';
import { Effects } from '@react-three/drei';
import { MeshBasicMaterial } from 'three';

console.log(BokehPass);
extend({ SSAOPass, BokehPass });

function PostProcessing() {
  const { scene, camera } = useThree();
  const material = new MeshBasicMaterial();
  return (
    <Effects
      multisamping={8}
      renderIndex={1}
      disableGamma={false}
    >
      {/* <sSAOPass
        args={[scene, camera, 100, 100]}
        kernelRadius={1.2}
        kernelSize={1}
      /> */}
      {/* <bokehPass
        args={[scene, camera, 0.005, 0.0001, 1]}
      /> */}
    </Effects>
  );
}
export default PostProcessing;
