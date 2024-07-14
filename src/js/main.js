import '../css/style.scss'
import * as THREE from "three";
import { radian } from "./utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import Lenis from "@studio-freight/lenis";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexSource from "./shader/vertexShader.glsl";
import fragmentSource from "./shader/fragmentShader.glsl";


class Main {
  constructor() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.canvas = document.querySelector("#canvas");
    this.renderer = null;
    this.scene = new THREE.Scene();
    this.camera = null;
    this.cameraFov = 45;
    this.cameraFovRadian = (this.cameraFov / 2) * (Math.PI / 180);
    this.cameraDistance = (this.viewport.height / 2) / Math.tan(this.cameraFovRadian);
    // this.controls = null;

    this.instancedMesh = null;
    this.instanceCount = 30;
    this.instanceDummy = new THREE.Object3D();

    this.lenis = new Lenis({
      lerp: 0.03, // 慣性の強さ
    });

    this.animationParams = {
      speed: {
        x: 1.1,
        y: 1.06,
        z: 0.05,
      },
      scale: {
        x: 1.0,
        y: 1.0,
        z: 1.0,
      },
      position: {
        x: 0.0,
        y: 0.0,
        z: 0.0,
      },
      rotation: {
        x: 0.0,
        y: 0.0,
        z: 0.0,
      },
      wave: false,
    }

    this.uniforms = {
      uTime: {
        value: 0.0
      },
      uDelay: {
        value: 0.3
      },
      uWave: {
        value: 10.0
      },
      // uTex: {
      //   value: this.texture
      // },
      // uResolution: {
      //   value: new THREE.Vector2(this.viewport.width, this.viewport.height)
      // },
      // uTexResolution: {
      //   value: new THREE.Vector2(2048, 1024)
      // },
    };

    this.clock = new THREE.Clock();

    this.init();

  }

  _setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.viewport.width, this.viewport.height);
  }

  _setCamera() {
    this.camera = new THREE.PerspectiveCamera(this.cameraFov, this.viewport.width / this.viewport.height, 1, this.cameraDistance * 2);
    this.camera.position.z = this.cameraDistance;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);
  }

  // _setControlls() {
  //   this.controls = new OrbitControls(this.camera, this.canvas);
  //   this.controls.enableDamping = true;
  // }

  _setLight() {
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(1, 1, 1);
    this.scene.add(light);
  }


  _addRingMesh() {
    const geometry = new THREE.RingGeometry(300, 300.5, 256);
    const indices = new Float32Array(this.instanceCount);
    const positions = new Float32Array(this.instanceCount * 3);
    const scales = new Float32Array(this.instanceCount * 3);
    const rotations = new Float32Array(this.instanceCount * 4);

    for (let i = 0; i < this.instanceCount; i++) {
      indices[i] = i;
    }

    geometry.setAttribute('aIndex', new THREE.InstancedBufferAttribute(indices, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexSource,
      fragmentShader: fragmentSource,
      side: THREE.DoubleSide
    });

    this.instancedMesh = new THREE.InstancedMesh(geometry, material, this.instanceCount);

    // for (let i = 0; i < this.instanceCount; i++) {
    //   this.instanceDummy.rotation.set(0, 0, 0);
    //   this.instanceDummy.updateMatrix();
    //   this.instancedMesh.setMatrixAt(i, this.instanceDummy.matrix);
    // }
    for (let i = 0; i < this.instanceCount; i++) {
      this.instanceDummy.rotation.set(0, 0, 0);
      this.instanceDummy.updateMatrix();

      positions.set([this.instanceDummy.position.x, this.instanceDummy.position.y, this.instanceDummy.position.z], i * 3);
      scales.set([this.instanceDummy.scale.x, this.instanceDummy.scale.y, this.instanceDummy.scale.z], i * 3);
      rotations.set([this.instanceDummy.quaternion.x, this.instanceDummy.quaternion.y, this.instanceDummy.quaternion.z, this.instanceDummy.quaternion.w], i * 4);

      this.instancedMesh.setMatrixAt(i, this.instanceDummy.matrix);
    }

    geometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(positions, 3));
    geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(scales, 3));
    geometry.setAttribute('instanceRotation', new THREE.InstancedBufferAttribute(rotations, 4));

    this.scene.add(this.instancedMesh);
  }

  _setAnimation() {
    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: '#section02',
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: true,
        // markers: true,
      }
    });
    tl1.to(this.animationParams.scale, {
      x: 1.5,
      y: 1.0,
    })
    .to(this.animationParams.rotation, {
      z: radian(45),
    }, '<')
    .to(this.uniforms.uWave, {
      value: 2000.0,
    }, '<')
    

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: '#section03',
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: true,
        // markers: true,
      }
    });
    tl2.to(this.animationParams.position, {
      x: 50,
      y: 50,
    })
    .to(this.animationParams.scale, {
      x: 1.0,
      y: 0.8,
    }, '<')
    // .to(this.uniforms.uWave, {
    //   value: 1000.0,
    // }, '<')
    .to(this.uniforms.uDelay, {
      value: 0.1,
    }, '<')

  }

  init() {
    this._setRenderer();
    this._setCamera();
    // this._setControlls();
    this._setLight();
    this._addRingMesh();
    this._setAnimation();

    this._update();
    this._addEvent();
  }

  _update(time) {
    this.lenis.raf(time);

    const elapsedTime = this.clock.getElapsedTime();
    this.uniforms.uTime.value = elapsedTime;

    const positions = new Float32Array(this.instanceCount * 3);
    const scales = new Float32Array(this.instanceCount * 3);
    const rotations = new Float32Array(this.instanceCount * 4);

    for (let i = 0; i < this.instanceCount; i++) {
      const index = i + 1;

      // this.instanceDummy.rotation.set(
      //   radian(index * 3) + elapsedTime * 1.1,
      //   radian(index * 1.5) + elapsedTime * 1.06,
      //   radian(index * 1) + elapsedTime * 0.05,
      //   // radian(index * 3) + elapsedTime * 0.0,
      //   // radian(index * 1.5) + elapsedTime * 0.1,
      //   // radian(index * 1) + elapsedTime * 0.0,
      //   // 0,
      //   // 0,
      //   // 0
      // );
      this.instanceDummy.rotation.set(
        this.animationParams.rotation.x,
        // this.animationParams.rotation.y + index * 0.1,
        this.animationParams.rotation.y + index * 0.5,
        this.animationParams.rotation.z
      );

      // this.instanceDummy.scale.set(Math.sin(elapsedTime + index * 0.05), Math.cos(elapsedTime + index * 0.03), 1.0);
      this.instanceDummy.scale.set(
        this.animationParams.scale.x,
        this.animationParams.scale.y,
        this.animationParams.scale.z
      );


      // this.instanceDummy.position.set(
      //   // index * 5.0 + Math.sin(elapsedTime) * 200.0,
      //   Math.sin(elapsedTime + index * 0.03) * 300.0,
      //   Math.sin(elapsedTime * 1.5 + index * 0.03) * 200.0,
      //   0,
      // );
      this.instanceDummy.position.set(
        Math.sin(elapsedTime + index * 0.03) * this.animationParams.position.x,
        Math.sin(elapsedTime * 1.5 + index * 0.03) * this.animationParams.position.x,
        0,
      );

      this.instanceDummy.updateMatrix();

      positions.set([this.instanceDummy.position.x, this.instanceDummy.position.y, this.instanceDummy.position.z], i * 3);
      scales.set([this.instanceDummy.scale.x, this.instanceDummy.scale.y, this.instanceDummy.scale.z], i * 3);
      rotations.set([this.instanceDummy.quaternion.x, this.instanceDummy.quaternion.y, this.instanceDummy.quaternion.z, this.instanceDummy.quaternion.w], i * 4);

      this.instancedMesh.setMatrixAt(i, this.instanceDummy.matrix);
    }
    
    this.instancedMesh.geometry.attributes.instancePosition.array = positions;
    this.instancedMesh.geometry.attributes.instanceScale.array = scales;
    this.instancedMesh.geometry.attributes.instanceRotation.array = rotations;

    this.instancedMesh.geometry.attributes.instancePosition.needsUpdate = true;
    this.instancedMesh.geometry.attributes.instanceScale.needsUpdate = true;
    this.instancedMesh.geometry.attributes.instanceRotation.needsUpdate = true;

    this.instancedMesh.instanceMatrix.needsUpdate = true;

    //レンダリング
    this.renderer.render(this.scene, this.camera);
    // this.controls.update();
    requestAnimationFrame(this._update.bind(this));
  }

  _onResize() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    // レンダラーのサイズを修正
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    // カメラのアスペクト比を修正
    this.camera.aspect = this.viewport.width / this.viewport.height;
    this.camera.updateProjectionMatrix();
    // カメラの位置を調整
    this.cameraDistance = (this.viewport.height / 2) / Math.tan(this.cameraFovRadian); //ウインドウぴったりのカメラ距離
    this.camera.position.z = this.cameraDistance;
    // uniforms変数に反映
    this.mesh.material.uniforms.uResolution.value.set(this.viewport.width, this.viewport.height);
  }

  _addEvent() {
    window.addEventListener("resize", this._onResize.bind(this));
  }
}

const main = new Main();
