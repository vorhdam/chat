import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "cn";
import { MapPin } from "lucide-react";
import Image from "next/image";

type Location = {
  coords: Coordinate;
  id: string;
  title: string;
  description: string;
  image: string;
  color: string;
};

const locations: Location[] = [
  {
    coords: { latitude: 47.507092, longitude: 19.045636 },
    id: "parliament",
    title: "Parliament Building",
    description:
      "Landmark Gothic Revival–style edifice with lavishly decorated rooms, plus a visitors' center.",
    image: "/assets/parliament.webp",
    color: "bg-rose-500",
  },
  {
    coords: { latitude: 47.496206, longitude: 19.039739 },
    id: "castle",
    title: "Buda Castle",
    description:
      "Palatial venue for the Hungarian National Gallery plus displays from Gothic altars to sculpture.",
    image: "/assets/castle.webp",
    color: "bg-emerald-500",
  },
  {
    coords: { latitude: 47.499211, longitude: 19.043752 },
    id: "bridge",
    title: "Széchenyi Chain Bridge",
    description:
      "Landmark 19th-century suspension bridge, designed by William Tierney Clark & illuminated at night.",
    image: "/assets/bridge.webp",
    color: "bg-sky-500",
  },
];

// START

import {
  Coordinate,
  Map,
  MapControlFullscreen,
  MapControlGroup,
  MapControlLocate,
  MapControlPitchDown,
  MapControlPitchUp,
  MapControlProjection,
  MapControlRotate,
  MapControls,
  MapControlZoomIn,
  MapControlZoomOut,
  MapCopyright,
  MapMarker,
  MapMarkerIcon,
  MapMarkerPopup,
  MapMarkers,
  MapProvider,
} from "@/components/ui/map";

export default function MapDemo() {
  return (
    <div className="aspect-video w-full">
      <MapProvider
        defaultCenter={{ latitude: 47.4979, longitude: 19.0404 }}
        defaultZoom={14}
        defaultProjection="mercator"
      >
        <Map className="rounded-xl">
          <MapControls align="bottom-right">
            <MapControlGroup>
              <MapControlZoomIn />
              <MapControlZoomOut />
            </MapControlGroup>
            <MapControlGroup>
              <MapControlPitchUp />
              <MapControlPitchDown />
              <MapControlRotate />
            </MapControlGroup>
            <MapControlGroup>
              <MapControlProjection />
              <MapControlLocate />
              <MapControlFullscreen />
            </MapControlGroup>
          </MapControls>
          <MapMarkers>
            {locations.map((l) => (
              <MapMarker key={l.id} coordinates={l.coords}>
                <MapMarkerIcon>
                  <div
                    className={cn(
                      "flex items-center justify-center relative size-6 rounded-full",
                      l.color,
                    )}
                  >
                    <MapPin className="size-5 text-white stroke-2.5" />
                  </div>
                </MapMarkerIcon>
                <MapMarkerPopup>
                  <Card className="relative mx-auto w-full min-w-2xs pt-0">
                    <div
                      className={cn(
                        "relative max-w-2xs aspect-video overflow-hidden",
                        l.color,
                      )}
                    >
                      <Image
                        width={1920}
                        height={1080}
                        src={l.image}
                        alt={l.title}
                        className="relative z-20 object-cover grayscale mix-blend-multiply m-0 rounded-none"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="font-semibold">{l.title}</CardTitle>
                      <CardDescription>{l.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button className="w-full">View</Button>
                    </CardFooter>
                  </Card>
                </MapMarkerPopup>
              </MapMarker>
            ))}
          </MapMarkers>
          <MapCopyright title="Nordaun" />
        </Map>
      </MapProvider>
    </div>
  );
}
// END

export const keywords = [
  "shadcn",
  "base ui",
  "react",
  "component",
  "map",
  "vector",
  "controls",
];
