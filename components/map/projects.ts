// Every project as a card: where it lives on the map and its thumbnail
// (public/thumbs, 320×200). Cards at the same place stack on the map.
export type Project = {
  id: string;
  title: string;
  role: string;
  href: string;
  thumb: string;
  place: string;
  lon: number;
  lat: number;
  /** Subsystem of another project: shown as a small related node around it. */
  parent?: string;
};

const JEEVY = { place: "Fort Worth, TX", lon: -97.3, lat: 32.8 };
const UMD = { place: "College Park, MD", lon: -76.9, lat: 39.0 };

export const PROJECTS: Project[] = [
  { id: "xylem", title: "Xylem AutoPilot", role: "Product & pipeline design", href: "/work/xylem-institute", thumb: "/thumbs/xylem.webp", place: "Nairobi, Kenya", lon: 36.8, lat: -1.3 },
  { id: "tgi", title: "TGI Crop Intelligence", role: "Product design, conflict-zone cropland", href: "/work/tgi", thumb: "/thumbs/tgi.webp", place: "Sudan & Syria", lon: 30.2, lat: 15.5 },
  { id: "jeevy-os", title: "Jeevy OS", role: "Aerospace fabrication OS", href: "/work/jeevy-os", thumb: "/thumbs/jeevy-os.webp", ...JEEVY },
  { id: "jeevy-tasking", title: "Tasking & CPM engine", role: "Jeevy OS", href: "/work/jeevy-os/tasking-cpm-engine", thumb: "/thumbs/jeevy-tasking.webp", ...JEEVY, parent: "jeevy-os" },
  { id: "jeevy-deliverables", title: "Deliverables map", role: "Jeevy OS", href: "/work/jeevy-os/deliverables-map-dashboard", thumb: "/thumbs/jeevy-deliverables.webp", ...JEEVY, parent: "jeevy-os" },
  { id: "jeevy-design-system", title: "Industrial design system", role: "Jeevy OS", href: "/work/jeevy-os/industrial-design-system", thumb: "/thumbs/jeevy-design-system.webp", ...JEEVY, parent: "jeevy-os" },
  { id: "jeevy-kiosk", title: "Shop kiosk", role: "Jeevy OS", href: "/work/jeevy-os/shop-kiosk-feedback", thumb: "/thumbs/jeevy-kiosk.webp", ...JEEVY, parent: "jeevy-os" },
  { id: "jeevy-materials", title: "Materials procurement", role: "Jeevy OS", href: "/work/jeevy-os/materials-procurement", thumb: "/thumbs/jeevy-materials.webp", ...JEEVY, parent: "jeevy-os" },
  { id: "jeevy-blueprint", title: "Blueprint & CAD manager", role: "Jeevy OS", href: "/work/jeevy-os/blueprint-cad-manager", thumb: "/thumbs/jeevy-blueprint.webp", ...JEEVY, parent: "jeevy-os" },
  { id: "hack4impact", title: "Hack4Impact portal", role: "Product design", href: "/work/hack4impact", thumb: "/thumbs/hack4impact.webp", ...UMD },
  { id: "terps-esports", title: "Terps Esports", role: "Creative direction", href: "/work/terps-esports", thumb: "/thumbs/terps-esports.webp", ...UMD },
  { id: "workflow", title: "Faculty dashboard", role: "UX research", href: "/work/workflow", thumb: "/thumbs/workflow.webp", ...UMD },
  { id: "transurban", title: "Transurban Express Lanes", role: "UX research", href: "/work/transurban", thumb: "/thumbs/transurban.webp", place: "Virginia", lon: -77.4, lat: 37.9 },
  { id: "marketcrunch", title: "MarketCrunch AI", role: "Product design & UXR", href: "/work/marketcrunch", thumb: "/thumbs/marketcrunch.webp", place: "San Francisco, CA", lon: -122.4, lat: 37.8 },
];
