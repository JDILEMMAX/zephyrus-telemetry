export interface CurrentWeather {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

export interface ForecastDay {
  date: string;
  temperature: number;
  condition: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  precipitationChance: number;
}

export interface Forecast {
  days: ForecastDay[];
  hourly: HourlyForecast[];
}

export interface Telemetry {
  quotaUsed: number;
  quotaTotal: number;
  rateLimitStatus: string;
}

export interface WeatherAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
}
