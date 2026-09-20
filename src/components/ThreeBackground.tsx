import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform vec2 resolution;
  varying vec2 vUv;

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float color = 0.0;
    color += sin(uv.x * 10.0 + time) * 0.5;
    color += sin(uv.y * 10.0 + time * 1.2) * 0.5;
    
    vec3 finalColor = vec3(0.05, 0.1, 0.2) + vec3(0.0, 0.4, 0.8) * color * 0.2;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      uniforms.resolution.value.set(width, height);
    };

    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() }
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    containerRef.current.appendChild(renderer.domElement);
    updateSize();

    window.addEventListener('resize', updateSize);

    let animationFrameId: number;
    const animate = (time: number) => {
      uniforms.time.value = time * 0.001;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate(0);

    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 -z-10 bg-slate-950 pointer-events-none"
    />
  );
}
