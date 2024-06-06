import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/webxr/VRButton.js';

class BasicWorldDemo {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);
    this._threejs.xr.enabled = true;  // Enable WebXR

    document.body.appendChild(this._threejs.domElement);
    document.body.appendChild(VRButton.createButton(this._threejs));  // Add VR button

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(75, 20, 0);

    this._scene = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(20, 100, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this._scene.add(light);

    light = new THREE.AmbientLight(0x101010);
    this._scene.add(light);

    const controls = new OrbitControls(this._camera, this._threejs.domElement);
    controls.target.set(0, 20, 0);
    controls.update();

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        'https://emlzaretzky.github.io/testwebflow-webXR/resources/posx.jpg',
      'https://emlzaretzky.github.io/testwebflow-webXR/resources/negx.jpg',
      'https://emlzaretzky.github.io/testwebflow-webXR/resources/posy.jpg',
      'https://emlzaretzky.github.io/testwebflow-webXR/resources/negy.jpg',
      'https://emlzaretzky.github.io/testwebflow-webXR/resources/posz.jpg',
      
      'https://emlzaretzky.github.io/testwebflow-webXR/resources/negz.jpg',
      
    ]);
    this._scene.background = texture;

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
    );
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this._scene.add(plane);

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
    );
    box.position.set(0, 1, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    this._scene.add(box);

    for (let x = -8; x < 8; x++) {
      for (let y = -8; y < 8; y++) {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(2, 2, 2),
          new THREE.MeshStandardMaterial({ color: 0x808080 })
        );
        box.position.set(Math.random() + x * 5, Math.random() * 4.0 + 2.0, Math.random() + y * 5);
        box.castShadow = true;
        box.receiveShadow = true;
        this._scene.add(box);
      }
    }

    // Add keyboard controls for camera movement
    this._AddKeyboardControls();

    // Handle XR session start and end
    this._HandleXRSession();

    this._RAF();
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _RAF() {
    this._threejs.setAnimationLoop(() => {
      this._threejs.render(this._scene, this._camera);
    });
  }

  // Add keyboard controls for camera movement
  _AddKeyboardControls() {
    document.addEventListener('keydown', (event) => {
      const speed = 1;
      switch (event.key) {
        case 'ArrowUp':
          this._camera.position.z -= speed;
          break;
        case 'ArrowDown':
          this._camera.position.z += speed;
          break;
        case 'ArrowLeft':
          this._camera.position.x -= speed;
          break;
        case 'ArrowRight':
          this._camera.position.x += speed;
          break;
        case 'w':
          this._camera.position.y += speed;
          break;
        case 's':
          this._camera.position.y -= speed;
          break;
      }
    });
  }

  // Handle XR session start and end
  _HandleXRSession() {
    const renderer = this._threejs;
    renderer.xr.addEventListener('sessionstart', () => {
      this._xrSessionActive = true;  // Flag to disable keyboard controls
    });

    renderer.xr.addEventListener('sessionend', () => {
      this._xrSessionActive = false;  // Flag to enable keyboard controls
    });
  }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new BasicWorldDemo();
});
