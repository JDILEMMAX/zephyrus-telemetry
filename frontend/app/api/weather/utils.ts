export async function resolveGeocode(location: string): Promise<{ lat: number, lon: number }> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`, {
      headers: {
        'User-Agent': 'Zephyrus/1.0'
      },
      next: { revalidate: 600 }
    });

    if (!res.ok) {
      console.error("Nominatim error:", res.status);
    } else {
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    }
  } catch (err) {
    console.error("Geocoding exception:", err);
  }
  
  // Fallback to Nairobi
  console.log("Geocoding failed, falling back to Nairobi.");
  return { lat: -1.2921, lon: 36.8219 };
}
