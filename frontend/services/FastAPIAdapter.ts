import { IWeatherService } from './IWeatherService';
import { CurrentWeather, Forecast, Telemetry } from '@/types/weather';

export class FastAPIAdapter implements IWeatherService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
  }

  async getGeoLocation(): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/weather/geo`);
    if (!res.ok) return 'Seattle, USA';
    const data = await res.json();
    return data.location;
  }

  async getCurrentWeather(location: string): Promise<CurrentWeather> {
    const res = await fetch(`${this.baseUrl}/api/weather/current?location=${encodeURIComponent(location)}`);
    if (!res.ok) throw new Error('Failed to fetch current weather');
    return res.json();
  }

  async getForecast(location: string): Promise<Forecast> {
    const res = await fetch(`${this.baseUrl}/api/weather/forecast?location=${encodeURIComponent(location)}`);
    if (!res.ok) throw new Error('Failed to fetch forecast');
    return res.json();
  }

  async getTelemetry(): Promise<Telemetry> {
    const res = await fetch(`${this.baseUrl}/api/usage`);
    if (!res.ok) throw new Error('Failed to fetch telemetry telemetry');
    return res.json();
  }
}
