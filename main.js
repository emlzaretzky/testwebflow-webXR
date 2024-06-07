import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/webxr/VRButton.js';

// june 6 - can use WS and arrow keys to move camera. Can't get controllers to work yet.
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

    // Add console display for VR
    this._CreateConsoleDisplay();

    // Handle XR session start and end
    this._HandleXRSession();

    // Handle XR controllers
    this._SetupXRControllers();

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
      this._UpdateConsoleDisplay();
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

  // Create a console display for VR
  _CreateConsoleDisplay() {
    const geometry = new THREE.PlaneGeometry(2, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    this._consolePlane = new THREE.Mesh(geometry, material);
    this._consolePlane.position.set(0, 2, -3);
    this._scene.add(this._consolePlane);

    this._consoleText = document.createElement('div');
    this._consoleText.style.position = 'absolute';
    this._consoleText.style.width = '200px';
    this._consoleText.style.height = '100px';
    this._consoleText.style.backgroundColor = 'black';
    this._consoleText.style.color = 'white';
    this._consoleText.style.fontFamily = 'monospace';
    this._consoleText.style.fontSize = '14px';
    this._consoleText.style.padding = '10px';
    this._consoleText.style.overflow = 'auto';
    document.body.appendChild(this._consoleText);
  }

  // Update the position of the console display
  _UpdateConsoleDisplay() {
    const vector = new THREE.Vector3(0, 0, -3);
    vector.applyMatrix4(this._camera.matrixWorld);
    this._consolePlane.position.copy(vector);
    this._consolePlane.lookAt(this._camera.position);
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

  // Setup XR controllers
  _SetupXRControllers() {
    const controller1 = this._threejs.xr.getController(0);
    const controller2 = this._threejs.xr.getController(1);
    this._scene.add(controller1);
    this._scene.add(controller2);

    controller1.addEventListener('selectstart', () => this._LogToConsole('Controller 1: selectstart'));
    controller1.addEventListener('selectend', () => this._LogToConsole('Controller 1: selectend'));
    controller2.addEventListener('selectstart', () => this._LogToConsole('Controller 2: selectstart'));
    controller2.addEventListener('selectend', () => this._LogToConsole('Controller 2: selectend'));
  }

  // Log messages to console
  _LogToConsole(message) {
    console.log(message);
    this._consoleText.innerHTML += message + '<br>';
    this._consoleText.scrollTop = this._consoleText.scrollHeight;
  }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new BasicWorldDemo();
});
