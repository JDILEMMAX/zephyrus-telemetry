import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-vercel-ip') || '';
  
  try {
    const res = await fetch(`https://api.weather-ai.co/v1/weather-geo?ip=${encodeURIComponent(ip)}`, {
      headers: {
        'Authorization': `Bearer ${process.env.WEATHER_AI_API_KEY}`
      },
      next: { revalidate: 600 }
    });

    if (res.status === 401) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    if (res.status === 429) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    if (!res.ok) throw new Error(`Weather API geo error: ${res.status}`);

    const data = await res.json();
    return NextResponse.json({ location: data.city || 'Unknown' });
  } catch (err) {
    console.error("Live geo fetch error:", err);
    const city = request.headers.get('x-vercel-ip-city');
    const country = request.headers.get('x-vercel-ip-country');
    if (city && country) {
      return NextResponse.json({ location: `${city}, ${country}` });
    }
    return NextResponse.json({ location: 'Unknown' });
  }
}
