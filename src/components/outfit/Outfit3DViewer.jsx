import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Maximize2 } from "lucide-react";

export default function Outfit3DViewer({ selectedItems }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Mouse interaction for rotation
    let mouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;
    let rotationY = 0;
    let rotationX = 0;

    const onMouseDown = (e) => {
      mouseDown = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!mouseDown) return;
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;
      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;
      targetRotationX = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotationX));
    };

    const onMouseUp = () => {
      mouseDown = false;
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.style.cursor = "grab";

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth rotation
      rotationY += (targetRotationY - rotationY) * 0.1;
      rotationX += (targetRotationX - rotationX) * 0.1;

      itemsRef.current.forEach((item) => {
        item.rotation.y = rotationY;
        item.rotation.x = rotationX;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseup", onMouseUp);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear existing items
    itemsRef.current.forEach((item) => {
      sceneRef.current.remove(item);
    });
    itemsRef.current = [];

    // Get category positions
    const getCategoryPosition = (category) => {
      const positions = {
        outerwear: { y: 1.5, z: 0.3 },
        tops: { y: 1.2, z: 0 },
        dresses: { y: 0.5, z: 0 },
        bottoms: { y: -0.3, z: 0 },
        shoes: { y: -1.5, z: 0 },
        accessories: { y: 2, z: 0.2 },
      };
      return positions[category] || { y: 0, z: 0 };
    };

    // Sort items by category
    const sortedItems = [...selectedItems].sort((a, b) => {
      const order = { accessories: 0, outerwear: 1, tops: 2, dresses: 3, bottoms: 4, shoes: 5 };
      return (order[a.category] || 999) - (order[b.category] || 999);
    });

    // Add clothing items as textured planes
    sortedItems.forEach((item, index) => {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.setCrossOrigin("anonymous");
      
      textureLoader.load(
        item.image_url,
        (texture) => {
          const aspectRatio = texture.image.width / texture.image.height;
          const width = aspectRatio > 1 ? 2 : 2 * aspectRatio;
          const height = aspectRatio > 1 ? 2 / aspectRatio : 2;

          const geometry = new THREE.PlaneGeometry(width, height);
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
          });

          const mesh = new THREE.Mesh(geometry, material);
          const pos = getCategoryPosition(item.category);
          mesh.position.set(0, pos.y, pos.z);

          const group = new THREE.Group();
          group.add(mesh);

          sceneRef.current.add(group);
          itemsRef.current.push(group);
        },
        undefined,
        (error) => {
          console.error("Error loading texture:", error);
          // Fallback: create a colored plane
          const geometry = new THREE.PlaneGeometry(2, 2.5);
          const material = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(geometry, material);
          const pos = getCategoryPosition(item.category);
          mesh.position.set(0, pos.y, pos.z);

          const group = new THREE.Group();
          group.add(mesh);

          sceneRef.current.add(group);
          itemsRef.current.push(group);
        }
      );
    });
  }, [selectedItems]);

  return (
    <Card className="border-orange-100 bg-white/80 backdrop-blur overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Maximize2 className="w-5 h-5 text-purple-500" />
          3D View
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {selectedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-center px-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
              <Maximize2 className="w-10 h-10 text-purple-400" />
            </div>
            <p className="text-gray-500 mb-2">Add items to see 3D preview</p>
            <p className="text-sm text-gray-400">Drag to rotate the view</p>
          </div>
        ) : (
          <div className="relative">
            <div ref={mountRef} className="w-full h-[500px]" />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-xs backdrop-blur">
              Drag to rotate • {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}