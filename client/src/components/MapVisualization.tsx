import { useRef, useEffect } from "react";

interface MapModalProps {
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
    source: string;
    destination: string;
}

declare const L: any;

export function MapVisualization({ start, end, source, destination }: MapModalProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);

    useEffect(() => {
        if (mapRef.current && !mapInstance.current) {
            // Initialize map
            mapInstance.current = L.map(mapRef.current).setView([start.lat, start.lng], 13);

            // Add Tile Layer (OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapInstance.current);

            // Add Markers
            const startMarker = L.marker([start.lat, start.lng])
                .addTo(mapInstance.current)
                .bindPopup(`<b>Farm:</b> ${source}`)
                .openPopup();

            const endMarker = L.marker([end.lat, end.lng])
                .addTo(mapInstance.current)
                .bindPopup(`<b>Market:</b> ${destination}`);

            // Draw a line between points
            const line = L.polyline([
                [start.lat, start.lng],
                [end.lat, end.lng]
            ], { color: '#2c5e1a', weight: 4, opacity: 0.7, dashArray: '10, 10' }).addTo(mapInstance.current);

            // Fit bounds to show both points
            const group = new L.featureGroup([startMarker, endMarker, line]);
            mapInstance.current.fitBounds(group.getBounds(), { padding: [50, 50] });
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [start, end, source, destination]);

    return (
        <div className="w-full h-full rounded-lg overflow-hidden border border-border shadow-inner bg-muted/20">
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}
