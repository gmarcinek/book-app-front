import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGraphViewContext } from '../../GraphView.context';
import { GraphDataFilters } from '../GraphDataFilters/GraphDataFilters';
import type { Entity, Relationship } from '../../../../api/types';
import styles from './NetworkView3D.module.scss';

interface NodeMesh extends THREE.Mesh {
  userData: {
    entity: Entity;
    originalColor: THREE.Color;
  };
}

interface EdgeLine extends THREE.Line {
  userData: {
    relationship: Relationship;
  };
}

export function NetworkView3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const nodesRef = useRef<NodeMesh[]>([]);
  const edgesRef = useRef<EdgeLine[]>([]);
  const selectedNodeRef = useRef<NodeMesh | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const mouseRef = useRef<THREE.Vector2 | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // WSAD movement state
  const keysRef = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
    space: false
  });

  const [isInitialized, setIsInitialized] = useState(false);
  
  const { data, selectedEntityTypes, setSelectedEntity, searchQuery } = useGraphViewContext();

  // Debug logs
  console.log('NetworkView3D render:', {
    data: data ? `${data.nodes?.length} nodes, ${data.edges?.length} edges` : 'no data',
    selectedEntityTypes,
    searchQuery,
    isInitialized
  });

  // Initialize Three.js scene
  useEffect(() => {
    console.log('Initialize effect triggered:', { mountRef: !!mountRef.current, isInitialized });
    
    if (!mountRef.current || isInitialized) return;

    console.log('Starting Three.js initialization...');

    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const webglContext = gl as WebGLRenderingContext | null;
    console.log('WebGL support:', {
      webgl: !!webglContext,
      vendor: webglContext?.getParameter(webglContext.VENDOR),
      renderer: webglContext?.getParameter(webglContext.RENDERER)
    });

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    console.log('Canvas dimensions:', { width, height });

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;
    console.log('Scene created');

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 10, 50);
    cameraRef.current = camera;
    console.log('Camera created and positioned');

    // Renderer with fallback
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      console.log('WebGL renderer created successfully');
    } catch (error) {
      console.warn('WebGL failed, this should not happen in modern browsers:', error);
      // Three.js no longer has Canvas renderer, so we'll just log the error
      throw error;
    }
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x0000ff, 1); // BLUE background to test visibility
    
    // Add to DOM and log
    mountRef.current.appendChild(renderer.domElement);
    console.log('Canvas element added:', {
      tagName: renderer.domElement.tagName,
      width: renderer.domElement.width,
      height: renderer.domElement.height,
      style: renderer.domElement.style.cssText
    });
    
    rendererRef.current = renderer;
    console.log('Renderer created and added to DOM', {
      canvasWidth: renderer.domElement.width,
      canvasHeight: renderer.domElement.height,
      pixelRatio: window.devicePixelRatio
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);
    console.log('Lighting added');

    // Raycaster for mouse interactions
    raycasterRef.current = new THREE.Raycaster();
    mouseRef.current = new THREE.Vector2();
    console.log('Raycaster and mouse initialized');

    // Test cube to verify rendering works
    const testGeometry = new THREE.BoxGeometry(5, 5, 5);
    const testMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const testCube = new THREE.Mesh(testGeometry, testMaterial);
    testCube.position.set(0, 0, 0);
    scene.add(testCube);
    console.log('Test cube added at origin');

    setIsInitialized(true);
    console.log('Three.js initialization complete');

    return () => {
      console.log('Cleanup Three.js...');
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // WSAD keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'w') keysRef.current.w = true;
      if (key === 'a') keysRef.current.a = true;
      if (key === 's') keysRef.current.s = true;
      if (key === 'd') keysRef.current.d = true;
      if (key === 'shift') keysRef.current.shift = true;
      if (key === ' ') {
        keysRef.current.space = true;
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'w') keysRef.current.w = false;
      if (key === 'a') keysRef.current.a = false;
      if (key === 's') keysRef.current.s = false;
      if (key === 'd') keysRef.current.d = false;
      if (key === 'shift') keysRef.current.shift = false;
      if (key === ' ') keysRef.current.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse click handler
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!mountRef.current || !cameraRef.current || !raycasterRef.current || !mouseRef.current) return;

      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(nodesRef.current);

      if (intersects.length > 0) {
        const clickedNode = intersects[0].object as NodeMesh;
        handleNodeSelect(clickedNode);
        setSelectedEntity(clickedNode.userData.entity.id);
      }
    };

    if (mountRef.current) {
      mountRef.current.addEventListener('click', handleClick);
      return () => {
        if (mountRef.current) {
          mountRef.current.removeEventListener('click', handleClick);
        }
      };
    }
  }, [setSelectedEntity]);

  // Handle node selection and highlighting
  const handleNodeSelect = (node: NodeMesh) => {
    // Reset previous selection
    if (selectedNodeRef.current) {
      (selectedNodeRef.current.material as THREE.MeshStandardMaterial).color.copy(
        selectedNodeRef.current.userData.originalColor
      );
    }

    // Highlight new selection
    selectedNodeRef.current = node;
    (node.material as THREE.MeshStandardMaterial).color.setHex(0xffff00);

    // Zoom to node
    if (cameraRef.current) {
      const targetPosition = node.position.clone();
      targetPosition.z += 20;
      
      const startPosition = cameraRef.current.position.clone();
      const duration = 1000;
      const startTime = Date.now();

      const animateCamera = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        cameraRef.current!.position.lerpVectors(startPosition, targetPosition, progress);
        cameraRef.current!.lookAt(node.position);

        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        }
      };

      animateCamera();
    }
  };

  // Get entity color based on type
  const getEntityColor = (type: string): number => {
    switch (type) {
      case 'CHARACTER': return 0xff1493;
      case 'LOCATION': return 0x00ff7f;
      case 'TEMPORAL': return 0xffd700;
      default: return 0x6366f1;
    }
  };

  // Create or update graph visualization
  useEffect(() => {
    console.log('Graph visualization effect triggered:', {
      hasData: !!data,
      hasScene: !!sceneRef.current,
      nodeCount: data?.nodes?.length,
      edgeCount: data?.edges?.length
    });

    if (!data || !sceneRef.current) return;

    console.log('Creating graph visualization...');

    // Clear existing nodes and edges
    console.log('Clearing existing objects:', {
      existingNodes: nodesRef.current.length,
      existingEdges: edgesRef.current.length
    });

    nodesRef.current.forEach(node => sceneRef.current!.remove(node));
    edgesRef.current.forEach(edge => sceneRef.current!.remove(edge));
    nodesRef.current = [];
    edgesRef.current = [];

    // Filter data based on selected entity types
    const filteredNodes = selectedEntityTypes.length > 0
      ? data.nodes.filter(node => selectedEntityTypes.includes(node.type))
      : data.nodes;

    console.log('Filtered nodes:', {
      total: data.nodes.length,
      filtered: filteredNodes.length,
      selectedTypes: selectedEntityTypes
    });

    const nodeMap = new Map(filteredNodes.map(node => [node.id, node]));
    const filteredEdges = data.edges.filter(edge =>
      nodeMap.has(edge.source_id) && nodeMap.has(edge.target_id)
    );

    console.log('Filtered edges:', {
      total: data.edges.length,
      filtered: filteredEdges.length
    });

    // Create nodes
    const nodePositions = new Map<string, THREE.Vector3>();
    
    filteredNodes.forEach((entity, index) => {
      console.log(`Creating node ${index + 1}/${filteredNodes.length}:`, entity.name);

      // Random position in sphere - safer approach
      const radius = 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      // Validate position values
      const position = new THREE.Vector3(
        isFinite(x) ? x : 0,
        isFinite(y) ? y : 0,
        isFinite(z) ? z : 0
      );
      nodePositions.set(entity.id, position);

      // Node geometry and material - validate confidence
      const confidence = isFinite(entity.confidence) ? entity.confidence : 0.5;
      const nodeRadius = 0.5 + (confidence * 1.5);
      const geometry = new THREE.SphereGeometry(nodeRadius, 16, 16);
      const color = new THREE.Color(getEntityColor(entity.type));
      const material = new THREE.MeshStandardMaterial({ 
        color: color,
        metalness: 0.1,
        roughness: 0.7
      });

      const node = new THREE.Mesh(geometry, material) as unknown as NodeMesh;
      node.position.copy(position);
      node.userData = {
        entity,
        originalColor: color.clone()
      };

      sceneRef.current!.add(node);
      nodesRef.current.push(node);

      // Add text label
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const context = canvas.getContext('2d')!;
      const fontSize = 64;
      context.font = `${fontSize}px Arial`;
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.fillText(entity.name, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(position);
      sprite.position.y += nodeRadius + 2;
      sprite.scale.set(8, 4, 1);

      sceneRef.current!.add(sprite);
    });

    console.log('Created nodes:', nodesRef.current.length);

    // Create edges
    filteredEdges.forEach((relationship, index) => {
      console.log(`Creating edge ${index + 1}/${filteredEdges.length}:`, relationship.relation_type);

      const sourcePos = nodePositions.get(relationship.source_id);
      const targetPos = nodePositions.get(relationship.target_id);

      if (sourcePos && targetPos) {
        const geometry = new THREE.BufferGeometry().setFromPoints([sourcePos, targetPos]);
        const material = new THREE.LineBasicMaterial({ 
          color: 0x888888,
          opacity: 0.6,
          transparent: true
        });

        const line = new THREE.Line(geometry, material) as unknown as EdgeLine;
        line.userData = { relationship };

        sceneRef.current!.add(line);
        edgesRef.current.push(line);
      } else {
        console.warn('Missing positions for edge:', {
          sourceId: relationship.source_id,
          targetId: relationship.target_id,
          hasSource: !!sourcePos,
          hasTarget: !!targetPos
        });
      }
    });

    console.log('Created edges:', edgesRef.current.length);
    console.log('Graph visualization complete');

  }, [data, selectedEntityTypes]);

  // Handle search query highlighting
  useEffect(() => {
    if (!searchQuery) {
      // Reset all nodes to original colors
      nodesRef.current.forEach(node => {
        if (node !== selectedNodeRef.current) {
          (node.material as THREE.MeshStandardMaterial).color.copy(
            node.userData.originalColor
          );
        }
      });
      return;
    }

    // Highlight matching nodes
    nodesRef.current.forEach(node => {
      const isMatch = node.userData.entity.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (node !== selectedNodeRef.current) {
        if (isMatch) {
          (node.material as THREE.MeshStandardMaterial).color.setHex(0xffffff);
        } else {
          (node.material as THREE.MeshStandardMaterial).color.copy(
            node.userData.originalColor
          );
          (node.material as THREE.MeshStandardMaterial).color.multiplyScalar(0.3);
        }
      }
    });
  }, [searchQuery]);

  // Animation loop
  useEffect(() => {
    console.log('Animation loop effect triggered');
    
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
      console.log('Missing refs for animation, waiting...');
      return;
    }

    console.log('Starting animation loop...');

    const animate = () => {
      // WSAD movement
      if (cameraRef.current) {
        const moveSpeed = keysRef.current.shift ? 2 : 0.5;
        const camera = cameraRef.current;
        
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        const up = new THREE.Vector3(0, 1, 0);

        if (keysRef.current.w) camera.position.addScaledVector(forward, moveSpeed);
        if (keysRef.current.s) camera.position.addScaledVector(forward, -moveSpeed);
        if (keysRef.current.a) camera.position.addScaledVector(right, -moveSpeed);
        if (keysRef.current.d) camera.position.addScaledVector(right, moveSpeed);
        if (keysRef.current.space) camera.position.addScaledVector(up, moveSpeed);
        if (keysRef.current.shift && !keysRef.current.space) camera.position.addScaledVector(up, -moveSpeed);
      }

      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        
        // Debug render call (only first few times)
        if (animationIdRef.current && animationIdRef.current < 5) {
          console.log('Render call:', {
            frame: animationIdRef.current,
            cameraPos: cameraRef.current.position,
            sceneChildren: sceneRef.current.children.length
          });
        }
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      console.log('Stopping animation loop...');
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isInitialized]);

  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h2>No data available</h2>
          <p>Load some graph data to see the 3D visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <GraphDataFilters />
      <div className={styles.networkContainer}>
        <div ref={mountRef} className={styles.canvas} />
        <div className={styles.controls}>
          <div className={styles.helpText}>
            <span>WSAD - Move camera</span>
            <span>Space/Shift - Up/Down</span>
            <span>Mouse - Look around</span>
            <span>Click nodes to select</span>
          </div>
        </div>
      </div>
    </div>
  );
}