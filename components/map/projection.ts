import { MAP_PROJECTION } from "./landGrid";

/** d3's geoNaturalEarth1 raw projection with the map's fitted transform:
 * lon/lat in degrees to px in the 1000×520 map viewBox. */
export function naturalEarth(lonDeg: number, latDeg: number): [number, number] {
  const l = (lonDeg * Math.PI) / 180;
  const p = (latDeg * Math.PI) / 180;
  const p2 = p * p, p4 = p2 * p2;
  const x = l * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)));
  const y = p * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
  return [MAP_PROJECTION.tx + MAP_PROJECTION.scale * x, MAP_PROJECTION.ty - MAP_PROJECTION.scale * y];
}
