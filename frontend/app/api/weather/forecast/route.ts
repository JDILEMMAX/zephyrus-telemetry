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
    const res = await fetch(`https://api.weather-ai.co/v1/weather-geo?lat=${coords.lat}&lon=${coords.lon}`, {
      headers: {
        'Authorization': `Bearer ${process.env.WEATHER_AI_API_KEY}`
      },
      next: { revalidate: 600 }
    });

    if (res.status === 401) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    if (res.status === 429) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    if (!res.ok) {
      console.warn(`Weather API forecast error: ${res.status}`);
      return NextResponse.json({ days: [] });
    }

    const data = await res.json();
    const hourly = data.hourly || [];
    const formattedHourly = hourly.slice(0, 24).map((item: any) => ({
      time: item.time ? item.time.split('T')[1].substring(0, 5) : "00:00",
      temp: item.temperature ? Math.round(item.temperature) : 0,
      wind: item.wind_speed || 0
    }));
    
    return NextResponse.json({
      days: formattedHourly
    });
  } catch (err) {
    console.error("Live forecast fetch error:", err);
    return NextResponse.json({ days: [] });
  }
}
