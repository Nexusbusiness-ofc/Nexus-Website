// THREE.JS SCENE WITH TEXTURED LOGO, ORBITING RINGS, AND MOUSE-TRAIL PARTICLES

(function() {
    let scene, camera, renderer;
    let particleSystem;
    let logoMesh;
    let orbitRing1, orbitRing2;
    let targetRotationX = 0;
    let targetRotationY = 0.5;
    let mouse = { x: 0, y: 0 };
    let mouseWorldPos = new THREE.Vector3(0, 0, 0);
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    
    // Trail particles pool
    const trailParticles = [];
    const maxTrailCount = 60;
    let trailGroup;

    // Initialize the Three.js Environment
    function init() {
        const container = document.getElementById('canvas-container');
        if (!container) return;

        // 1. Create Scene
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0xf8f9fc, 0.005);
        
        trailGroup = new THREE.Group();
        scene.add(trailGroup);

        // 2. Create Camera
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 80;

        // 3. Create Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        container.appendChild(renderer.domElement);

        // 4. Create Lighting (Premium Light Theme Setup)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
        scene.add(ambientLight);

        // Highlights - Cyan
        const cyanLight = new THREE.PointLight(0x00b4d8, 15, 120);
        cyanLight.position.set(-25, 20, 25);
        scene.add(cyanLight);

        // Highlights - Gold
        const goldLight = new THREE.PointLight(0xf59e0b, 15, 120);
        goldLight.position.set(25, -20, 25);
        scene.add(goldLight);

        // Strong directional light for crisp reflections
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
        dirLight.position.set(5, 40, 20);
        scene.add(dirLight);

        // Rim light
        const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
        rimLight.position.set(0, 30, -40);
        scene.add(rimLight);

        // 5. Create Background Particles
        createParticles();

        // 6. Create 3D Logo (Letter N) with Texture loader
        create3DLogo();
        
        // 7. Create Orbiting Rings
        createOrbitingRings();

        // 8. Add Listeners
        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('touchstart', onTouchMove, false);
        document.addEventListener('touchmove', onTouchMove, false);

        // Start Animation Loop
        animate();
    }

    // Dynamic Round Particle Texture for Background and Trail
    function createCircleTexture(color1, color2) {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, color1 || 'rgba(0, 180, 216, 1)');
        gradient.addColorStop(0.4, color2 || 'rgba(245, 158, 11, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);
        return new THREE.CanvasTexture(canvas);
    }

    // Background Particle Field
    function createParticles() {
        const particleCount = 900;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 250;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200 - 50;

            velocities.push({
                x: (Math.random() - 0.5) * 0.03,
                y: (Math.random() - 0.5) * 0.03 + 0.012,
                z: (Math.random() - 0.5) * 0.03
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 2.0,
            map: createCircleTexture('rgba(0, 180, 216, 1)', 'rgba(245, 158, 11, 0.4)'),
            transparent: true,
            blending: THREE.NormalBlending,
            depthWrite: false,
            opacity: 0.4
        });

        particleSystem = new THREE.Points(geometry, material);
        particleSystem.userData = { velocities: velocities };
        scene.add(particleSystem);
    }

    // Create Textured 3D N
    function create3DLogo() {
        const shape = new THREE.Shape();
        shape.moveTo(-16, -20);
        shape.lineTo(-16, 20);
        shape.lineTo(-7, 20);
        shape.lineTo(7, -8);
        shape.lineTo(7, 20);
        shape.lineTo(16, 20);
        shape.lineTo(16, -20);
        shape.lineTo(7, -20);
        shape.lineTo(-7, 8);
        shape.lineTo(-7, -20);
        shape.closePath();

        const extrudeSettings = {
            steps: 2,
            depth: 5,
            bevelEnabled: true,
            bevelThickness: 1.5,
            bevelSize: 0.8,
            bevelOffset: 0,
            bevelSegments: 4
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();

        // Load logo.jpg as texture mapping
        const textureLoader = new THREE.TextureLoader();
        const logoTexture = textureLoader.load('logo.jpg', function(texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(0.018, 0.018); // scale repeat detail
            texture.offset.set(0.5, 0.5);
        });

        // Mirror-chrome physical material with texture
        const material = new THREE.MeshPhysicalMaterial({
            map: logoTexture,
            bumpMap: logoTexture,
            bumpScale: 0.1,
            metalness: 0.85,          // highly metallic
            roughness: 0.18,          // shiny reflections
            transmission: 0.75,       // crystal refraction
            ior: 1.65,                // refractive index
            thickness: 3.5,           // physical refraction depth
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            side: THREE.DoubleSide
        });

        // Glowing cyan/gold edges overlay
        const wireframeGeom = new THREE.EdgesGeometry(geometry);
        const wireframeMat = new THREE.LineBasicMaterial({
            color: 0x00b4d8,
            transparent: true,
            opacity: 0.3
        });
        const wireframe = new THREE.LineSegments(wireframeGeom, wireframeMat);

        logoMesh = new THREE.Mesh(geometry, material);
        logoMesh.add(wireframe);
        
        logoMesh.scale.set(1.2, 1.2, 1.2);
        logoMesh.position.set(0, 0, 0);

        scene.add(logoMesh);
    }

    // Create Golden Orbiting Crystal Rings
    function createOrbitingRings() {
        const ringMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xf59e0b,
            metalness: 0.9,
            roughness: 0.15,
            transmission: 0.4,
            ior: 1.5,
            clearcoat: 1.0,
            side: THREE.DoubleSide
        });

        // Ring 1 (Inner tilted)
        const geom1 = new THREE.RingGeometry(21, 21.5, 64);
        orbitRing1 = new THREE.Mesh(geom1, ringMaterial);
        orbitRing1.rotation.x = Math.PI / 3.5;
        orbitRing1.rotation.y = Math.PI / 4;
        scene.add(orbitRing1);

        // Ring 2 (Outer tilted opposite)
        const geom2 = new THREE.RingGeometry(25, 25.4, 64);
        orbitRing2 = new THREE.Mesh(geom2, ringMaterial);
        orbitRing2.rotation.x = -Math.PI / 4;
        orbitRing2.rotation.y = -Math.PI / 6;
        scene.add(orbitRing2);
    }

    // Spawn mouse-trail glowing particles in 3D world space
    function spawnTrailParticle(pos) {
        if (trailParticles.length >= maxTrailCount) {
            const oldParticle = trailParticles.shift();
            trailGroup.remove(oldParticle.mesh);
        }

        // Alternate colors between cyan and gold
        const isCyan = Math.random() < 0.6;
        const color = isCyan ? 'rgba(0, 180, 216, 1)' : 'rgba(245, 158, 11, 1)';
        const colorFade = isCyan ? 'rgba(0, 119, 182, 0)' : 'rgba(217, 119, 6, 0)';

        // Geometry (Small square plane mapped with circle texture)
        const geometry = new THREE.PlaneGeometry(1.5, 1.5);
        const material = new THREE.MeshBasicMaterial({
            map: createCircleTexture(color, colorFade),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(pos);
        
        // Add tiny offsets
        mesh.position.x += (Math.random() - 0.5) * 2;
        mesh.position.y += (Math.random() - 0.5) * 2;
        mesh.position.z += (Math.random() - 0.5) * 2;

        const particle = {
            mesh: mesh,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.08,
                (Math.random() - 0.5) * 0.08 - 0.05, // fall slowly
                (Math.random() - 0.5) * 0.08
            ),
            age: 0,
            maxAge: 40 + Math.random() * 20
        };

        trailGroup.add(mesh);
        trailParticles.push(particle);
    }

    // Calculate 3D coordinates matching the 2D cursor coordinates on z = 0 plane
    function updateMouseWorldPos() {
        const vector = new THREE.Vector3(mouse.x, -mouse.y, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        mouseWorldPos.copy(camera.position).add(dir.multiplyScalar(distance));
    }

    // Handles Window Resizing
    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Tracks mouse movement
    function onMouseMove(event) {
        mouse.x = (event.clientX - windowHalfX) / windowHalfX;
        mouse.y = (event.clientY - windowHalfY) / windowHalfY;
        
        updateMouseWorldPos();
        
        // Spawn trail particles with high probability during move
        if (Math.random() < 0.7) {
            spawnTrailParticle(mouseWorldPos);
        }
    }

    // Mobile touch interaction
    function onTouchMove(event) {
        if (event.touches.length === 1) {
            mouse.x = (event.touches[0].clientX - windowHalfX) / windowHalfX;
            mouse.y = (event.touches[0].clientY - windowHalfY) / windowHalfY;
            updateMouseWorldPos();
            spawnTrailParticle(mouseWorldPos);
        }
    }

    // Smooth section transitions
    window.updateThreeSceneForSection = function(sectionId) {
        if (!logoMesh || !orbitRing1 || !orbitRing2) return;

        switch(sectionId) {
            case 'home':
                gsapTo(logoMesh.position, { x: 28, y: 0, z: 0 });
                gsapTo(logoMesh.scale, { x: 1.25, y: 1.25, z: 1.25 });
                
                gsapTo(orbitRing1.position, { x: 28, y: 0, z: 0 });
                gsapTo(orbitRing1.scale, { x: 1.0, y: 1.0, z: 1.0 });
                
                gsapTo(orbitRing2.position, { x: 28, y: 0, z: 0 });
                gsapTo(orbitRing2.scale, { x: 1.0, y: 1.0, z: 1.0 });
                
                targetRotationX = 0.1;
                targetRotationY = 0.5;
                break;
                
            case 'services':
                gsapTo(logoMesh.position, { x: -35, y: 10, z: -10 });
                gsapTo(logoMesh.scale, { x: 0.75, y: 0.75, z: 0.75 });
                
                gsapTo(orbitRing1.position, { x: -35, y: 10, z: -10 });
                gsapTo(orbitRing1.scale, { x: 0.75, y: 0.75, z: 0.75 });
                
                gsapTo(orbitRing2.position, { x: -35, y: 10, z: -10 });
                gsapTo(orbitRing2.scale, { x: 0.75, y: 0.75, z: 0.75 });
                
                targetRotationX = 0.3;
                targetRotationY = -0.6;
                break;

            case 'workflow':
                // Position N in center background (smaller scale)
                gsapTo(logoMesh.position, { x: 0, y: 0, z: -25 });
                gsapTo(logoMesh.scale, { x: 0.65, y: 0.65, z: 0.65 });
                
                gsapTo(orbitRing1.position, { x: 0, y: 0, z: -25 });
                gsapTo(orbitRing1.scale, { x: 0.65, y: 0.65, z: 0.65 });
                
                gsapTo(orbitRing2.position, { x: 0, y: 0, z: -25 });
                gsapTo(orbitRing2.scale, { x: 0.65, y: 0.65, z: 0.65 });
                
                targetRotationX = 0.5;
                targetRotationY = 1.2;
                break;
                
            case 'discord':
                gsapTo(logoMesh.position, { x: 35, y: 15, z: -15 });
                gsapTo(logoMesh.scale, { x: 0.85, y: 0.85, z: 0.85 });
                
                gsapTo(orbitRing1.position, { x: 35, y: 15, z: -15 });
                gsapTo(orbitRing1.scale, { x: 0.85, y: 0.85, z: 0.85 });
                
                gsapTo(orbitRing2.position, { x: 35, y: 15, z: -15 });
                gsapTo(orbitRing2.scale, { x: 0.85, y: 0.85, z: 0.85 });
                
                targetRotationX = -0.2;
                targetRotationY = 0.7;
                break;
                
            case 'contact':
                gsapTo(logoMesh.position, { x: -38, y: -15, z: -10 });
                gsapTo(logoMesh.scale, { x: 0.65, y: 0.65, z: 0.65 });
                
                gsapTo(orbitRing1.position, { x: -38, y: -15, z: -10 });
                gsapTo(orbitRing1.scale, { x: 0.65, y: 0.65, z: 0.65 });
                
                gsapTo(orbitRing2.position, { x: -38, y: -15, z: -10 });
                gsapTo(orbitRing2.scale, { x: 0.65, y: 0.65, z: 0.65 });
                
                targetRotationX = 0.4;
                targetRotationY = 0.3;
                break;
        }
    };

    // Smooth transition lerper
    function gsapTo(target, vars) {
        const keys = Object.keys(vars);
        const duration = 1.6;
        const start = performance.now();
        const startValues = {};
        
        keys.forEach(key => {
            startValues[key] = target[key];
        });

        function step(now) {
            const progress = Math.min((now - start) / (duration * 1000), 1);
            const ease = 1 - Math.pow(1 - progress, 5); // easeOutQuint
            
            keys.forEach(key => {
                target[key] = startValues[key] + (vars[key] - startValues[key]) * ease;
            });

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        
        requestAnimationFrame(step);
    }

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        const time = performance.now() * 0.0003;

        // 1. Background particles
        if (particleSystem) {
            const positions = particleSystem.geometry.attributes.position.array;
            const velocities = particleSystem.userData.velocities;
            const count = positions.length / 3;

            for (let i = 0; i < count; i++) {
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;

                positions[i * 3] += mouse.x * 0.035;
                positions[i * 3 + 1] -= mouse.y * 0.035;

                if (positions[i * 3 + 1] > 125) positions[i * 3 + 1] = -125;
                if (Math.abs(positions[i * 3]) > 150) positions[i * 3] = (Math.random() - 0.5) * 150;
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;
            particleSystem.rotation.y += 0.0002;
        }

        // 2. Animate N Logo Mesh
        if (logoMesh) {
            const rx = targetRotationX + (mouse.y * 0.22);
            const ry = targetRotationY + (mouse.x * 0.22) + time;
            
            logoMesh.rotation.x += (rx - logoMesh.rotation.x) * 0.04;
            logoMesh.rotation.y += (ry - logoMesh.rotation.y) * 0.04;
            logoMesh.position.y += Math.sin(performance.now() * 0.001) * 0.006;
        }

        // 3. Orbiting rings movement
        if (orbitRing1 && orbitRing2) {
            orbitRing1.rotation.z += 0.006;
            orbitRing1.rotation.y += 0.002;
            
            orbitRing2.rotation.z -= 0.004;
            orbitRing2.rotation.x += 0.003;
        }

        // 4. Update and animate trail particles
        for (let i = trailParticles.length - 1; i >= 0; i--) {
            const p = trailParticles[i];
            p.age++;
            
            // Apply velocity
            p.mesh.position.add(p.velocity);
            
            // Shrink and fade
            const lifeRatio = 1 - (p.age / p.maxAge);
            p.mesh.scale.set(lifeRatio, lifeRatio, lifeRatio);
            p.mesh.material.opacity = lifeRatio * 0.7;

            // Remove dead particles
            if (p.age >= p.maxAge) {
                trailParticles.splice(i, 1);
                trailGroup.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
            }
        }

        // 5. Camera positioning
        camera.position.x += (mouse.x * 6 - camera.position.x) * 0.04;
        camera.position.y += (-mouse.y * 6 - camera.position.y) * 0.04;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    window.addEventListener('DOMContentLoaded', () => {
        init();
        
        // Mobile layout adjustments
        if (window.innerWidth < 768) {
            window.updateThreeSceneForSection = function(sectionId) {
                if (!logoMesh || !orbitRing1 || !orbitRing2) return;
                
                // Position rings and mesh at the same spot on mobile
                let yPos = 35;
                let zPos = -25;
                let scale = 0.45;
                
                if (sectionId === 'home') {
                    yPos = 15;
                    zPos = 0;
                    scale = 0.85;
                }
                
                gsapTo(logoMesh.position, { x: 0, y: yPos, z: zPos });
                gsapTo(logoMesh.scale, { x: scale, y: scale, z: scale });
                
                gsapTo(orbitRing1.position, { x: 0, y: yPos, z: zPos });
                gsapTo(orbitRing1.scale, { x: scale, y: scale, z: scale });
                
                gsapTo(orbitRing2.position, { x: 0, y: yPos, z: zPos });
                gsapTo(orbitRing2.scale, { x: scale, y: scale, z: scale });
            };
            window.updateThreeSceneForSection('home');
        }
    });

})();
