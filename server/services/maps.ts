import axios from "axios";

export interface RouteData {
    distance: string;
    duration: string;
    source: string;
    destination: string;
    coordinates?: {
        start: { lat: number; lng: number };
        end: { lat: number; lng: number };
    };
}

export class MapsService {
    private static readonly GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

    static async getRoute(source: string, destination: string): Promise<RouteData> {
        if (this.GOOGLE_KEY && this.GOOGLE_KEY !== "your_api_key_here") {
            try {
                return await this.getGoogleRoute(source, destination);
            } catch (e) {
                console.warn("Google Maps failed, falling back to OpenStreetMap.");
            }
        }

        try {
            return await this.getOpenRoute(source, destination);
        } catch (error: any) {
            console.error("Free Routing API failed:", error.message);
            return this.getMockRoute(source, destination);
        }
    }

    private static async getGoogleRoute(source: string, destination: string): Promise<RouteData> {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&key=${this.GOOGLE_KEY}`;
        const response = await axios.get(url);
        if (response.data.status !== "OK") throw new Error(response.data.status);
        const route = response.data.routes[0].legs[0];
        return {
            distance: route.distance.text,
            duration: route.duration.text,
            source: route.start_address,
            destination: route.end_address,
            coordinates: {
                start: { lat: route.start_location.lat, lng: route.start_location.lng },
                end: { lat: route.end_location.lat, lng: route.end_location.lng }
            }
        };
    }

    private static async getOpenRoute(source: string, destination: string): Promise<RouteData> {
        const startCoord = await this.geocode(source);
        const endCoord = await this.geocode(destination);

        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoord.lng},${startCoord.lat};${endCoord.lng},${endCoord.lat}?overview=false`;
        const response = await axios.get(osrmUrl);

        if (response.data.code !== "Ok") throw new Error("OSRM Routing failed");

        const route = response.data.routes[0];
        return {
            distance: `${(route.distance / 1000).toFixed(1)} km`,
            duration: `${Math.round(route.duration / 60)} mins`,
            source: startCoord.display_name,
            destination: endCoord.display_name,
            coordinates: {
                start: { lat: startCoord.lat, lng: startCoord.lng },
                end: { lat: endCoord.lat, lng: endCoord.lng }
            }
        };
    }

    private static async geocode(query: string) {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        const response = await axios.get(url, { headers: { 'User-Agent': 'AgriLogix-App' } });
        if (!response.data || response.data.length === 0) throw new Error("Location not found");
        return {
            lat: parseFloat(response.data[0].lat),
            lng: parseFloat(response.data[0].lon),
            display_name: response.data[0].display_name.split(',')[0],
        };
    }

    private static getMockRoute(source: string, destination: string): RouteData {
        return {
            distance: "15.0 km",
            duration: "25 mins",
            source: source || "Default Farm",
            destination: destination || "Default Market",
            coordinates: {
                start: { lat: 40.7128, lng: -74.0060 }, // NYC
                end: { lat: 40.7306, lng: -73.9352 }   // Brooklyn
            }
        };
    }
}
