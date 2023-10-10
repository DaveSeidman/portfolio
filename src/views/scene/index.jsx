import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useLocation } from 'react-router-dom';
import { useGLTF, Environment, MeshTransmissionMaterial } from '@react-three/drei';
import SimplexNoise from 'simplex-noise';
import { lerp } from 'three/src/math/MathUtils';
import models from '../../assets/models/all.gltf';
import tvStudio from '../../assets/images/tv_studio_2k.hdr';
import './index.scss';
import { projects } from '../../projects.json';

function Blob(props) {
  const { carouselPercent, carouselSpeed } = props;
  const start = useRef();
  const end = useRef();
  const percent = useRef();
  const speedAccumulated = useRef(0);
  const gltf = useGLTF(models);
  const baseRef = useRef();
  const positionCount = 8820;
  const location = useLocation();
  const originalPosition = useRef();
  const targetProject = useRef(projects[0]);
  const targetPositions = useRef();
  const targetNormals = useRef();
  const noiseRef = useRef(new SimplexNoise());
  const restingSpeed = 50;

  const base = gltf.scene.getObjectByName('_Default');

  if (base) {
    originalPosition.current = base.geometry.attributes.position.array;
  }
  projects.forEach((project) => {
    gltf.scene.getObjectByName(project.shape).geometry.computeVertexNormals();

    project.positions = gltf.scene.getObjectByName(project.shape).geometry.attributes.position.array;
    project.normals = gltf.scene.getObjectByName(project.shape).geometry.attributes.normal.array;
  });

  if (base) {
    targetPositions.current = base.geometry.attributes.position.array;
    targetNormals.current = base.geometry.attributes.normal.array;
  }


  useEffect(() => {
    // const slug = location.pathname.replace('/portfolio/', '');
    const slug = location.pathname.slice(1);
    const project = projects.find(p => p.slug === slug) || projects[0];
    targetProject.current = project;
    targetPositions.current = project.positions;
    targetNormals.current = project.normals;
  }, [location]);


  useFrame((state, delta) => {
    start.current = Math.floor(carouselPercent * projects.length);
    end.current = Math.ceil(carouselPercent * projects.length);
    if (start.current < 0) start.current = projects.length - 1;
    if (end.current === projects.length) end.current = 0;
    percent.current = (carouselPercent * projects.length) - start.current;

    speedAccumulated.current += carouselSpeed * 1.5;
    if (Math.abs(speedAccumulated.current) > restingSpeed) speedAccumulated.current *= 0.975;
    baseRef.current.rotation.y += speedAccumulated.current / 100000;
    // console.log(carouselSpeed);

    if (baseRef.current && targetPositions.current) {
      for (let i = 0; i < positionCount; i += 3) {
        const x1 = projects[start.current].positions[i + 0];
        const y1 = projects[start.current].positions[i + 1];
        const z1 = projects[start.current].positions[i + 2];
        const x2 = projects[end.current].positions[i + 0];
        const y2 = projects[end.current].positions[i + 1];
        const z2 = projects[end.current].positions[i + 2];

        const x = lerp(x1, x2, percent.current);
        const y = lerp(y1, y2, percent.current);
        const z = lerp(z1, z2, percent.current);
        // position.array[i + 0] = x;
        // position.array[i + 1] = y;
        // position.array[i + 2] = z;

        // baseRef.current.geometry.attributes.position.array[i + 0] += ((targetPositions.current[i + 0] || 0) - baseRef.current.geometry.attributes.position.array[i + 0]) / 20;
        // baseRef.current.geometry.attributes.position.array[i + 1] += ((targetPositions.current[i + 1] || 0) - baseRef.current.geometry.attributes.position.array[i + 1]) / 20;
        // baseRef.current.geometry.attributes.position.array[i + 2] += ((targetPositions.current[i + 2] || 0) - baseRef.current.geometry.attributes.position.array[i + 2]) / 20;
        baseRef.current.geometry.attributes.position.array[i + 0] = x;
        baseRef.current.geometry.attributes.position.array[i + 1] = y;
        baseRef.current.geometry.attributes.position.array[i + 2] = z;

        // const noise = noiseRef.current.noise4D(originalPosition.current[i + 0], originalPosition.current[i + 1], originalPosition.current[i + 2], delta);

        // console.log(targetNormals[i + 0]);
        // baseRef.current.geometry.attributes.position.array[i + 0] += targetNormals[i + 0] * noise;
        // baseRef.current.geometry.attributes.position.array[i + 1] += targetNormals[i + 1] * noise;
        // baseRef.current.geometry.attributes.position.array[i + 2] += targetNormals[i + 2] * noise;
        // // if (i === 0) console.log(noise);
        // baseRef.current.geometry.attributes.position.array[i + 0] += 0.1;
      }
      baseRef.current.geometry.attributes.position.needsUpdate = true;
      baseRef.current.geometry.computeVertexNormals();
    }
  });

  return (
    <primitive
      object={base}
      ref={baseRef}
    >
      <MeshTransmissionMaterial
        transmission={0.95}
        roughness={0.3}
        thickness={10}
        transparent
        ior={1.5}
        reflectivity={0.1}
        color={0xCCCCCC}
        chromaticAberration={1}
        backsideThickness={0.5}
        // backsideResolution={12}
        // side={DoubleSide}
        backside
        envMapIntensity={1}
      />

    </primitive>
  );
}

function Scene(props) {
  const { carouselPercent, carouselSpeed } = props;
  return (
    <div className="scene">
      <Canvas
        dpr={[0.5, 1.5]}
      camera={{ position: [0, 0, 5], fov: 35 }}
      style={{ backgroundColor: 'black' }}
      >
      <Blob
        carouselPercent={carouselPercent}
        carouselSpeed={carouselSpeed}
      />
      <Environment
        files={tvStudio}
        blur={0.2}
      />
    </Canvas>
    </div >
  );
}

export default Scene;
