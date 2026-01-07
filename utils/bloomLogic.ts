import * as d3 from 'd3';

// Types
interface Point {
  x: number;
  y: number;
}

// Constants for visual tuning
const SIZE = 400;
const CENTER = { x: SIZE / 2, y: SIZE / 2 };

// Interpolate color from Center (Light Pink) to Edge (Deep Magenta)
// Center: #FFD1DC, Outer: #C71585
const colorScale = d3.scaleLinear<string>()
  .domain([0, 1])
  .range(["#FFD1DC", "#C71585"]);

/**
 * Generates a closed organic curve path.
 * @param radiusBase The base radius of this layer ring.
 * @param intensity The data intensity (0-1), affects irregularity and bloom size.
 * @param index The layer index.
 * @param totalLayers Total number of layers.
 */
export const generateLayerPath = (
  radiusBase: number,
  intensity: number,
  index: number,
  totalLayers: number,
  seedOffset: number
): string => {
  // Number of points to define the curve. More points = more detail/waviness possibilities.
  const numPoints = 16 + Math.floor(index * 2);

  const points: Point[] = [];
  const angleStep = (Math.PI * 2) / numPoints;

  // The 'bloom' factor: how much the intensity expands the radius
  // Outer layers can expand more than inner layers to prevent overlap
  const expansionMax = 15 + (index * 2);
  const currentRadiusExpansion = intensity * expansionMax;

  // Irregularity: Higher intensity = more "waviness" (petals opening)
  // Low intensity = tighter circle (bud)
  const irregularity = 0.05 + (intensity * 0.15);

  for (let i = 0; i < numPoints; i++) {
    const angle = i * angleStep;

    // Pseudo-random noise based on index and angle to keep it deterministic per render but "organic"
    // We use sin/cos combos to make it loop perfectly
    const noise = (
      Math.sin(angle * 3 + seedOffset) * 0.5 +
      Math.cos(angle * 5 + index) * 0.5
    ) * irregularity * radiusBase;

    // Additional petal shaping
    const petalShape = Math.sin(angle * 7) * (intensity * 5);

    const r = radiusBase + currentRadiusExpansion + noise + petalShape;

    points.push({
      x: CENTER.x + Math.cos(angle) * r,
      y: CENTER.y + Math.sin(angle) * r
    });
  }

  // Use D3 to generate a smooth closed spline through the points
  // curveBasisClosed creates very soft, fluid shapes
  // curveCatmullRomClosed is slightly tighter but still smooth.
  const lineGenerator = d3.line<Point>()
    .x(p => p.x)
    .y(p => p.y)
    .curve(d3.curveBasisClosed);

  return lineGenerator(points) || "";
};

export const getLayerColor = (index: number, total: number): string => {
  return colorScale(index / (total - 1 || 1));
};

export const getStrokeWidth = (intensity: number): number => {
  // 1px to 3.5px based on intensity
  return 1 + (intensity * 2.5);
};

export const generateCenterOpening = (): string => {
  const r = 4; // Very small
  const points: Point[] = [];
  const numPoints = 8;
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    // A slightly vertical ellipse/irregular shape
    const rad = r + (Math.random() * 2) + (Math.abs(Math.cos(angle)) * 2);
    points.push({
      x: CENTER.x + Math.cos(angle) * rad * 0.6, // narrower width
      y: CENTER.y + Math.sin(angle) * rad * 1.2  // taller height
    });
  }
  const lineGenerator = d3.line<Point>()
    .x(p => p.x)
    .y(p => p.y)
    .curve(d3.curveBasisClosed);

  return lineGenerator(points) || "";
}
