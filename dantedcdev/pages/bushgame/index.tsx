// pages/bushgame/index.tsx
import React, { useState, useEffect } from 'react';
// Do not import main.css here
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Point = { x: number; y: number };

type Edge = {
  id: number;
  treeId: number;
  color: 'red' | 'blue' | 'green';
  start: Point;
  end: Point;
  parentId: number | null;
  childCount: number;
  childAngles: number[];
  childrenIds: number[];
  velocity?: number;
  opacity?: number;
};

const GRAVITY = 0.5;
const GROUND_Y = 280;
const MIN_SVG_WIDTH = 800;
const MIN_SVG_HEIGHT = 600;
const BRANCH_LENGTH = 40;
const ANGLE_VARIATION = Math.PI / 4; // 45 degrees
const MIN_CHILD_ANGLE_DIFFERENCE = (10 * Math.PI) / 180; // 10 degrees in radians

const HackenbushGame: React.FC = () => {
  const [edges, setEdges] = useState<Edge[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'blue'>('red');
  const [gameOver, setGameOver] = useState(false);
  const [fallingEdges, setFallingEdges] = useState<Edge[]>([]);
  const [numEdges, setNumEdges] = useState(5);
  const [numTrees, setNumTrees] = useState(2);
  const [gameStarted, setGameStarted] = useState(false);
  const [svgSize, setSvgSize] = useState({ width: MIN_SVG_WIDTH, height: MIN_SVG_HEIGHT });
  const [treeValues, setTreeValues] = useState<{ [treeId: number]: number }>({});

  // Add this state variable
const [hoveredEdgeId, setHoveredEdgeId] = useState<number | null>(null);

// Add this function
const darkenColor = (color: string): string => {
  const darkColors: { [key: string]: string } = {
    red: '#CC0000',
    blue: '#0000CC',
    green: '#009900',
  };
  return darkColors[color] || color;
};

  const generateGraph = () => {
    let edgeId = 1;
    let remainingEdges = numEdges;

    const treeWidth = Math.max(MIN_SVG_WIDTH / numTrees, 200);
    const totalWidth = treeWidth * numTrees;
    const newSvgWidth = Math.max(MIN_SVG_WIDTH, totalWidth);
    const newEdges: Edge[] = [];

    const totalEdges = numEdges;
    let greenCount = 0;

    if (totalEdges % 2 === 1) {
      // If odd, reserve one edge for green
      greenCount = 1;
    }

    const totalRedBlueEdges = totalEdges - greenCount;

    const redCount = totalRedBlueEdges / 2;
    const blueCount = totalRedBlueEdges / 2;

    // Create color array
    let colors: ('red' | 'blue' | 'green')[] = [];
    colors = colors.concat(Array(redCount).fill('red'));
    colors = colors.concat(Array(blueCount).fill('blue'));

    // Randomly insert the green edge if it exists
    if (greenCount === 1) {
      const insertIndex = Math.floor(Math.random() * (colors.length + 1));
      colors.splice(insertIndex, 0, 'green');
    }

    // Shuffle colors
    colors = colors.sort(() => Math.random() - 0.5);
    let colorIndex = 0;

    for (let i = 0; i < numTrees && remainingEdges > 0; i++) {
      const rootX = (i + 0.5) * treeWidth;
      const edgesForTree = Math.max(1, Math.floor(remainingEdges / (numTrees - i)));
      const treeEdges = generateTree(
        edgeId,
        i, // Assign treeId as the index of the tree
        rootX,
        GROUND_Y,
        edgesForTree,
        colors.slice(colorIndex, colorIndex + edgesForTree)
      );
      newEdges.push(...treeEdges);
      edgeId += treeEdges.length;
      remainingEdges -= treeEdges.length;
      colorIndex += edgesForTree;
    }

    setSvgSize({ width: newSvgWidth, height: MIN_SVG_HEIGHT });
    setEdges(newEdges);
    setGameStarted(true);

    // Compute initial tree values
    const initialTreeValues: { [treeId: number]: number } = {};
    for (let i = 0; i < numTrees; i++) {
      const treeEdges = newEdges.filter((edge) => edge.treeId === i);
      if (treeEdges.length > 0) {
        const rootEdge = treeEdges.find((edge) => edge.parentId === null);
        if (rootEdge) {
          const value = computeTreeValue(rootEdge.id, treeEdges);
          initialTreeValues[i] = value;
        }
      }
    }
    setTreeValues(initialTreeValues);
  };

  const generateTree = (
    startId: number,
    treeId: number,
    x: number,
    y: number,
    numEdges: number,
    colors: ('red' | 'blue' | 'green')[]
  ): Edge[] => {
    const treeEdges: Edge[] = [];
    let currentId = startId;
    let edgesLeft = numEdges;

    const addEdge = (parentId: number | null, startX: number, startY: number): Edge => {
      let angle: number;
      let parentEdge: Edge | undefined;

      if (parentId !== null) {
        parentEdge = treeEdges.find((e) => e.id === parentId);
        const existingAngles = parentEdge?.childAngles || [];
        angle = generateChildAngle(existingAngles);
      } else {
        // For the root edge, pick any angle within the allowed range
        angle = Math.PI / 2;
      }

      const endX = startX + BRANCH_LENGTH * Math.cos(angle);
      const endY = startY - BRANCH_LENGTH * Math.sin(angle);

      const edge: Edge = {
        id: currentId++,
        treeId,
        color: colors[numEdges - edgesLeft],
        start: { x: startX, y: startY },
        end: { x: endX, y: endY },
        parentId,
        childCount: 0,
        childAngles: [],
        childrenIds: [],
      };
      treeEdges.push(edge);
      edgesLeft--;

      if (parentEdge) {
        parentEdge.childCount++;
        parentEdge.childAngles.push(angle);
        parentEdge.childrenIds.push(edge.id);
      }

      return edge;
    };

    const findAvailableParent = (): Edge | null => {
      return treeEdges.find((e) => e.childCount < 2) || null;
    };

    const generateChildAngle = (existingAngles: number[]): number => {
      const maxAttempts = 100;
      let attempt = 0;
      let angle: number;

      do {
        angle = (Math.PI / 2) - (Math.random() * ANGLE_VARIATION * 2 - ANGLE_VARIATION);
        attempt++;
      } while (
        existingAngles.some(
          (existingAngle) => Math.abs(angle - existingAngle) < MIN_CHILD_ANGLE_DIFFERENCE
        ) &&
        attempt < maxAttempts
      );

      return angle;
    };

    // Add root edge
    addEdge(null, x, y);

    while (edgesLeft > 0) {
      const parentEdge = findAvailableParent();
      if (parentEdge) {
        addEdge(parentEdge.id, parentEdge.end.x, parentEdge.end.y);
      } else {
        break;
      }
    }

    return treeEdges;
  };

  const resetGame = () => {
    setEdges([]);
    setCurrentPlayer('red');
    setGameOver(false);
    setFallingEdges([]);
    setGameStarted(false);
    setSvgSize({ width: MIN_SVG_WIDTH, height: MIN_SVG_HEIGHT });
    setTreeValues({});
  };

  const handleEdgeClick = (id: number) => {
    if (gameOver) return;

    const clickedEdge = edges.find((edge) => edge.id === id);
    if (clickedEdge && (clickedEdge.color === currentPlayer || clickedEdge.color === 'green')) {
      removeEdgeAndDescendants(id);
      setCurrentPlayer(currentPlayer === 'red' ? 'blue' : 'red');
    }
  };

  const removeEdgeAndDescendants = (id: number) => {
    const removedIds = new Set<number>();

    const removeRecursively = (edgeId: number) => {
      removedIds.add(edgeId);
      edges
        .filter((edge) => edge.parentId === edgeId)
        .forEach((child) => removeRecursively(child.id));
    };

    removeRecursively(id);

    const newFallingEdges = edges
      .filter((edge) => removedIds.has(edge.id))
      .map((edge) => ({ ...edge, velocity: 0, opacity: 1 }));

    setFallingEdges((prev) => [...prev, ...newFallingEdges]);
    setEdges((prevEdges) => prevEdges.filter((edge) => !removedIds.has(edge.id)));

    // Update tree values
    const affectedTreeId = edges.find((edge) => edge.id === id)?.treeId;
    if (affectedTreeId !== undefined) {
      const treeEdges = edges.filter(
        (edge) => edge.treeId === affectedTreeId && !removedIds.has(edge.id)
      );
      if (treeEdges.length > 0) {
        const rootEdge = treeEdges.find((edge) => edge.parentId === null);
        if (rootEdge) {
          const value = computeTreeValue(rootEdge.id, treeEdges);
          setTreeValues((prevValues) => ({ ...prevValues, [affectedTreeId]: value }));
        }
      } else {
        // Tree has been completely removed
        setTreeValues((prevValues) => {
          const newValues = { ...prevValues };
          delete newValues[affectedTreeId];
          return newValues;
        });
      }
    }
  };

  const computeTreeValue = (edgeId: number, treeEdges: Edge[]): number => {
    const edge = treeEdges.find((e) => e.id === edgeId);
    if (!edge) return 0;

    if (edge.childrenIds.length === 0) {
      // Leaf edge
      if (edge.color === 'blue') return 1;
      if (edge.color === 'red') return -1;
      return 0; // Green edge
    }

    const childValues = edge.childrenIds.map((childId) => computeTreeValue(childId, treeEdges));

    if (edge.color === 'blue') {
      return Math.max(...childValues) + 1;
    } else if (edge.color === 'red') {
      return Math.min(...childValues) - 1;
    } else {
      // Green edge
      // For simplicity, take the average of child values
      const sum = childValues.reduce((acc, val) => acc + val, 0);
      return sum / childValues.length;
    }
  };

  useEffect(() => {
    if (!fallingEdges.length) return;

    const animationFrame = requestAnimationFrame(() => {
      setFallingEdges((prevFallingEdges) =>
        prevFallingEdges
          .map((edge) => {
            const velocity = (edge.velocity || 0) + GRAVITY;
            const newStartY = edge.start.y + velocity;
            const newEndY = edge.end.y + velocity;

            if (newEndY >= GROUND_Y) {
              return {
                ...edge,
                start: { ...edge.start, y: GROUND_Y - (edge.end.y - edge.start.y) },
                end: { ...edge.end, y: GROUND_Y },
                velocity: 0,
                opacity: (edge.opacity || 1) - 0.1,
              };
            } else {
              return {
                ...edge,
                start: { ...edge.start, y: newStartY },
                end: { ...edge.end, y: newEndY },
                velocity,
              };
            }
          })
          .filter((edge) => (edge.opacity || 1) > 0)
      );
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [fallingEdges]);

  useEffect(() => {
    if (gameStarted && edges.length === 0) {
      setGameOver(true);
    }
  }, [edges, gameStarted]);

  return (
    <div className="App hub">
      <div className="w-full mx-auto flex flex-col items-center">
        {/* Title and subheading placed above the game/input buttons, center-aligned */}
        <h1 className="text-center text-2xl font-bold my-4">Hackenbush Game</h1>
        {gameStarted && !gameOver && (
          <div className="text-center mb-4" style={{ color: 'white' }}>
            Current Player: ({currentPlayer})
          </div>
        )}
        <Card className="w-full max-w-5xl">
          <CardContent className="h-full flex flex-col">
            {!gameStarted ? (
              <div className="space-y-4">
                <Input
                  type="number"
                  value={numEdges}
                  onChange={(e) => setNumEdges(Math.max(1, parseInt(e.target.value) || 1))}
                  placeholder="Number of edges"
                  className="bg-slate-700 text-white"
                />
                <Input
                  type="number"
                  value={numTrees}
                  onChange={(e) => setNumTrees(Math.max(1, parseInt(e.target.value) || 1))}
                  placeholder="Number of trees"
                  className="bg-slate-700 text-white"
                />
                <Button onClick={generateGraph} className="w-full">
                  Generate Game
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-grow overflow-auto w-full">
                  {/* Added overflow-x-auto to enable horizontal scrolling */}
                  <div className="overflow-x-auto">
                  <svg
    width={svgSize.width}
    height={svgSize.height + 50}
    viewBox={`0 0 ${svgSize.width} ${svgSize.height + 50}`}
  >
    {/* Ground line */}
    <line
      x1="0"
      y1={GROUND_Y}
      x2={svgSize.width}
      y2={GROUND_Y}
      stroke="white"
      strokeWidth="2"
    />

    {/* Game edges */}
    {edges.map((edge) => (
      <line
        key={edge.id}
        x1={edge.start.x}
        y1={edge.start.y}
        x2={edge.end.x}
        y2={edge.end.y}
        stroke={edge.id === hoveredEdgeId ? darkenColor(edge.color) : edge.color}
        strokeWidth="3"
        onClick={() => handleEdgeClick(edge.id)}
        onMouseEnter={() => setHoveredEdgeId(edge.id)}
        onMouseLeave={() => setHoveredEdgeId(null)}
        style={{ cursor: 'pointer' }}
      />
    ))}

    {/* Falling edges */}
    {fallingEdges.map((edge) => (
      <line
        key={`falling-${edge.id}`}
        x1={edge.start.x}
        y1={edge.start.y}
        x2={edge.end.x}
        y2={edge.end.y}
        stroke={edge.color}
        strokeWidth="3"
        opacity={edge.opacity}
      />
    ))}

    {/* Display tree values */}
    {Object.keys(treeValues).map((treeId) => {
      const treeEdges = edges.filter(
        (edge) => edge.treeId === parseInt(treeId)
      );
      if (treeEdges.length === 0) return null;

      const rootEdge = treeEdges.find((edge) => edge.parentId === null);
      if (!rootEdge) return null;

      const value = treeValues[parseInt(treeId)];

      return (
        <text
          key={`value-${treeId}`}
          x={rootEdge.start.x}
          y={GROUND_Y + 20}
          fill={value > 0 ? 'blue' : value < 0 ? 'red' : 'white'}
          textAnchor="middle"
          fontSize="2em"
        >
          {Math.abs(value).toFixed(2)}
        </text>
      );
    })}
  </svg>
                  </div>
                </div>
                {gameOver && (
                  <div className="mt-4 text-center font-bold" style={{ color: 'white' }}>
                    Game Over! {currentPlayer === 'red' ? 'Blue' : 'Red'} wins!
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        {/* Reset Game button placed under the game, center-aligned */}
        <Button onClick={resetGame} className="mt-4 w-full max-w-5xl">
          Reset Game
        </Button>
      </div>
    </div>
  );
};

export default HackenbushGame;
