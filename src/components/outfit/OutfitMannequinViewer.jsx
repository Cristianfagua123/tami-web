import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OutfitMannequinViewer({ items, onClose }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const mannequinGroupRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 5);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, 5, -5);
    scene.add(directionalLight2);

    // Create mannequin group
    const mannequinGroup = new THREE.Group();
    mannequinGroupRef.current = mannequinGroup;
    scene.add(mannequinGroup);

    // Create simple mannequin body
    const createMannequinBody = () => {
      const bodyGroup = new THREE.Group();

      // Head
      const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
      const mannequinMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8e8e8,
        roughness: 0.3,
        metalness: 0.1,
      });
      const head = new THREE.Mesh(headGeometry, mannequinMaterial);
      head.position.y = 2.2;
      bodyGroup.add(head);

      // Neck
      const neckGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 16);
      const neck = new THREE.Mesh(neckGeometry, mannequinMaterial);
      neck.position.y = 1.85;
      bodyGroup.add(neck);

      // Torso
      const torsoGeometry = new THREE.CylinderGeometry(0.35, 0.4, 1.2, 16);
      const torso = new THREE.Mesh(torsoGeometry, mannequinMaterial);
      torso.position.y = 1.1;
      bodyGroup.add(torso);

      // Hips
      const hipsGeometry = new THREE.CylinderGeometry(0.4, 0.35, 0.5, 16);
      const hips = new THREE.Mesh(hipsGeometry, mannequinMaterial);
      hips.position.y = 0.25;
      bodyGroup.add(hips);

      // Shoulders
      const shoulderGeometry = new THREE.CylinderGeometry(0.12, 0.12, 1, 16);
      const shoulders = new THREE.Mesh(shoulderGeometry, mannequinMaterial);
      shoulders.rotation.z = Math.PI / 2;
      shoulders.position.y = 1.6;
      bodyGroup.add(shoulders);

      // Arms
      const armGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.9, 16);
      const leftArm = new THREE.Mesh(armGeometry, mannequinMaterial);
      leftArm.position.set(-0.6, 1.1, 0);
      bodyGroup.add(leftArm);

      const rightArm = new THREE.Mesh(armGeometry, mannequinMaterial);
      rightArm.position.set(0.6, 1.1, 0);
      bodyGroup.add(rightArm);

      // Legs
      const legGeometry = new THREE.CylinderGeometry(0.12, 0.1, 1.2, 16);
      const leftLeg = new THREE.Mesh(legGeometry, mannequinMaterial);
      leftLeg.position.set(-0.18, -0.6, 0);
      bodyGroup.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeometry, mannequinMaterial);
      rightLeg.position.set(0.18, -0.6, 0);
      bodyGroup.add(rightLeg);

      return bodyGroup;
    };

    const mannequinBody = createMannequinBody();
    mannequinGroup.add(mannequinBody);

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Mouse interaction
    let isDragging = false;
    let previousMouseX = 0;
    let targetRotation = 0;
    let currentRotation = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      previousMouseX = e.clientX;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      previousMouseX = e.clientX;
      targetRotation += deltaX * 0.01;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.style.cursor = "grab";

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Smooth rotation
      currentRotation += (targetRotation - currentRotation) * 0.1;
      mannequinGroup.rotation.y = currentRotation;

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseup", onMouseUp);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!mannequinGroupRef.current || !items || items.length === 0) return;

    // Remove existing clothing items
    const clothingItems = mannequinGroupRef.current.children.filter(
      child => child.userData.isClothing
    );
    clothingItems.forEach(item => mannequinGroupRef.current.remove(item));

    // Get category positions on mannequin
    const getCategoryPosition = (category) => {
      const positions = {
        outerwear: { y: 1.3, z: 0.45, scale: 1.1 },
        tops: { y: 1.2, z: 0.42, scale: 1.0 },
        dresses: { y: 0.7, z: 0.42, scale: 1.0 },
        bottoms: { y: 0.3, z: 0.42, scale: 0.9 },
        shoes: { y: -1.2, z: 0.42, scale: 0.7 },
        accessories: { y: 2.0, z: 0.42, scale: 0.5 },
      };
      return positions[category] || { y: 1.0, z: 0.42, scale: 1.0 };
    };

    // Add clothing items as textured planes
    items.forEach((item) => {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.setCrossOrigin("anonymous");

      textureLoader.load(
        item.image_url,
        (texture) => {
          const aspectRatio = texture.image.width / texture.image.height;
          const baseWidth = 1.2;
          const width = aspectRatio > 1 ? baseWidth : baseWidth * aspectRatio;
          const height = aspectRatio > 1 ? baseWidth / aspectRatio : baseWidth;

          const geometry = new THREE.PlaneGeometry(width, height);
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            alphaTest: 0.1,
          });

          const mesh = new THREE.Mesh(geometry, material);
          const pos = getCategoryPosition(item.category);
          mesh.position.set(0, pos.y, pos.z);
          mesh.scale.setScalar(pos.scale);
          mesh.userData.isClothing = true;

          mannequinGroupRef.current.add(mesh);
        },
        undefined,
        (error) => {
          console.error("Error loading texture:", error);
        }
      );
    });
  }, [items]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              3D Mannequin View
            </h2>
            <p className="text-sm text-gray-600">Drag to rotate</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div ref={mountRef} className="w-full h-[70vh]" />
        
        <div className="p-4 bg-gradient-to-r from-orange-50 to-pink-50 border-t border-orange-100">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>{items.length} {items.length === 1 ? 'item' : 'items'} displayed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}