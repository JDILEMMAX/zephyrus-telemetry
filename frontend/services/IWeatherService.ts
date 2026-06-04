import { CurrentWeather, Forecast, Telemetry } from '@/types/weather';

/**
 * ARCHITECTURAL NOTE: THE UNIVERSAL PORT (ADAPTER PATTERN)
 * --------------------------------------------------------
 * This guarantees that hot-swapping the backend requires ZERO changes to the React views.
 */
export interface IWeatherService {
  /**
   * ZERO-CLICK ONBOARDING: Resolves the user's geographic coordinates via Edge IP interception.
   */
  getGeoLocation(): Promise<string>;

  getCurrentWeather(location: string): Promise<CurrentWeather>;
  getForecast(location: string): Promise<Forecast>;

  /**
   * Resolves API quota tracking metrics strictly from the /v1/usage endpoint simulation.
   */
  getTelemetry(): Promise<Telemetry>;
}
