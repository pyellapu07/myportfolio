"use client";

import { useEffect, useRef } from "react";

// The agent: a looped ribbon flower in matte cyan, with a glossy pebble at
// its centre holding two eyes that wander, glance and blink at random. Real
// 3D (three.js), so it reads at hero and intro sizes; use it at 48px and up.

export type AgentMood = "idle" | "listening" | "thinking" | "answered";
export type AgentForm = "orbit" | "knot" | "ribbon";

const CYAN = 0x1fc8ff;
const PETALS = 6;

export default function AgentMark({
  size = 160,
  mood = "idle",
  form = "orbit",
  className = "",
}: {
  size?: number;
  mood?: AgentMood;
  form?: AgentForm;
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
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      camera.position.set(0, 0, 7.2);
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(2.5, 3, 4);
      scene.add(key, new THREE.AmbientLight(0xffffff, 0.25));

      const agent = new THREE.Group();
      scene.add(agent);

      // The form spins slowly in its own group; the face stays upright.
      const spinner = new THREE.Group();
      const face = new THREE.Group();
      agent.add(spinner, face);
      // Matte metal under a soft clear coat: the IKEA-matte / glass mix.
      const matte = new THREE.MeshPhysicalMaterial({
        color: CYAN,
        metalness: 0.2,
        roughness: 0.5,
        clearcoat: 0.8,
        clearcoatRoughness: 0.4,
        sheen: 0.4,
        sheenColor: new THREE.Color(0x9fe8ff),
        envMapIntensity: 0.7,
      });
      let eyeZ = 0.88;
      let eyeY = 0.04;
      if (form === "orbit") {
        // A small planet with a tilted ring: the eyes sit on the planet.
        const head = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), matte);
        face.add(head);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.085, 24, 160), matte);
        ring.rotation.x = 1.2;
        spinner.add(ring);
        spinner.rotation.z = -0.35;
        eyeZ = 0.97;
        eyeY = 0.12;
      } else if (form === "knot") {
        // A chunky trefoil knot with a glossy face pebble in its centre.
        spinner.add(new THREE.Mesh(new THREE.TorusKnotGeometry(1.0, 0.3, 320, 40, 2, 3), matte));
        const pebble = new THREE.Mesh(
          new THREE.SphereGeometry(0.52, 48, 32),
          new THREE.MeshPhysicalMaterial({ color: 0xf6fdff, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.9 }),
        );
        pebble.scale.set(1, 0.92, 0.6);
        pebble.position.z = 0.55;
        face.add(pebble);
        eyeZ = 0.86;
      } else {
        // Ribbon: one closed tube tracing a rose curve, petals weaving.
        const pts: InstanceType<typeof THREE.Vector3>[] = [];
        const N = 360;
        for (let i = 0; i < N; i++) {
          const t = (i / N) * Math.PI * 2;
          const r = 0.3 + 1.3 * Math.abs(Math.cos((PETALS / 2) * t));
          const a = t + 0.22 * Math.sin(PETALS * t);
          pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0.55 * Math.sin(PETALS * t * 0.5 + 0.6)));
        }
        const curve = new THREE.CatmullRomCurve3(pts, true, "centripetal");
        spinner.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 900, 0.24, 32, true), matte));
        const pebble = new THREE.Mesh(
          new THREE.SphereGeometry(0.6, 48, 32),
          new THREE.MeshPhysicalMaterial({ color: 0xf6fdff, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.9 }),
        );
        pebble.scale.set(1, 0.92, 0.55);
        pebble.position.z = 0.55;
        face.add(pebble);
      }

      const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0d12, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 });
      const eyes = [-1, 1].map((side) => {
        const e = new THREE.Mesh(new THREE.SphereGeometry(0.085, 24, 16), eyeMat);
        e.scale.set(1, 1.55, 0.5);
        e.userData.side = side;
        face.add(e);
        return e;
      });

      // Gaze: wander to a random point, hold, move again; blink at random.
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
          if (m === "thinking") {
            gaze.tx = -0.6;
            gaze.ty = 0.55;
          } else {
            gaze.tx = (Math.random() * 2 - 1) * 0.85;
            gaze.ty = (Math.random() * 2 - 1) * 0.6;
          }
          gaze.next = now + 700 + Math.random() * 2200;
          pointer = null;
        }
        const tx = pointer ? pointer.x : gaze.tx;
        const ty = pointer ? pointer.y : gaze.ty;
        // Quick saccade, then settle.
        gaze.x += (tx - gaze.x) * 0.22;
        gaze.y += (ty - gaze.y) * 0.22;

        let lid = 1;
        if (now > blinkAt) {
          const u = (now - blinkAt) / 150;
          lid = u < 1 ? Math.abs(1 - 2 * u) : 1;
          if (u >= 1) blinkAt = now + 2200 + Math.random() * 3800 * (Math.random() < 0.2 ? 0.1 : 1);
        }
        if (m === "answered") lid = Math.min(lid, 0.35); // content squint

        const spread = m === "listening" ? 0.25 : 0.22;
        eyes.forEach((e) => {
          e.position.set(e.userData.side * spread + gaze.x * 0.2, gaze.y * 0.17 + eyeY, eyeZ);
          e.scale.y = 1.55 * Math.max(0.12, lid) * (m === "listening" ? 1.15 : 1);
        });

        if (!reduce) {
          if (form === "orbit") spinner.rotation.y = t * 0.6;
          else spinner.rotation.z = t * 0.18;
          agent.rotation.x = Math.sin(t * 0.7) * 0.12 + gaze.y * 0.12;
          agent.rotation.y = Math.cos(t * 0.6) * 0.14 + gaze.x * 0.18;
          agent.position.y = Math.sin(t * 1.1) * 0.06;
        }
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        window.removeEventListener("pointermove", onMove);
        renderer.dispose();
        pmrem.dispose();
      };
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, [size, form]);

  return <canvas ref={ref} width={size} height={size} style={{ width: size, height: size }} className={className} aria-hidden="true" />;
}
