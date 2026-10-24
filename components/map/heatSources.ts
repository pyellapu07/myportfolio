// Where the work has happened, as heat sources on the map. Weight is how hot
// the spot burns (roughly time and depth of work there); radius is how far it
// spreads, in degrees of longitude. Taken from the case studies and About copy
// in this repo; replace with the LinkedIn experience list once it is in.
export type HeatSource = { name: string; lon: number; lat: number; weight: number; radius: number };

export const HEAT_SOURCES: HeatSource[] = [
  // NASA Harvest / Xylem Lab fieldwork across East and Southern Africa
  { name: "Nairobi, Kenya", lon: 36.8, lat: -1.3, weight: 1.0, radius: 9 },
  { name: "Tanzania", lon: 35.0, lat: -6.5, weight: 0.9, radius: 10 },
  { name: "Uganda", lon: 32.5, lat: 1.4, weight: 0.6, radius: 6 },
  { name: "Rwanda", lon: 29.9, lat: -2.0, weight: 0.5, radius: 4 },
  { name: "Zambia", lon: 27.8, lat: -13.1, weight: 0.75, radius: 9 },
  // UMD, College Park: Xylem lab, TGI, Hack4Impact, Terps Esports, workflow
  { name: "College Park, MD", lon: -76.9, lat: 39.0, weight: 1.0, radius: 9 },
  // Transurban, Northern Virginia
  { name: "Virginia", lon: -77.4, lat: 37.9, weight: 0.6, radius: 6 },
  // Jeevy Fabrication
  { name: "Fort Worth, TX", lon: -97.3, lat: 32.8, weight: 0.95, radius: 10 },
  // TGI crop intelligence: built for conflict-affected regions
  { name: "Syria", lon: 38.5, lat: 35.0, weight: 0.85, radius: 6 },
  { name: "Sudan", lon: 30.2, lat: 15.5, weight: 0.9, radius: 9 },
  // TGI partners
  { name: "Tempe, AZ (ASU)", lon: -111.9, lat: 33.4, weight: 0.55, radius: 7 },
  { name: "Seattle, WA (UW)", lon: -122.3, lat: 47.6, weight: 0.5, radius: 6 },
  // MarketCrunch AI
  { name: "San Francisco, CA", lon: -122.4, lat: 37.8, weight: 0.6, radius: 6 },
  // Where it started
  { name: "Visakhapatnam, India", lon: 83.2, lat: 17.7, weight: 0.65, radius: 7 },
  { name: "Chennai, India (SRM)", lon: 80.2, lat: 13.1, weight: 0.6, radius: 6 },
];
