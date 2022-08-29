import { useCallback, memo } from "react";
import * as THREE from "three";
import { CanvasCapture } from "canvas-capture";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VRMLLoader } from "three/examples/jsm/loaders/VRMLLoader.js";

function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

function AnimationCanvas(props) {
    const mountRef = useCallback((node) => {
        if (!node) return;

        let camera, scene, renderer, controls, loader, clock;
        let vrmlScene;
        const fixColors = props.config.fixColors;
        const animationSpeed = parseInt(props.config.speed);
        const animationDirection = props.config.direction;

        initScene();
        animate();

        function initRecorder() {
            CanvasCapture.init(renderer.domElement);

            if (props.config.format === "webm") {
                CanvasCapture.beginVideoRecord({
                    format: CanvasCapture.WEBM,
                    name: "pcb_animation",
                    onExportFinish: props.onExportFinish,
                    onExportProgress: props.onExportProgress,
                });
            } else {
                CanvasCapture.beginGIFRecord({
                    name: "pcb_animation",
                    onExportFinish: props.onExportFinish,
                    onExportProgress: props.onExportProgress,
                });
            }
        }

        function initScene() {
            camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1e10);
            camera.position.set(-40, 5, 10);

            scene = new THREE.Scene();
            scene.add(camera);

            // light
            const hemiLight = new THREE.HemisphereLight(0xfff9ec, 0xfff9ec, 0.5);
            hemiLight.color.setHSL(0.6, 1, 0.6);
            hemiLight.groundColor.setHSL(0.095, 1, 0.75);
            hemiLight.position.set(0, 50, 0);
            scene.add(hemiLight);

            const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
            //scene.add( hemiLightHelper );

            const dirLight = new THREE.DirectionalLight(0xfff7cc, 5.8);
            //dirLight.color.setHSL( 0.1, 1, 0.95 );
            dirLight.position.set(-1, 1.75, 1);
            dirLight.position.multiplyScalar(30);
            scene.add(dirLight);

            dirLight.castShadow = true;

            dirLight.shadow.mapSize.width = 2048;
            dirLight.shadow.mapSize.height = 2048;

            const d = 50;

            dirLight.shadow.camera.left = -d;
            dirLight.shadow.camera.right = d;
            dirLight.shadow.camera.top = d;
            dirLight.shadow.camera.bottom = -d;

            dirLight.shadow.camera.far = 3500;
            dirLight.shadow.bias = -0.0001;

            const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
            //scene.add( dirLightHelper );

            loader = new VRMLLoader();
            loadAsset(props.config.file);

            // renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.toneMappingExposure = 0.5;
            //renderer.outputEncoding = THREE.sRGBEncoding
            //renderer.toneMapping = THREE.ReinhardToneMapping;
            renderer.toneMapping = THREE.ReinhardToneMapping;
            renderer.shadowMap.enabled = true;

            //renderer.physicallyCorrectLights = true;
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(600, 600);
            node.appendChild(renderer.domElement);

            // controls
            controls = new OrbitControls(camera, renderer.domElement);
            controls.minDistance = 1;
            controls.maxDistance = 200;
            controls.enableDamping = true;

            clock = new THREE.Clock();
        }

        function loadAsset(asset) {
            const reader = new FileReader();
            reader.onabort = () => console.log("file reading was aborted");
            reader.onerror = () => console.log("file reading has failed");
            reader.onload = () => {
                // Do whatever you want with the file contents
                const fileContent = reader.result;
                vrmlScene = loader.parse(fileContent);
                vrmlScene.rotation.y = degToRad(-90);
                vrmlScene.traverse((o) => {
                    if (o.isMesh) {
                        o.castShadow = true;
                        o.receiveShadow = true;
                        if (o.material.map) {
                            o.material.map.anisotropy = 16;
                        }

                        if (fixColors) {
                            // Make yellow (brass, copper, gold) more vibrant
                            if (o.material.color.getHex() === 0xdbbc7e) {
                                o.material.color.set(0xff9933);
                                //o.material.shininess = 0.6;
                                //console.log(`Fixing ${o.material.name}`);
                            }

                            // Make black hard plastic (connectors) darker
                            if (o.material.shininess === 0.34999999 && o.material.specular.getHex() === 0x111111) {
                                o.material.color.set(0x050505);
                                o.material.specular.set(0x191919);
                                o.material.shininess = 0.05;
                                //console.log(`Fixing ${o.material.name}`);
                            }
                        }
                    }
                });
                scene.add(vrmlScene);
                controls.reset();
                initRecorder();
            };
            reader.readAsText(asset);
        }

        function animate() {
            requestAnimationFrame(animate);

            controls.update(); // to support damping
            if (vrmlScene && "rotation" in vrmlScene) {
                if (animationDirection === "right") {
                    vrmlScene.rotation.y += clock.getDelta() * (animationSpeed * 0.2);
                } else {
                    vrmlScene.rotation.y -= clock.getDelta() * (animationSpeed * 0.2);
                }
            }

            renderer.render(scene, camera);
            if (CanvasCapture.isRecording()) {
                CanvasCapture.recordFrame();

                if (vrmlScene && "rotation" in vrmlScene) {
                    if (animationDirection === "right") {
                        if (vrmlScene.rotation.y >= degToRad(270)) {
                            CanvasCapture.stopRecord();
                        }
                    } else {
                        if (vrmlScene.rotation.y <= degToRad(-450)) {
                            CanvasCapture.stopRecord();
                        }
                    }
                }
            }
        }
    }, []);
    return <div className="AnimationCanvas" ref={mountRef} style={{ display: "none" }}></div>;
}

export default memo(AnimationCanvas);
