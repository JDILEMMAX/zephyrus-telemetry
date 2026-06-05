import { NextResponse } from 'next/server';
import { resolveGeocode } from '../utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location') || 'Seattle, USA';
  
  const coords = await resolveGeocode(location);
  if (!coords) {
    return NextResponse.json({ error: "Failed to resolve coordinates for location" }, { status: 400 });
  }

  const finalLocation = coords.name || location;

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
      console.warn(`Weather API error: ${res.status}. Returning offline fallback.`);
      return NextResponse.json({
        temperature: 0,
        condition: "Offline",
        humidity: 0,
        windSpeed: 0,
        location: location,
        feelsLike: 0,
        uvIndex: "None"
      });
    }

    const data = await res.json();
    const current = data.current || {};
    
    const conditionMap: Record<string, string> = {
      "0": "Clear", "1": "Mainly Clear", "2": "Partly Cloudy", "3": "Overcast",
      "45": "Fog", "48": "Fog", "51": "Drizzle", "53": "Drizzle", "55": "Drizzle",
      "61": "Rain", "63": "Rain", "65": "Heavy Rain", "71": "Snow", "73": "Snow", 
      "75": "Heavy Snow", "80": "Rain Showers", "81": "Rain Showers", "82": "Heavy Showers",
      "95": "Thunderstorm", "96": "Thunderstorm", "99": "Heavy Thunderstorm"
    };

    let conditionStr = conditionMap[String(current.condition_code)] || "Clear";
    const isDay = current.is_day === 1;
    
    if (!isDay && !conditionStr.includes("Night")) {
        if (conditionStr === "Clear" || conditionStr === "Mainly Clear") {
            conditionStr += " (Night)";
        } else if (conditionStr.includes("Cloudy") || conditionStr === "Overcast") {
            conditionStr += " (Night)";
        }
    }

    return NextResponse.json({
      temperature: current.temperature ?? 0,
      condition: conditionStr,
      humidity: current.humidity ?? 0,
      windSpeed: current.wind_speed ?? 0,
      location: finalLocation,
      feelsLike: current.feels_like ?? 0,
      uvIndex: current.uv_index ?? "None",
      isDay: isDay
    });
  } catch (err) {
    console.error("Live weather fetch error:", err);
    return NextResponse.json({
      temperature: 0,
      condition: "Offline",
      humidity: 0,
      windSpeed: 0,
      location: location,
      feelsLike: 0,
      uvIndex: "None",
      isDay: true
    });
  }
}
