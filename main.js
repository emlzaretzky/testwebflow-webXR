import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/webxr/XRControllerModelFactory.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/geometries/TextGeometry.js';

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
    this._threejs.xr.enabled = true;

    document.body.appendChild(this._threejs.domElement);
    document.body.appendChild(VRButton.createButton(this._threejs));

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    this._camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this._camera.position.set(75, 20, 0);

    this._scene = new THREE.Scene();

    this._InitLights();
    this._InitControls();
    this._InitBackground();
    this._InitObjects();
    this._InitDebugText();

    this._RAF();
  }

  _InitLights() {
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(20, 100, 10);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.001;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500.0;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500.0;
    directionalLight.shadow.camera.left = 100;
    directionalLight.shadow.camera.right = -100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    this._scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x101010);
    this._scene.add(ambientLight);
  }

  _InitControls() {
    const controls = new OrbitControls(this._camera, this._threejs.domElement);
    controls.target.set(0, 20, 0);
    controls.update();
  }

  _InitBackground() {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      './resources/posx.jpg',
      './resources/negx.jpg',
      './resources/posy.jpg',
      './resources/negy.jpg',
      './resources/posz.jpg',
      './resources/negz.jpg',
    ]);
    this._scene.background = texture;
  }

  _InitObjects() {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
    );
    plane.rotation.x = -Math.PI / 2;
    this._scene.add(plane);

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
    );
    box.position.set(0, 1, 0);
    this._scene.add(box);

    for (let x = -8; x < 8; x++) {
      for (let y = -8; y < 8; y++) {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(2, 2, 2),
          new THREE.MeshStandardMaterial({ color: 0x808080 })
        );
        box.position.set(Math.random() + x * 5, Math.random() * 4.0 + 2.0, Math.random() + y * 5);
        this._scene.add(box);
      }
    }
     }

  _InitDebugText() {
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      const textGeometry = new TextGeometry('Controller Data', {
        font: font,
        size: 0.2,
        height: 0.02,
        curveSegments: 12,
        bevelEnabled: false
      });

      const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      this._debugTextMesh = new THREE.Mesh(textGeometry, textMaterial);
      this._scene.add(this._debugTextMesh);

      // Initial position of the text mesh
      this._debugTextMesh.position.set(0, 0, -2);
      this._debugTextMesh.rotation.y = Math.PI;
    });
  }

  _RAF() {
    this._threejs.setAnimationLoop(() => {
      this._UpdateControllerInputs();
      this._Render();
    });
  }

  _Render() {
    this._UpdateDebugTextPosition();
    this._threejs.render(this._scene, this._camera);
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _UpdateDebugTextPosition() {
    if (this._debugTextMesh) {
      const cameraDirection = new THREE.Vector3();
      this._camera.getWorldDirection(cameraDirection);

      const cameraPosition = new THREE.Vector3();
      this._camera.getWorldPosition(cameraPosition);

      cameraDirection.multiplyScalar(2);
      this._debugTextMesh.position.copy(cameraPosition).add(cameraDirection);
      this._debugTextMesh.lookAt(cameraPosition);
    }
  }

  _UpdateControllerInputs() {
    const session = this._threejs.xr.getSession();

    if (session) {
      const inputSources = session.inputSources;
      let debugText = 'Controller Data:\n';

      for (const inputSource of inputSources) {
        if (inputSource.gamepad) {
          const { buttons } = inputSource.gamepad;
          const speed = 0.1;

          if (buttons[0].pressed) {
            this._camera.position.z -= speed;
          }
          if (buttons[1].pressed) {
            this._camera.position.z += speed;
          }
        }
      }

      const loader = new FontLoader();
      loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
        const textGeometry = new TextGeometry(debugText, {
          font: font,
          size: 0.2,
          height: 0.02,
          curveSegments: 12,
          bevelEnabled: false
        });

        this._debugTextMesh.geometry.dispose();
        this._debugTextMesh.geometry = textGeometry;
      });
    }
  }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new BasicWorldDemo();
});
