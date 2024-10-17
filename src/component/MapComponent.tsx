import React, { useRef, useState } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import green from "../assets/green.svg";
import white from "../assets/white.svg";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const center = {
  lat: -1.9421551,
  lng: 29.2210072,
};

interface Location {
  count: number;
  location: {
    coordinates?: {
      lat: number;
      lng: number;
    };
    name: string;
  };
}

interface MapComponentProps {
  locations: Location[];
}

const MapComponent: React.FC<MapComponentProps> = ({ locations = [] }) => {
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerClustererRef = useRef<MarkerClusterer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setLoading(false);

    if (locations.length > 0) {
      const markers = locations
        .filter(
          (district) =>
            district.location.coordinates?.lat &&
            district.location.coordinates?.lng
        )
        .map((district) => {
          const marker = new google.maps.Marker({
            position: {
              lat: district.location.coordinates!.lat,
              lng: district.location.coordinates!.lng,
            },
            icon: {
              url: green,
              scaledSize: new google.maps.Size(50, 50),
            },
            label: {
              text: district.count.toString(),
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
            },
            title: district.location.name,
          });

          marker.addListener("mouseover", () => {
            marker.setIcon({
              url: white,
              scaledSize: new google.maps.Size(50, 50),
            });
            marker.setLabel({
              text: district.count.toString(),
              color: "green",
              fontSize: "16px",
              fontWeight: "bold",
            });
            if (infoWindowRef.current) {
              infoWindowRef.current.close();
            }
          });
          return marker;
        });

      markerClustererRef.current = new MarkerClusterer({ map, markers });
    }
  };

  const onUnmount = () => {
    markerClustererRef.current?.setMap(null);
    mapRef.current = null;
  };

  return (
    <div style={containerStyle}>
      {loading && <div className="loading-indicator">Loading map...</div>}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={8}
        onLoad={onLoad}
        onUnmount={onUnmount}
      />
    </div>
  );
};

export default MapComponent;
