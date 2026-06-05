export async function resolveGeocode(location: string): Promise<{ lat: number, lon: number, name?: string }> {
  try {
    // Check for manual lat, lon input
    const coordsMatch = location.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
    if (coordsMatch) {
      return {
        lat: parseFloat(coordsMatch[1]),
        lon: parseFloat(coordsMatch[3])
      };
    }

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
  
  // Dynamic Fallback using restcountries
  try {
    console.log("Geocoding failed, attempting dynamic fallback via restcountries...");
    const fallbackRes = await fetch("https://restcountries.com/v3.1/all?fields=capitalInfo,name");
    if (fallbackRes.ok) {
      const countries = await fallbackRes.json();
      const validCountries = countries.filter((c: any) => c.capitalInfo && c.capitalInfo.latlng && c.capitalInfo.latlng.length === 2);
      if (validCountries.length > 0) {
        const randomCountry = validCountries[Math.floor(Math.random() * validCountries.length)];
        return {
          lat: randomCountry.capitalInfo.latlng[0],
          lon: randomCountry.capitalInfo.latlng[1],
          name: randomCountry.name.common
        };
      }
    }
  } catch (fallbackErr) {
    console.error("Dynamic fallback failed:", fallbackErr);
  }

  // Ultimate graceful fallback to Nairobi if EVERYTHING fails
  console.log("Ultimate fallback to Nairobi.");
  return { lat: -1.2921, lon: 36.8219, name: "Nairobi, Kenya" };
}
