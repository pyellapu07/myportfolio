"use client";

import { useEffect, useRef } from "react";

// The agent: a clear glass bubble with a solid ball floating inside it. The
// glass is physically based (transmission, refraction, dispersion and a
// thin-film sheen), so the ball is seen bent and split through it; a warm key
// and a cool rim light give it real highlights, and a few out-of-focus
// specks drift around it like lens bokeh. The ball's two eyes wander, glance
// at the pointer and blink. Real 3D: use it at 64px and up.

export type AgentMood = "idle" | "listening" | "thinking" | "answered";
export type AgentCore = "brass" | "cyan";

const CORES: Record<AgentCore, { color: number; metalness: number; roughness: number }> = {
  // Matte brushed brass.
  brass: { color: 0xb08a55, metalness: 0.8, roughness: 0.7 },
  // Satin cyan, the globe's colour.
  cyan: { color: 0x1fc8ff, metalness: 0.15, roughness: 0.55 },
};

export default function AgentOrb({
  size = 200,
  mood = "idle",
  core = "brass",
  className = "",
}: {
  size?: number;
  mood?: AgentMood;
  core?: AgentCore;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const moodRef = useRef(mood);
  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0;
    let disposed = false;
    let cleanup = () => {};

    Promise.all([import("three"), import("three/examples/jsm/environments/RoomEnvironment.js")]).then(([THREE, { RoomEnvironment }]) => {
      if (disposed) return;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(size, size, false);
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;
      // Turn the room so its softbox reflection sits high and left on the
      // ball, clear of the eyes.
      scene.environmentRotation.set(-0.5, 0.9, 0);
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
      camera.position.set(0, 0, 7);

      // Real light sources: a warm key high left, a cool cyan rim behind right.
      const key = new THREE.SpotLight(0xfff1dc, 60, 20, 0.5, 0.6);
      key.position.set(-3.5, 4.5, 5);
      const rim = new THREE.PointLight(0x5fd8ff, 30, 12);
      rim.position.set(3, -1.5, -3);
      scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.15));

      const agent = new THREE.Group();
      scene.add(agent);

      // The core ball, with its eyes, turns as a unit towards where it looks.
      const head = new THREE.Group();
      agent.add(head);
      const c = CORES[core];
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.62, 96, 64),
        new THREE.MeshPhysicalMaterial({ color: c.color, metalness: c.metalness, roughness: c.roughness, clearcoat: 0.15, clearcoatRoughness: 0.6, envMapIntensity: 0.9 }),
      );
      head.add(ball);
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6, roughness: 0.3 });
      const eyes = [-1, 1].map((side) => {
        const e = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.13, 8, 16), eyeMat);
        const R = 0.62;
        const p = new THREE.Vector3(side * 0.17, 0.07, 0).setZ(Math.sqrt(R ** 2 - 0.17 ** 2 - 0.07 ** 2) - 0.015);
        e.position.copy(p);
        // Face outwards along the surface normal; the capsule's long axis (Y)
        // stays upright.
        e.lookAt(p.clone().multiplyScalar(2));
        head.add(e);
        return e;
      });

      // The glass: clear, refracting, with dispersion and a thin-film sheen.
      const glass = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 1,
        thickness: 0.35,
        roughness: 0.03,
        ior: 1.48,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        iridescence: 0.45,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [120, 420],
        dispersion: 5,
        attenuationColor: new THREE.Color(0xe6f8ff),
        attenuationDistance: 4,
        specularIntensity: 1,
        envMapIntensity: 1.6,
      });
      const bubble = new THREE.Mesh(new THREE.SphereGeometry(1.32, 128, 96), glass);
      agent.add(bubble);
      // Fresnel edge: glass is clearest face-on and brightest at its rim, so
      // a shell that only shows at grazing angles gives the bubble a visible
      // edge on any background, white page included.
      const edge = new THREE.Mesh(
        new THREE.SphereGeometry(1.335, 96, 64),
        new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: { uTint: { value: new THREE.Color(0x7fa9c4) } },
          vertexShader: `
            varying vec3 vN; varying vec3 vV;
            void main() {
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
              gl_Position = projectionMatrix * mv;
            }`,
          fragmentShader: `
            uniform vec3 uTint; varying vec3 vN; varying vec3 vV;
            void main() {
              float f = pow(1.0 - max(dot(vN, vV), 0.0), 3.2);
              // A cool grey-blue rim, lighter towards the top where the key hits.
              vec3 col = mix(uTint, vec3(0.92, 0.97, 1.0), smoothstep(-0.2, 0.8, vN.y));
              gl_FragColor = vec4(col, f * 0.85);
            }`,
        }),
      );
      agent.add(edge);
      // A thin glass rim inside the bubble, tilted, like a lens element.
      const rimRing = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.022, 24, 200), glass);
      rimRing.rotation.set(1.15, 0.35, 0);
      agent.add(rimRing);

      // Bokeh: soft out-of-focus specks drifting round the bubble.
      const dot = document.createElement("canvas");
      dot.width = dot.height = 64;
      const g = dot.getContext("2d")!;
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,255,255,0.9)");
      grad.addColorStop(0.45, "rgba(200,240,255,0.35)");
      grad.addColorStop(1, "rgba(200,240,255,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      const dotTex = new THREE.CanvasTexture(dot);
      const specks = Array.from({ length: 7 }, (_, i) => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, transparent: true, depthWrite: false, opacity: 0.5, color: i % 3 ? 0xbfefff : 0xfff3e0 }));
        const a = (i / 7) * Math.PI * 2;
        s.userData = { a, r: 1.55 + (i % 3) * 0.25, z: i % 2 ? -1.2 : 1.4, sp: 0.08 + (i % 4) * 0.03, sc: 0.18 + (i % 3) * 0.14 };
        scene.add(s);
        return s;
      });

      const gaze = { x: 0, y: 0, tx: 0, ty: 0, next: 0 };
      let blinkAt = 1500 + Math.random() * 2500;
      let pointer: { x: number; y: number } | null = null;
      const onMove = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        pointer = {
          x: Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2))),
          y: Math.max(-1, Math.min(1, -(e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2))),
        };
        gaze.next = performance.now() + 1800;
      };
      window.addEventListener("pointermove", onMove);

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const t0 = performance.now();
      const frame = (now: number) => {
        const t = (now - t0) / 1000;
        const m = moodRef.current;
        if (now > gaze.next) {
          [gaze.tx, gaze.ty] = m === "thinking" ? [-0.7, 0.6] : [(Math.random() * 2 - 1) * 0.9, (Math.random() * 2 - 1) * 0.6];
          gaze.next = now + 700 + Math.random() * 2200;
          pointer = null;
        }
        const tx = pointer ? pointer.x : gaze.tx;
        const ty = pointer ? pointer.y : gaze.ty;
        gaze.x += (tx - gaze.x) * 0.16;
        gaze.y += (ty - gaze.y) * 0.16;
        // The ball rolls to look; it's free inside the glass.
        head.rotation.y = gaze.x * 0.55;
        head.rotation.x = -gaze.y * 0.45;

        let lid = 1;
        if (now > blinkAt) {
          const u = (now - blinkAt) / 150;
          lid = u < 1 ? Math.abs(1 - 2 * u) : 1;
          if (u >= 1) blinkAt = now + 2200 + Math.random() * 3800 * (Math.random() < 0.2 ? 0.1 : 1);
        }
        if (m === "answered") lid = Math.min(lid, 0.3);
        const open = Math.max(0.1, lid) * (m === "listening" ? 1.15 : 1);
        eyes.forEach((e) => e.scale.set(1, open, 1));

        if (!reduce) {
          agent.position.y = Math.sin(t * 1.1) * 0.05;
          bubble.rotation.y = t * 0.15; // keeps the thin-film colours moving
          rimRing.rotation.z = t * 0.25;
          specks.forEach((s) => {
            const u = s.userData;
            const a = u.a + t * u.sp;
            s.position.set(Math.cos(a) * u.r, Math.sin(a) * u.r * 0.8, u.z);
            const sc = u.sc * (m === "thinking" ? 1.35 : 1) * (0.85 + 0.15 * Math.sin(t * 2 + u.a * 3));
            s.scale.set(sc, sc, 1);
          });
        }
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        window.removeEventListener("pointermove", onMove);
        renderer.dispose();
        pmrem.dispose();
        dotTex.dispose();
      };
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, [size, core]);

  return <canvas ref={ref} width={size} height={size} style={{ width: size, height: size }} className={className} aria-hidden="true" />;
}
