import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function SmokeBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        let camera: THREE.PerspectiveCamera,
            scene: THREE.Scene,
            renderer: THREE.WebGLRenderer,
            clock: THREE.Clock;
        let smokeParticles: THREE.Mesh[] = [];

        const init = () => {
            clock = new THREE.Clock();

            renderer = new THREE.WebGLRenderer({ alpha: true });
            renderer.setClearColor(0x000000, 0);
            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);

            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
            camera.position.z = 1000;
            scene.add(camera);

            // Light - Más potente para destacar el violeta
            const light = new THREE.DirectionalLight(0xffffff, 1.5);
            light.position.set(-1, 0, 1);
            scene.add(light);

            // Smoke texture
            const loader = new THREE.TextureLoader();
            loader.setCrossOrigin('');

            const smokeTexture = loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');

            // Material violeta más visible
            const smokeMaterial = new THREE.MeshLambertMaterial({
                color: 0xe2e8f0, // Silver/light blue
                map: smokeTexture,
                transparent: true,
                opacity: 0.5,
                blending: THREE.AdditiveBlending,
                depthWrite: false // Evita artefactos visuales entre partículas
            });

            const smokeGeo = new THREE.PlaneGeometry(500, 500); // Más grande

            for (let p = 0; p < 120; p++) {
                const particle = new THREE.Mesh(smokeGeo, smokeMaterial);
                particle.position.set(
                    Math.random() * 800 - 400,
                    Math.random() * 800 - 400,
                    Math.random() * 1000 - 100
                );
                particle.rotation.z = Math.random() * 360;
                scene.add(particle);
                smokeParticles.push(particle);
            }

            window.addEventListener('resize', onWindowResize);
        };

        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        const animate = () => {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();

            let sp = smokeParticles.length;
            while (sp--) {
                smokeParticles[sp].rotation.z += (delta * 0.12);
            }

            renderer.render(scene, camera);
        };

        init();
        animate();

        return () => {
            window.removeEventListener('resize', onWindowResize);
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            // Cleanup
            smokeParticles.forEach(p => {
                p.geometry.dispose();
            });
            scene.clear();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-0 pointer-events-none opacity-80"
        />
    );
}
