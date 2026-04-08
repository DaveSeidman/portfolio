import React, { useEffect, useRef } from 'react';
import { useGLTF, MeshTransmissionMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import SimplexNoise from 'simplex-noise';
import { lerp } from 'three/src/math/MathUtils';
import models from '../assets/models/models.gltf';

// TODO: this is being called every frame because of state cahnges
// maybe use an if(model loaded) return condition at the top

function Blob(props) {
  const { projects, scrollPercent, scrollSpeed } = props;
  const start = useRef();
  const end = useRef();
  const percent = useRef();
  const speedAccumulated = useRef(0);
  const baseRef = useRef();
  const originalPositions = useRef();
  const noiseRef = useRef(new SimplexNoise());
  const elapsedTime = useRef(0);
  const restingSpeed = 50;
  const gltf = useGLTF(models);

  const setBuffers = () => {
    projects.forEach((project) => {
      const shape = gltf.scene.getObjectByName(project.shape);
      if (shape) {
        project.positions = shape.geometry.attributes.position.clone().array;
      }
    });
  };

  if (!originalPositions.current) {
    const base = gltf.scene.getObjectByName('Sphere');

    if (base) {
      originalPositions.current = base.geometry.attributes.position.clone().array;
    }

    setBuffers();
  }

  useFrame((_, delta) => {
    elapsedTime.current += delta;
    if (!baseRef.current || !originalPositions.current) return;

    const meshGeometry = baseRef.current.geometry;
    if (!meshGeometry.attributes.normal) {
      meshGeometry.computeVertexNormals();
    }

    const positions = meshGeometry.attributes.position.array;
    const normals = meshGeometry.attributes.normal.array;
    const positionCount = positions.length;
    const scrollPercentValue = scrollPercent.current;

    start.current = Math.floor(scrollPercentValue * projects.length);
    end.current = Math.ceil(scrollPercentValue * projects.length);
    if (start.current < 0) start.current = projects.length - 1;
    if (end.current === projects.length) end.current = 0;
    percent.current = (scrollPercentValue * projects.length) - start.current;

    speedAccumulated.current += scrollSpeed.current * 1.5;
    if (Math.abs(speedAccumulated.current) > restingSpeed) speedAccumulated.current *= 0.975;
    baseRef.current.rotation.y += speedAccumulated.current / 10000;

    for (let i = 0; i < positionCount; i += 3) {
      const noise = noiseRef.current.noise4D(
        originalPositions.current[i + 0],
        originalPositions.current[i + 1],
        originalPositions.current[i + 2],
        elapsedTime.current * 0.5,
      );
      const x1 = projects[start.current].positions[i + 0];
      const y1 = projects[start.current].positions[i + 1];
      const z1 = projects[start.current].positions[i + 2];
      const x2 = projects[end.current].positions[i + 0];
      const y2 = projects[end.current].positions[i + 1];
      const z2 = projects[end.current].positions[i + 2];
      const x = lerp(x1, x2, percent.current) + (noise * normals[i + 0]);
      const y = lerp(y1, y2, percent.current) + (noise * normals[i + 1]);
      const z = lerp(z1, z2, percent.current) + (noise * normals[i + 2]);

      positions[i + 0] = x;
      positions[i + 1] = y;
      positions[i + 2] = z;
    }

    meshGeometry.attributes.position.needsUpdate = true;
    meshGeometry.computeVertexNormals();
  });

  useEffect(() => {
    // TODO: this might not be working on HMR when changing projects
    setBuffers();
  }, [projects]);

  return (
    <primitive
      // material={material}
      object={gltf.scene.getObjectByName('Sphere')}
      ref={baseRef}
    >
      <MeshTransmissionMaterial
        transmission={0.97}
        roughness={0.3}
        thickness={10}
        resolution={128}
        samples={4}
        ior={1.5}
        reflectivity={0.01}
        color={0x777777}
        chromaticAberration={1}
        backsideThickness={2}
        backside
        flatShading
        envMapIntensity={1}
        temporal
        temporalMaxDistance={4}
      />
    </primitive>
  );
}

export default Blob;
