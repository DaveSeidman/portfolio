import { Scene as ThreeScene, DoubleSide, Fog, PMREMGenerator, UnsignedByteType, WebGLRenderTarget, DepthTexture, Matrix4, BufferGeometry, Mesh, BufferAttribute, Vector2, Vector3, Color, Clock, WebGLRenderer, PerspectiveCamera, MeshStandardMaterial, BoxGeometry } from 'three';
// import { MeshTransmissionMaterial } from '@pmndrs/vanilla';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import SimplexNoise from 'simplex-noise';
// import autoBind from 'auto-bind';
import mobile from 'is-mobile';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
// import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
// import { RGBELoader } from 'three-stdlib';
import { EXRLoader } from 'three-stdlib';
import TWEEN from '@tweenjs/tween.js';
import { ChromaticShader } from './ChromaticShader';
// import { ChromaticAberrationEffect } from './ChromaticAberrationEffect.js';

import { SplitShader } from './SplitShader';
import { VignetteShader } from './VignetteShader';
// import { MotionBlurShader } from './MotionBlurShader';

import { lerp } from './utils';
// import StudioEnvironment from '../assets/images/studio_small_09_1k.exr';

const positionCount = 1476;
const faceCount = 980;
// const vertexCount = 492;
const origin = new Vector3();

export default class Scene {
  constructor(state) {
    autoBind(this);
    this.state = state;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.themes = [];
    // console.log(this.state.projects);
    this.state.projects.forEach(({ theme }) => {
      this.themes.push({
        color: new Color(parseInt(theme.color, 16)),
        background: new Color(parseInt(theme.background, 16)),
        roughness: theme.roughness,
        metalness: theme.metalness,
        envIntensity: theme.envIntensity,
      });
    });

    this.restingSpeed = 50;
    this.scene = new ThreeScene();
    this.scene.background = new Color('rgb(50, 50, 50)');
    this.scene.fog = new Fog(0x000000, 2, 7);
    this.camera = new PerspectiveCamera(50, this.width / this.height, 0.001, 10000);
    this.camera.position.set(0, 0, 3);
    this.renderer = new WebGLRenderer({ antialias: true });
    this.pixelRatioAdjustment = mobile() ? 1.5 : 1;
    this.renderer.setPixelRatio(this.pixelRatioAdjustment); // TODO: maybe just decrease for macbooks?
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;

    this.target = new WebGLRenderTarget(this.width, this.height);
    this.target.depthBuffer = true;
    this.target.depthTexture = new DepthTexture();

    this.previousMatrixWorldInverse = new Matrix4();
    this.previousProjectionMatrix = new Matrix4();
    this.previousCameraPosition = new Vector3();
    this.tmpMatrix = new Matrix4();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.splitPass = new ShaderPass(SplitShader);
    this.splitPass.uniforms.aspect.value = window.innerHeight / window.innerWidth;
    this.composer.addPass(this.splitPass);

    this.vignettePass = new ShaderPass(VignetteShader);
    // TODO: resize this when window resizes
    this.vignettePass.uniforms.resolution.value = new Vector2(this.width * this.pixelRatioAdjustment, this.height * this.pixelRatioAdjustment);
    // this.vignettePass.uniforms.radius.value = 1.5;
    // this.vignettePass.uniforms.softness.value = 1.5;
    // this.vignettePass.uniforms.gain.value = 0.25;
    this.composer.addPass(this.vignettePass);

    // this.motionBlurShader = new ShaderPass(MotionBlurShader);
    // this.motionBlurShader.renderToScreen = false;
    // this.composer.addPass(this.motionBlurShader);
    this.chromaticPass = new ShaderPass(ChromaticShader);
    this.composer.addPass(this.chromaticPass);

    // this.composer.addPass(this.bokehPass);

    this.bloomPass = new UnrealBloomPass(new Vector2(this.width, this.height), 1, 2.25, 0.9);
    this.composer.addPass(this.bloomPass);

    this.bokehPass = new BokehPass(this.scene, this.camera, {
      focus: 1.85,
      aperture: 0.005,
      maxblur: 0.4,
      width: this.width / 2,
      height: this.height / 2,
    });
    // this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.composer.addPass(this.bokehPass);

    // this.composer.addPass(this.renderPass);

    // this.composer.addPass(this.splitPass);

    // this.bloomPass.threshold = .5;
    // this.bloomPass.strength = params.bloomStrength;
    // this.bloomPass.radius = params.bloomRadius;
    this.clock = new Clock();
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.enableDamping = true;

    this.target = new Vector3();
    this.mouse = new Vector2();
    this.mousePrev = new Vector2();
    this.camOffset = new Vector2();
    this.targetOffset = new Vector2();

    this.percentQueued = 0;

    this.particles = [];
    this.particleDuration = 0;
    this.particleDelay = Math.random() * 0.01;

    // this.ambientLight = new AmbientLight(0x404040);
    // this.scene.add(this.ambientLight);

    // this.hemisphereLight = new HemisphereLight(0xffffbb, 0x080820, 1);
    // this.scene.add(this.hemisphereLight);

    // this.directionalLight = new DirectionalLight(0xffffff, 1);
    // this.directionalLight.position.set(1, 10, 2);
    // this.directionalLight.target.position.set(10, 0, -2);
    // this.scene.add(this.directionalLight);

    this.el = this.renderer.domElement;
    this.el.className = 'portfolio-scene';
    // const testMat = new MeshBasicMaterial({ wireframe: true });
    // this.material = new MeshStandardMaterial({
    this.material = new MeshTransmissionMaterial({
      _transmission: 1,
      thickness: 0.2,
      color: 0xEEEFFF,
      roughness: 0.1,
      chromaticAberration: 0.03,
      anisotropicBlur: 0.01,
      distortion: 0,
      distortionScale: 0.1,
      temporalDistortion: 0.0,
      reflectivity: 0.5,
      // color: 0x000000,
      // roughness: 0.5,
      flatShading: true,
      metalness: 0.1,
      // flatShading: true,
      // wireframe: true,
      // thickness: 0.01,
      envIntensity: 2,
      transparent: true,
      side: DoubleSide,
      // transmission: 0.95
    });
    // testMat2.side = DoubleSide;

    this.speed = 0;

    this.shapes = [];
    this.shapeObjects = {

    };


    //  TODO: load environment map, then models:
    // const loader = new EXRLoader();
    // loader.setDataType(UnsignedByteType);
    // loader.load(StudioEnvironment, (texture) => {
    const loader = new EXRLoader();
    // loader.load(StudioEnvironment, (texture) => {
    // console.log({ texture });
    // const pmremGenerator = new PMREMGenerator(this.renderer);
    // const hdrCubeMap = pmremGenerator.fromEquirectangular(texture).texture;
    // // hdrCubeMap.encoding = RGBEEncoding;
    // this.background = hdrCubeMap;
    // this.scene.background = this.background;
    // this.material.envMap = this.background;


    new GLTFLoader().load('assets/models/all2.gltf', (res) => {
      this.objects = res.scene;

      const shapes = [];
      Object.keys(this.state.projects).forEach((key) => {
        shapes.push(this.state.projects[key].shape);
      });

      res.scene.traverse((obj) => {
        obj.visible = false;

        if (obj.isMesh && obj.name !== '_Default' && obj.name.indexOf('target') === -1) {
          this.originalPosition = obj.geometry.attributes.position.clone().array;
          this.indexes = obj.geometry.index.array;

          this.shapes.push({ name: obj.name, geo: obj.geometry.attributes.position.array });
          this.shapeObjects[obj.name] = {
            name: obj.name,
            geo: obj.geometry.attributes.position.array,
          };
        }
      });
      // TODO: we can use this but need to prepend 0's in blender file
      // this.shapes.sort((a, b) => (a.name > b.name ? 1 : -1));
      this.object = res.scene.getObjectByName('_Default');
      this.object.material = this.material;
      this.object.visible = true;
      this.object.geometry.computeVertexNormals();

      // this.object.geometry.computeTangents(this.object.geoemtry.index);

      this.scene.add(this.object);
      const cube = new Mesh(new BoxGeometry(), new MeshStandardMaterial({ color: 0xffffff }));
      cube.position.y = -1;
      this.scene.add(cube);

      // normally this is zero unless the router set it otherwise on page load
      this.update(this.percentQueued, 0);
      this.render();
    });
    // });

    this.simplex = new SimplexNoise();

    window.addEventListener('mousemove', this.mousemove);
  }

  update(percent, speed) {
    // console.log(percent, speed);

    if (!this.object) {
      // console.log('object not ready, queue an update here');
      this.percentQueued = percent;
    }
    this.speed += speed * 1.5;
    // this.speed = Math.max(Math.min(1000, this.speed), -1000);
    // TODO implement max speed here
    this.start = Math.floor(percent * (this.state.projects.length));
    this.end = Math.ceil(percent * (this.state.projects.length));
    if (this.start < 0) this.start = this.state.projects.length - 1;
    if (this.end === this.state.projects.length) this.end = 0;
    this.pct = (percent * (this.state.projects.length)) - this.start;
    // console.log(this.start, this.end, this.pct);

    // this.modelStart = this.shapes[this.start];
    // this.modelEnd = this.shapes[this.end];
    if (!this.state.projects[this.start]) console.log('couldnt match', this.state.projects[this.start]);
    if (!this.state.projects[this.end]) console.log('couldnt match', this.state.projects[this.end]);

    // console.log(this.modelStart);
    // console.log(this.state.projects[this.start].shape, this.state.projects[this.end].shape);
    this.modelStart = this.shapeObjects[this.state.projects[this.start].shape];
    this.modelEnd = this.shapeObjects[this.state.projects[this.end].shape];
    // if (!this.modelStart) console.log('couldnt match ', this.start);
    // if (!this.modelEnd) console.log('couldnt match ', this.end);

    // console.log(this.modelEnd.name, this.modelEnd.name);
    const colorStart = this.themes[this.start].color.clone();
    const colorEnd = this.themes[this.end].color.clone();
    const backgroundStart = this.themes[this.start].background.clone();
    const backgroundEnd = this.themes[this.end].background.clone();
    const roughnessStart = this.themes[this.start].roughness;
    const roughnessEnd = this.themes[this.end].roughness;
    const metalnessStart = this.themes[this.start].metalness;
    const metalnessEnd = this.themes[this.end].metalness;
    const envIntensityStart = this.themes[this.start].envIntensity;
    const envIntensityEnd = this.themes[this.end].envIntensity;
    const color = colorStart.lerp(colorEnd, this.pct);
    const background = backgroundStart.lerp(backgroundEnd, this.pct);
    const roughness = lerp(roughnessStart, roughnessEnd, this.pct);
    const metalness = lerp(metalnessStart, metalnessEnd, this.pct);
    const envIntensity = lerp(envIntensityStart, envIntensityEnd, this.pct);

    this.material.color = color;
    this.scene.background = background;
    this.scene.fog.color = background;
    this.material.roughness = roughness;
    this.material.metalness = metalness;
    this.material.envMapIntensity = envIntensity;
    // this.material.needsUpdate = true;
  }


  // TODO: can pause and resume rendering after the scene is opened
  open() {
    this.openTween = new TWEEN.Tween(this.splitPass.uniforms.percent).to({ value: 0.4 }, 750).easing(TWEEN.Easing.Quintic.InOut).start();
  }

  close() {
    this.openTween = new TWEEN.Tween(this.splitPass.uniforms.percent).to({ value: 0 }, 750).easing(TWEEN.Easing.Quintic.InOut).start();
  }

  mousemove({ x, y }) {
    this.mouse.x = (x / this.width) - 0.5;
    this.mouse.y = (y / this.height) - 0.5;

    // this.mouse.xSpeed = this.mouse.x - this.mouse.xPrev;
    // this.mouse.ySpeed = this.mouse.y - this.mouse.yPrev;

    this.camOffset.x += this.mouse.x - this.mousePrev.x;
    this.camOffset.y += this.mouse.y - this.mousePrev.y;

    this.mousePrev.x = this.mouse.x;
    this.mousePrev.y = this.mouse.y;
  }

  render() {
    TWEEN.update();
    if (Math.abs(this.speed) > this.restingSpeed) this.speed *= 0.975;
    this.object.rotation.y += this.speed / 10000;

    const { position, normal } = this.object.geometry.attributes;
    const time = this.clock.getElapsedTime();
    for (let i = 0; i < positionCount; i += 3) {
      const x1 = this.modelStart.geo[i + 0];
      const y1 = this.modelStart.geo[i + 1];
      const z1 = this.modelStart.geo[i + 2];
      const x2 = this.modelEnd.geo[i + 0];
      const y2 = this.modelEnd.geo[i + 1];
      const z2 = this.modelEnd.geo[i + 2];
      const x = lerp(x1, x2, this.pct);
      const y = lerp(y1, y2, this.pct);
      const z = lerp(z1, z2, this.pct);
      position.array[i + 0] = x;
      position.array[i + 1] = y;
      position.array[i + 2] = z;
      this.noise = this.simplex.noise4D(this.originalPosition[i + 0], this.originalPosition[i + 1], this.originalPosition[i + 2], time * 0.5);
      position.array[i + 0] += this.noise * normal.array[i + 0];
      position.array[i + 1] += this.noise * normal.array[i + 1];
      position.array[i + 2] += this.noise * normal.array[i + 2];
    }


    this.object.geometry.attributes.position.needsUpdate = true;
    this.object.geometry.computeVertexNormals();

    // const normalArray = this.object.geometry.attributes.normal.array;
    // const faceNormals =

    // this.object.geometry.attributes.normal.needsUpdate = true;

    // this.camOffset.multiplyScalar(0.95);
    // this.camOffset.x *= 0.95;
    // this.camOffset.y *= 0.95;
    // this.targetOffset.x += (this.camOffset.x - this.targetOffset.x) / 100;
    // this.targetOffset.y += (this.camOffset.y - this.targetOffset.y) / 100;
    // this.camera.position.x = (this.mouse.x * 2) - this.camOffset.x;
    // this.camera.position.y = (this.mouse.y * -2) - this.camOffset.y;
    // this.target.x = this.targetOffset.x;
    // this.target.y = this.targetOffset.y;
    // this.camera.lookAt(this.target);

    // TODO: consider rotating container instead of moving camers:
    this.camera.position.x += ((this.mouse.x * 2) - this.camera.position.x) / 20;
    this.camera.position.y += ((this.mouse.y * -2) - this.camera.position.y) / 20;
    this.camera.lookAt(origin);

    // TODO: move particles into class or method
    this.particleDuration += this.clock.getDelta();
    // generate a new particle
    if (this.particleDuration > this.particleDelay) {
      this.particleDuration = 0;
      this.particleDelay = (Math.random() + 0.1) * 0.005;
      const randomFace = Math.floor(Math.random() * (faceCount - 1)) * 3;

      const vert1 = new Vector3(
        position.array[(this.indexes[randomFace + 0] * 3) + 0],
        position.array[(this.indexes[randomFace + 0] * 3) + 1],
        position.array[(this.indexes[randomFace + 0] * 3) + 2],
      );
      const vert2 = new Vector3(
        position.array[(this.indexes[randomFace + 1] * 3) + 0],
        position.array[(this.indexes[randomFace + 1] * 3) + 1],
        position.array[(this.indexes[randomFace + 1] * 3) + 2],
      );
      const vert3 = new Vector3(
        position.array[(this.indexes[randomFace + 2] * 3) + 0],
        position.array[(this.indexes[randomFace + 2] * 3) + 1],
        position.array[(this.indexes[randomFace + 2] * 3) + 2],
      );
      const center = vert1.add(vert2).add(vert3).divideScalar(3);

      // console.log(center);

      const verts = new Float32Array([
        vert1.x, vert1.y, vert1.z,
        vert2.x, vert2.y, vert2.z,
        vert3.x, vert3.y, vert3.z,
      ]);
      const geo = new BufferGeometry();
      geo.setAttribute('position', new BufferAttribute(verts, 3));
      geo.computeVertexNormals();

      const x = (normal.array[(this.indexes[randomFace + 0] * 3) + 0] + normal.array[(this.indexes[randomFace + 1] * 3) + 0] + normal.array[(this.indexes[randomFace + 2] * 3) + 0]) / 3;
      const y = (normal.array[(this.indexes[randomFace + 0] * 3) + 1] + normal.array[(this.indexes[randomFace + 1] * 3) + 1] + normal.array[(this.indexes[randomFace + 2] * 3) + 1]) / 3;
      const z = (normal.array[(this.indexes[randomFace + 0] * 3) + 2] + normal.array[(this.indexes[randomFace + 1] * 3) + 2] + normal.array[(this.indexes[randomFace + 2] * 3) + 2]) / 3;

      const particle = {
        mesh: new Mesh(geo, this.material),
        scale: 1,
        age: 0,
        normal: new Vector3(x, y, z).multiplyScalar(0.125),
        dir1: new Vector3().subVectors(center, vert1).normalize().divideScalar(100),
        dir2: new Vector3().subVectors(center, vert2).normalize().divideScalar(100),
        dir3: new Vector3().subVectors(center, vert3).normalize().divideScalar(100),
      };
      this.particles.push(particle);
      this.object.add(particle.mesh);
    }

    this.particles.forEach((particle, index) => {
      // particle.age += this.clock.getDelta();
      particle.scale *= 0.95;
      particle.age += 1;
      // if (particle.scale <= 0.1) {
      if (particle.age >= 1000) {
        this.object.remove(particle.mesh);
        this.particles.splice(index, 1);
      } else {
        particle.mesh.position.add(particle.normal);
        const { array } = particle.mesh.geometry.attributes.position;
        array[0] += particle.dir1.x;
        array[1] += particle.dir1.y;
        array[2] += particle.dir1.z;

        array[3] += particle.dir2.x;
        array[4] += particle.dir2.y;
        array[5] += particle.dir2.z;

        array[6] += particle.dir3.x;
        array[7] += particle.dir3.y;
        array[8] += particle.dir3.z;

        particle.mesh.geometry.attributes.position.needsUpdate = true;
      }
    });

    // this.camera.position.z -= 0.05;

    // this.renderer.render(this.scene, this.camera, this.target);
    // this.motionBlurShader.material.uniforms.tColor.value = this.target.texture;
    // this.motionBlurShader.material.uniforms.tDepth.value = this.target.depthTexture;
    // this.motionBlurShader.material.uniforms.velocityFactor.value = 1;
    // this.motionBlurShader.material.uniforms.delta.value = this.delta;
    // // tricky part to compute the clip-to-world and world-to-clip matrices
    // this.motionBlurShader.material.uniforms.clipToWorldMatrix.value
    //   .copy(this.camera.matrixWorldInverse).invert().multiply(this.tmpMatrix.copy(this.camera.projectionMatrix).invert());
    // this.motionBlurShader.material.uniforms.previousWorldToClipMatrix.value
    //   .copy(this.previousProjectionMatrix.multiply(this.previousMatrixWorldInverse));
    // this.motionBlurShader.material.uniforms.cameraMove.value.copy(this.camera.position).sub(this.previousCameraPosition);

    this.composer.render();

    // this.previousMatrixWorldInverse.copy(this.camera.matrixWorldInverse);
    // this.previousProjectionMatrix.copy(this.camera.projectionMatrix);
    // this.previousCameraPosition.copy(this.camera.position);
    requestAnimationFrame(this.render);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);

    this.vignettePass.uniforms.resolution.value = new Vector2(this.width * this.pixelRatioAdjustment, this.height * this.pixelRatioAdjustment);
    this.splitPass.uniforms.aspect.value = window.innerHeight / window.innerWidth;
  }
}
