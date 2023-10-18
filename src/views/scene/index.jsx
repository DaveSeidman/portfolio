import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useLocation } from 'react-router-dom';
import {
  useGLTF, Environment, MeshTransmissionMaterial, PerspectiveCamera,
} from '@react-three/drei';
// import {
//   Bloom, DepthOfField, EffectComposer, Noise, Vignette,
// } from '@react-three/postprocessing';
import SimplexNoise from 'simplex-noise';
import { lerp } from 'three/src/math/MathUtils';
import { MeshStandardMaterial, Object3D } from 'three';
import models from '../../assets/models/old-all.gltf';
// import models from '../../assets/models/all4.gltf';
import tvStudio from '../../assets/images/tv_studio_2k.hdr';
import './index.scss';

let gltf;

// TODO: this is being rerendered every frame because of state cahnges
function Blob(props) {
  const {
    projects, scrollPercent, scrollSpeed, selected,
  } = props;
  const start = useRef();
  const end = useRef();
  const percent = useRef();
  const speedAccumulated = useRef(0);
  const baseRef = useRef();
  const positionCount = 1476;
  const location = useLocation();
  const originalPositions = useRef();
  const targetPositions = useRef();
  const targetNormals = useRef();
  const noiseRef = useRef(new SimplexNoise());
  const elapsedTime = useRef(0);
  const restingSpeed = 50;

  if (!originalPositions.current) {
    gltf = useGLTF(models);
    // console.log(gltf);
    const base = gltf.scene.getObjectByName('Sphere');

    if (base) {
      originalPositions.current = base.geometry.attributes.position.clone().array;
    }
    projects.forEach((project) => {
      const shape = gltf.scene.getObjectByName(project.shape);
      // console.log(project.shape, shape);
      if (shape) {
        shape.geometry.computeVertexNormals();
        project.positions = shape.geometry.attributes.position.clone().array;
        project.normals = shape.geometry.attributes.normal.clone().array;
      }
    });

    if (base) {
      // originalPositions.current = base.geometry.attributes.position.clone().array;
      targetPositions.current = base.geometry.attributes.position.array;
      targetNormals.current = base.geometry.attributes.normal.array;
    }
  }

  useEffect(() => {
    const slug = location.pathname.slice(1);
    const project = projects.find(p => p.slug === slug) || projects[0];
    // targetProject.current = project;
    targetPositions.current = project.positions;
    targetNormals.current = project.normals;
  }, [location]);


  useFrame((state, delta) => {
    elapsedTime.current += delta;
    start.current = Math.floor(scrollPercent * projects.length);
    end.current = Math.ceil(scrollPercent * projects.length);
    if (start.current < 0) start.current = projects.length - 1;
    if (end.current === projects.length) end.current = 0;
    percent.current = (scrollPercent * projects.length) - start.current;
    // console.log(projects.length, start.current, end.current, percent.current);

    speedAccumulated.current += scrollSpeed * 1.5;
    if (Math.abs(speedAccumulated.current) > restingSpeed) speedAccumulated.current *= 0.975;
    baseRef.current.rotation.y += speedAccumulated.current / 10000;

    // console.log(originalPositions.current);
    if (baseRef.current && targetPositions.current && originalPositions.current) {
      const normal = baseRef.current.geometry.attributes.normal.clone().array;

      for (let i = 0; i < positionCount; i += 3) {
        const noise = noiseRef.current.noise4D(originalPositions.current[i + 0], originalPositions.current[i + 1], originalPositions.current[i + 2], elapsedTime.current * 0.5);

        const x1 = projects[start.current].positions[i + 0];
        const y1 = projects[start.current].positions[i + 1];
        const z1 = projects[start.current].positions[i + 2];
        const x2 = projects[end.current].positions[i + 0];
        const y2 = projects[end.current].positions[i + 1];
        const z2 = projects[end.current].positions[i + 2];
        const x = lerp(x1, x2, percent.current); // + (noise * normal[i + 0]);
        const y = lerp(y1, y2, percent.current); // + (noise * normal[i + 1]);
        const z = lerp(z1, z2, percent.current); // + (noise * normal[i + 2]);

        baseRef.current.geometry.attributes.position.array[i + 0] = x;
        baseRef.current.geometry.attributes.position.array[i + 1] = y;
        baseRef.current.geometry.attributes.position.array[i + 2] = z;
      }
      baseRef.current.geometry.attributes.position.needsUpdate = true;
      baseRef.current.geometry.computeVertexNormals();
    }
  });

  return (
    <primitive
      object={gltf.scene.getObjectByName('Sphere')}
      ref={baseRef}
    >
      <MeshTransmissionMaterial
        transmission={0.95}
        roughness={0.3}
        thickness={10}
        ior={1.5}
        reflectivity={0.1}
        color={0xCCCCCC}
        chromaticAberration={1}
        backsideThickness={0.5}
        backside
        flatShading
        envMapIntensity={1}
      />
      {/* <meshStandardMaterial /> */}

    </primitive>
  );
}

function Camera(props) {
  const { selected } = props;
  const cameraRef = useRef();

  const wide = [0, 0, 5];
  const close = [0, 1.5, 2];

  const [cameraTarget, setCameraTarget] = useState(wide);


  // useEffect(() => {
  //   console.log('selected changed', cameraRef.current);
  // }, [selected]);

  useFrame((state, delta) => {
    const nextCameraTarget = [
      cameraTarget[0] + ((selected !== null ? close[0] : wide[0]) - cameraTarget[0]) / (3000 * delta),
      cameraTarget[1] + ((selected !== null ? close[1] : wide[1]) - cameraTarget[1]) / (3000 * delta),
      cameraTarget[2] + ((selected !== null ? close[2] : wide[2]) - cameraTarget[2]) / (3000 * delta),
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

function Scene(props) {
  const {
    projects, scrollPercent, scrollSpeed, selected,
  } = props;

  return (
    <div className="scene">
      <Canvas
        dpr={[0.5, 1.5]}
        // camera={{ position: cameraTarget.current, fov: 35 }}
        style={{ backgroundColor: 'black' }}
      >
        <Camera
          selected={selected}
        />
        <Blob
          projects={projects}
          scrollPercent={scrollPercent}
          scrollSpeed={scrollSpeed}
          selected={selected}
        />
        <Environment
          files={tvStudio}
          blur={0.2}
        />
        {/* <EffectComposer> */}
        {/* <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} height={900} /> */}
        {/* <DepthOfField /> */}
        {/* <Noise opacity={0.2} /> */}
        {/* </EffectComposer> */}
      </Canvas>
    </div>
  );
}


export default Scene;
