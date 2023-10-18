import React from 'react';
import { extend, useThree } from '@react-three/fiber';
import { SSAOPass } from 'three-stdlib';
import { Effects } from '@react-three/drei';

extend({ SSAOPass });

function PostProcessing() {
  const { scene, camera } = useThree();
  return (
    <Effects multisamping={8} renderIndex={1} disableGamma={false} disableRenderPass={false} disableRender={false}>
      {/* <sSAOPass args={[scene, camera, 100, 100]} kernelRadius={1.2} kernelSize={0} /> */}
    </Effects>
  );
}
export default PostProcessing;
