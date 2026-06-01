import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Line, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { animate } from "motion/react";
import {
  PatternAmpRunV1,
  PatternActorV1,
  PatternConflictV1,
  PatternTransitionV1,
  GrowthCurvePointV1
} from "../../lib/pattern-amp/contracts.ts";

const COLOR_MAP: Record<string, string> = {
  cyan: "#06b6d4",
  green: "#22c55e",
  orange: "#f97316",
  purple: "#a855f7",
  blue: "#3b82f6",
  red: "#ef4444",
  yellow: "#eab308",
  rose: "#f43f5e",
  white: "#f8fafc"
};

// Node component representing a Pattern Actor
interface PatternNodeProps {
  actor: PatternActorV1;
  selectedRound: number;
  isSelected: boolean;
  onSelect: () => void;
  growthPoints: GrowthCurvePointV1[];
  mode: "observe" | "dialogue" | "amplify";
}

const PatternNode: React.FC<PatternNodeProps> = ({
  actor,
  selectedRound,
  isSelected,
  onSelect,
  growthPoints,
  mode
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Safely find the position of the actor in the selected timeline round
  const pointsForActor = growthPoints.filter((p) => p.actorId === actor.id || (actor.id === "Memory" && p.actorId === "Memory") || (actor.id === "Evidence" && p.actorId === "Evidence"));
  const roundPoint = pointsForActor.find((p) => p.round === selectedRound) || pointsForActor[pointsForActor.length - 1];

  // Base position
  let x = actor.position3d?.x ?? 0;
  let y = actor.position3d?.y ?? 0;
  let z = actor.position3d?.z ?? 0;

  if (roundPoint && roundPoint.position3d) {
    x = roundPoint.position3d.x;
    y = roundPoint.position3d.y;
    z = roundPoint.position3d.z;
  }

  // Multiply coordinates of -1..1 to -4..4 scene size
  const scaleFactor = 4;
  const scaledPos = new THREE.Vector3(x * scaleFactor, y * scaleFactor, z * scaleFactor);

  // Keep track of the animated visual position with a ref
  const currentPosRef = useRef<THREE.Vector3>(new THREE.Vector3(scaledPos.x, scaledPos.y, scaledPos.z));

  // Animate smoothly to new position whenever coordinates change
  useEffect(() => {
    const controls = animate(
      {
        x: currentPosRef.current.x,
        y: currentPosRef.current.y,
        z: currentPosRef.current.z
      },
      {
        x: scaledPos.x,
        y: scaledPos.y,
        z: scaledPos.z
      },
      {
        type: "spring",
        stiffness: 85,
        damping: 17,
        mass: 1.1,
        onUpdate: (latest) => {
          currentPosRef.current.set(latest.x, latest.y, latest.z);
        }
      }
    );

    return () => controls.stop();
  }, [scaledPos.x, scaledPos.y, scaledPos.z]);

  // Derive size based on activation (base size between 0.25 to 0.55)
  const baseSize = 0.25 + (actor.activation * 0.35);

  // Vibration and pulsing logic
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      if (actor.tension > 0.5) {
        const intensity = (actor.tension - 0.5) * 0.15;
        groupRef.current.position.x = currentPosRef.current.x + Math.sin(time * 30 + actor.id.charCodeAt(0)) * intensity;
        groupRef.current.position.y = currentPosRef.current.y + Math.cos(time * 35) * intensity;
        groupRef.current.position.z = currentPosRef.current.z + Math.sin(time * 25) * intensity;
      } else {
        groupRef.current.position.copy(currentPosRef.current);
      }
    }

    if (meshRef.current) {
      // Subtle pulsing based on activation level
      const pulseSpeed = 2.0 + actor.activation * 3.0; // faster pulse with higher activation
      const pulseRange = 0.02 + actor.activation * 0.08; // larger range with higher activation
      const pulseScale = 1.0 + Math.sin(time * pulseSpeed + actor.id.charCodeAt(0)) * pulseRange;
      meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
  });

  const nodeColor = COLOR_MAP[actor.colorLayer || "white"] || "#a1a1aa";

  return (
    <group ref={groupRef}>
      {/* Node Mesh */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          setHovered(false);
        }}
      >
        <sphereGeometry args={[baseSize, 32, 32]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isSelected ? 0.9 : hovered ? 0.5 : 0.1}
          roughness={0.1}
          metalness={0.8}
        />

        {/* Selected Ring */}
        {isSelected && (
          <mesh>
            <ringGeometry args={[baseSize + 0.15, baseSize + 0.18, 32]} />
            <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.8} />
          </mesh>
        )}

        {/* CSS tooltips embedded in 3D */}
        {(hovered || isSelected) && (
          <Html distanceFactor={12} position={[0, baseSize + 0.3, 0]} center>
            <div className="bg-slate-900/95 border border-slate-700 rounded p-2 text-[10px] text-white whitespace-nowrap shadow-xl pointer-events-none select-none font-sans font-medium">
              <div className="font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: nodeColor }} />
                {actor.label}
              </div>
              <div>Aktivierung: {(actor.activation * 100).toFixed(0)}%</div>
              <div>Spannung: {(actor.tension * 100).toFixed(0)}%</div>
              {actor.role && <div className="text-slate-400 mt-1 max-w-[150px] overflow-hidden text-ellipsis">{actor.role}</div>}
            </div>
          </Html>
        )}
      </mesh>

      {/* Embedded Text Label */}
      <Text
        position={[0, -(baseSize + 0.3), 0]}
        fontSize={0.22}
        color={isSelected ? "#ffffff" : hovered ? "#e2e8f0" : "#94a3b8"}
        font="https://fonts.gstatic.com/s/spacegrotesk/v15/V8mDoQDjQSkFtoMM3T6r8E797F5M.woff2"
        anchorX="center"
        anchorY="middle"
      >
        {actor.label.split(" ")[0]}
      </Text>
    </group>
  );
};

// Trail Component showing historical movement
interface PatternTrailProps {
  actor: PatternActorV1;
  growthPoints: GrowthCurvePointV1[];
  selectedRound: number;
}

const PatternTrail: React.FC<PatternTrailProps> = ({ actor, growthPoints, selectedRound }) => {
  const pointsForActor = growthPoints.filter((p) => p.actorId === actor.id || (actor.id === "Memory" && p.actorId === "Memory") || (actor.id === "Evidence" && p.actorId === "Evidence"));
  
  // Get historical positions up to the selected round
  const visiblePoints = pointsForActor.filter((p) => p.round !== null && p.round <= selectedRound);

  if (visiblePoints.length < 2) return null;

  const scaleFactor = 4;
  const path = visiblePoints.map((p) => {
    const x = p.position3d?.x ?? 0;
    const y = p.position3d?.y ?? 0;
    const z = p.position3d?.z ?? 0;
    return new THREE.Vector3(x * scaleFactor, y * scaleFactor, z * scaleFactor);
  });

  const trailColor = COLOR_MAP[actor.colorLayer || "white"] || "#a1a1aa";

  return (
    <Line
      points={path}
      color={trailColor}
      lineWidth={1.5}
      transparent
      opacity={0.35}
    />
  );
};

// Axis and labeled grid bounding box
const PatternAxisGrid: React.FC = () => {
  const gridRange = 4; // Corresponding to scaled pos
  
  return (
    <group>
      {/* Dynamic bounding lines */}
      <Line
        points={[
          new THREE.Vector3(-gridRange, -gridRange, -gridRange),
          new THREE.Vector3(gridRange, -gridRange, -gridRange),
          new THREE.Vector3(gridRange, gridRange, -gridRange),
          new THREE.Vector3(-gridRange, gridRange, -gridRange),
          new THREE.Vector3(-gridRange, -gridRange, -gridRange)
        ]}
        color="#334155"
        lineWidth={1}
      />
      <Line
        points={[
          new THREE.Vector3(-gridRange, -gridRange, gridRange),
          new THREE.Vector3(gridRange, -gridRange, gridRange),
          new THREE.Vector3(gridRange, gridRange, gridRange),
          new THREE.Vector3(-gridRange, gridRange, gridRange),
          new THREE.Vector3(-gridRange, -gridRange, gridRange)
        ]}
        color="#334155"
        lineWidth={1}
      />
      {/* Connect corners */}
      {[
        [-gridRange, -gridRange],
        [gridRange, -gridRange],
        [gridRange, gridRange],
        [-gridRange, gridRange]
      ].map(([px, py], idx) => (
        <Line
          key={idx}
          points={[
            new THREE.Vector3(px, py, -gridRange),
            new THREE.Vector3(px, py, gridRange)
          ]}
          color="#334155"
          lineWidth={1}
        />
      ))}

      {/* Axis Arrows in Centre */}
      <Line
        points={[new THREE.Vector3(-gridRange, 0, 0), new THREE.Vector3(gridRange, 0, 0)]}
        color="#475569"
        lineWidth={1.5}
      />
      <Line
        points={[new THREE.Vector3(0, -gridRange, 0), new THREE.Vector3(0, gridRange, 0)]}
        color="#475569"
        lineWidth={1.5}
      />
      <Line
        points={[new THREE.Vector3(0, 0, -gridRange), new THREE.Vector3(0, 0, gridRange)]}
        color="#475569"
        lineWidth={1.5}
      />

      {/* X Axis: Handlung (Action) vs Rueckzug (Withdrawal) */}
      <Text position={[gridRange + 0.8, 0, 0]} fontSize={0.25} color="#38bdf8" anchorX="left" anchorY="middle">
        Handlung +
      </Text>
      <Text position={[-gridRange - 0.8, 0, 0]} fontSize={0.25} color="#38bdf8" anchorX="right" anchorY="middle">
        - Rueckzug
      </Text>

      {/* Y Axis: Klarheit (Clarity) vs Ambiguetaet (Ambiguity) */}
      <Text position={[0, gridRange + 0.6, 0]} fontSize={0.25} color="#e11d48" anchorX="center" anchorY="bottom">
        Klarheit +
      </Text>
      <Text position={[0, -gridRange - 0.6, 0]} fontSize={0.25} color="#e11d48" anchorX="center" anchorY="top">
        - Ambiguitaet
      </Text>

      {/* Z Axis: Naehe (Closeness) vs Grenze (Boundary) */}
      <Text position={[0, 0, gridRange + 0.8]} fontSize={0.25} color="#22c55e" anchorX="center" anchorY="middle">
        Naehe +
      </Text>
      <Text position={[0, 0, -gridRange - 0.8]} fontSize={0.25} color="#22c55e" anchorX="center" anchorY="middle">
        - Grenze
      </Text>
    </group>
  );
};

// Conflict Edge lines indicating tensions between elements
interface ConflictEdgesProps {
  conflicts: PatternConflictV1[];
  actors: PatternActorV1[];
  selectedConflictId: string | null;
  onSelectConflict: (id: string) => void;
  growthPoints: GrowthCurvePointV1[];
  selectedRound: number;
}

const ConflictEdges: React.FC<ConflictEdgesProps> = ({
  conflicts,
  actors,
  selectedConflictId,
  onSelectConflict,
  growthPoints,
  selectedRound
}) => {
  const scaleFactor = 4;

  return (
    <group>
      {conflicts.map((conf) => {
        const actorAObj = actors.find((a) => a.id === conf.actorA);
        const actorBObj = actors.find((a) => a.id === conf.actorB);

        if (!actorAObj || !actorBObj || !actorAObj.position3d || !actorBObj.position3d) return null;

        // Safely resolve the position for this specific round to synchronize with physical node movement
        const pointsForA = growthPoints.filter((p) => p.actorId === conf.actorA || (conf.actorA === "Memory" && p.actorId === "Memory") || (conf.actorA === "Evidence" && p.actorId === "Evidence"));
        const roundPointA = pointsForA.find((p) => p.round === selectedRound) || pointsForA[pointsForA.length - 1];
        let xa = actorAObj.position3d.x;
        let ya = actorAObj.position3d.y;
        let za = actorAObj.position3d.z;
        if (roundPointA && roundPointA.position3d) {
          xa = roundPointA.position3d.x;
          ya = roundPointA.position3d.y;
          za = roundPointA.position3d.z;
        }

        const pointsForB = growthPoints.filter((p) => p.actorId === conf.actorB || (conf.actorB === "Memory" && p.actorId === "Memory") || (conf.actorB === "Evidence" && p.actorId === "Evidence"));
        const roundPointB = pointsForB.find((p) => p.round === selectedRound) || pointsForB[pointsForB.length - 1];
        let xb = actorBObj.position3d.x;
        let yb = actorBObj.position3d.y;
        let zb = actorBObj.position3d.z;
        if (roundPointB && roundPointB.position3d) {
          xb = roundPointB.position3d.x;
          yb = roundPointB.position3d.y;
          zb = roundPointB.position3d.z;
        }

        const posA = new THREE.Vector3(
          xa * scaleFactor,
          ya * scaleFactor,
          za * scaleFactor
        );

        const posB = new THREE.Vector3(
          xb * scaleFactor,
          yb * scaleFactor,
          zb * scaleFactor
        );

        const isSelected = selectedConflictId === conf.id;
        const color = conf.conflictType === "contradiction" ? "#f43f5e" : "#f97316";

        // Draw connecting dashed / glowing lines for conflicts
        return (
          <group key={conf.id}>
            <Line
              points={[posA, posB]}
              color={color}
              lineWidth={isSelected ? 4 : 2.0}
              dashed={conf.conflictType === "reframe"}
              dashScale={10}
              transparent
              opacity={isSelected ? 1.0 : 0.6}
              onClick={(e) => {
                e.stopPropagation();
                onSelectConflict(conf.id);
              }}
            />
            {/* Visual Tension pulses along conflict coordinate links */}
            <mesh position={new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5)}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.9 : 0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Active Camera controller to pan to selected actors
interface CameraRigProps {
  selectedActor: PatternActorV1 | null;
}

const CameraRig: React.FC<CameraRigProps> = ({ selectedActor }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    if (selectedActor && selectedActor.position3d) {
      const scaleFactor = 4;
      const tx = selectedActor.position3d.x * scaleFactor;
      const ty = selectedActor.position3d.y * scaleFactor;
      const tz = selectedActor.position3d.z * scaleFactor;

      // Animate camera look at
      const targetPos = new THREE.Vector3(tx, ty, tz + 4);
      
      const duration = 800; // ms transition style
      const startPos = camera.position.clone();
      const startTime = performance.now();

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easeInOutQuad
        const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        camera.position.lerpVectors(startPos, targetPos, ease);
        camera.lookAt(tx, ty, tz);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [selectedActor, camera]);

  return null;
};

// Main 3D Canvas Viewport
interface PatternSpace3DProps {
  run: PatternAmpRunV1;
  selectedActorId: string | null;
  onSelectActor: (id: string | null) => void;
  selectedConflictId: string | null;
  onSelectConflict: (id: string) => void;
  selectedRound: number;
  mode: "observe" | "dialogue" | "amplify";
}

const PatternSpace3D: React.FC<PatternSpace3DProps> = ({
  run,
  selectedActorId,
  onSelectActor,
  selectedConflictId,
  onSelectConflict,
  selectedRound,
  mode
}) => {
  const actors = run.dialogue.actors;
  const conflicts = run.dialogue.conflicts;
  const growthPoints = run.growthCurves;

  const currentSelectedActor = actors.find((a) => a.id === selectedActorId) || null;

  return (
    <div className="w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative">
      {/* Visual background guide element strictly compliant with design principles */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-none">
        Mustervektor-Projektionsraum <br />
        <span className="text-slate-400">Mapping: X-Y-Z Gitter</span>
      </div>

      <Canvas
        camera={{ position: [5, 5, 8], fov: 50 }}
        shadows
        className="w-full h-full"
        onPointerDown={() => onSelectActor(null)} // Clear selection on backdrop click
      >
        <color attach="background" args={["#0a0a0b"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* 3D Axis Grid */}
        <PatternAxisGrid />

        {/* Historic Trails */}
        {actors.map((actor) => (
          <PatternTrail
            key={`trail-${actor.id}`}
            actor={actor}
            growthPoints={growthPoints}
            selectedRound={selectedRound}
          />
        ))}

        {/* Interaction nodes */}
        {actors.map((actor) => (
          <PatternNode
            key={actor.id}
            actor={actor}
            selectedRound={selectedRound}
            isSelected={selectedActorId === actor.id}
            onSelect={() => onSelectActor(actor.id)}
            growthPoints={growthPoints}
            mode={mode}
          />
        ))}

        {/* Dialogue and Tension Conflicts Connecting Lines */}
        {mode !== "observe" && (
          <ConflictEdges
            conflicts={conflicts}
            actors={actors}
            selectedConflictId={selectedConflictId}
            onSelectConflict={onSelectConflict}
            growthPoints={growthPoints}
            selectedRound={selectedRound}
          />
        )}

        {/* Camera movement handler */}
        <CameraRig selectedActor={currentSelectedActor} />

        {/* Orbital Rotator */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxDistance={15}
          minDistance={3}
        />
      </Canvas>
    </div>
  );
};

export default PatternSpace3D;
