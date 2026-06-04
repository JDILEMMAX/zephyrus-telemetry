import { IWeatherService } from './IWeatherService';
import { CurrentWeather, Forecast, Telemetry } from '@/types/weather';

/**
 * ARCHITECTURAL NOTE: NEXT.JS EDGE ADAPTER & ZERO-CLICK GEO ROUTING
 * -----------------------------------------------------------------
 * The BFF adapter is expanded to incorporate Edge-level request headers to execute
 * Zero-Click Onboarding. Rather than forcing the user to type their location on first load,
 * the Vercel/Next.js edge middleware parses their CF-Connecting-IP structure.
 */
export class NextBFFAdapter implements IWeatherService {
  async getGeoLocation(): Promise<string> {
    const res = await fetch('/api/weather/geo');
    if (!res.ok) return 'Seattle, USA'; // Fallback
    const data = await res.json();
    return data.location;
  }

  async getCurrentWeather(location: string): Promise<CurrentWeather> {
    const res = await fetch(`/api/weather/current?location=${encodeURIComponent(location)}`);
    if (!res.ok) throw new Error('Failed to fetch current weather context');
    return res.json();
  }

  async getForecast(location: string): Promise<Forecast> {
    const res = await fetch(`/api/weather/forecast?location=${encodeURIComponent(location)}`);
    if (!res.ok) throw new Error('Failed to fetch forecast from BFF');
    return res.json();
  }

  async getTelemetry(): Promise<Telemetry> {
    // Strictly bound to the usage endpoint per the maximization directive
    const res = await fetch('/api/usage');
    if (!res.ok) throw new Error('Failed to fetch telemetry usage');
    return res.json();
  }
}
