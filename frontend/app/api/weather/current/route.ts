import { NextResponse } from 'next/server';
import { resolveGeocode } from '../utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location') || 'Seattle, USA';
  
  const coords = await resolveGeocode(location);
  if (!coords) {
    return NextResponse.json({ error: "Failed to resolve coordinates for location" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.weather-ai.co/v1/weather?lat=${coords.lat}&lon=${coords.lon}`, {
      headers: {
        'Authorization': `Bearer ${process.env.WEATHER_AI_API_KEY}`
      },
      next: { revalidate: 600 }
    });

    if (res.status === 401) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    if (res.status === 429) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

    const data = await res.json();
    
    return NextResponse.json({
      temperature: data.temperature ?? 23,
      condition: data.condition || "Clear",
      humidity: data.humidity ?? 50,
      windSpeed: data.windSpeed ?? 10,
      location: location,
      pressure: data.pressure ?? 1013,
      radiation: data.radiation || "Normal"
    });
  } catch (err) {
    console.error("Live weather fetch error:", err);
    return NextResponse.json({ error: "Internal server error fetching live weather" }, { status: 500 });
  }
}
