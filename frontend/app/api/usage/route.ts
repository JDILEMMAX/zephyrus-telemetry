import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(`https://api.weather-ai.co/v1/usage`, {
      headers: {
        'Authorization': `Bearer ${process.env.WEATHER_AI_API_KEY}`
      },
      next: { revalidate: 60 }
    });

    if (res.status === 401) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    if (res.status === 429) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    if (!res.ok) {
      console.warn(`Weather API usage error: ${res.status}`);
      return NextResponse.json({ quotaUsed: 0, quotaTotal: 0, rateLimitStatus: "Offline" });
    }

    const data = await res.json();
    return NextResponse.json({
      quotaUsed: data?.period?.requestCount ?? 0,
      quotaTotal: data?.limits?.requests ?? 5000,
      rateLimitStatus: "Aggressive Edge Deduplication Active in Next.js BFF"
    });
  } catch (err) {
    console.error("Live usage fetch error:", err);
    return NextResponse.json({ quotaUsed: 0, quotaTotal: 0, rateLimitStatus: "Offline" });
  }
}
