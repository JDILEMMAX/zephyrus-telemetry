import os
import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from cachetools import TTLCache, cached
from cachetools.keys import hashkey
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)

app = FastAPI(title="Zephyrus Backend Pipeline", description="Decoupled python microservice handling vast weather telemetry analytics")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

WEATHER_AI_API_KEY = os.getenv("WEATHER_AI_API_KEY", "MOCK_API_KEY")
weather_cache = TTLCache(maxsize=100, ttl=600) # 10 minute TTL

import random
import re

async def resolve_geocode(location: str):
    # Check for manual lat, lon input
    coords_match = re.match(r"^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$", location)
    if coords_match:
        return {"lat": float(coords_match.group(1)), "lon": float(coords_match.group(2))}

    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"https://nominatim.openstreetmap.org/search",
                params={"q": location, "format": "json", "limit": 1},
                headers={"User-Agent": "Zephyrus/1.0"}
            )
            if res.status_code == 200:
                data = res.json()
                if data and len(data) > 0:
                    return {"lat": float(data[0]["lat"]), "lon": float(data[0]["lon"])}
    except Exception as e:
        print(f"Geocoding error: {e}")

    # Dynamic Fallback using restcountries
    try:
        async with httpx.AsyncClient() as client:
            fallback_res = await client.get("https://restcountries.com/v3.1/all?fields=capitalInfo,name", timeout=5.0)
            if fallback_res.status_code == 200:
                countries = fallback_res.json()
                valid_countries = [c for c in countries if c.get("capitalInfo", {}).get("latlng")]
                if valid_countries:
                    random_country = random.choice(valid_countries)
                    latlng = random_country["capitalInfo"]["latlng"]
                    return {"lat": latlng[0], "lon": latlng[1], "name": random_country["name"]["common"]}
    except Exception as e:
        print(f"Dynamic fallback error: {e}")

    # Ultimate graceful fallback
    return {"lat": -1.2921, "lon": 36.8219, "name": "Nairobi, Kenya"}

def handle_errors(res: httpx.Response):
    if res.status_code == 401:
        raise HTTPException(status_code=401, detail="Unauthorized access to telemetry API")
    if res.status_code == 429:
        raise HTTPException(status_code=429, detail="Rate limit exceeded on telemetry API")
    if res.status_code != 200:
        # Instead of throwing 500 which crashes the client, we raise a custom exception that we'll catch
        raise ValueError(f"Weather API error: {res.status_code}")

@app.get("/api/weather/geo")
async def get_geo(request: Request):
    ip = request.headers.get('x-forwarded-for') or request.headers.get('x-vercel-ip') or ''
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"https://api.weather-ai.co/v1/weather-geo",
                params={"ip": ip},
                headers={"Authorization": f"Bearer {WEATHER_AI_API_KEY}"}
            )
            handle_errors(res)
            data = res.json()
            return {"location": data.get("city", "Unknown")}
    except httpx.RequestError:
        city = request.headers.get('x-vercel-ip-city')
        country = request.headers.get('x-vercel-ip-country')
        if city and country:
            return {"location": f"{city}, {country}"}
        return {"location": "Unknown"}

@app.get("/api/weather/current")
async def get_current_weather(location: str = "Seattle, USA"):
    cache_key = hashkey("current", location)
    if cache_key in weather_cache:
        return weather_cache[cache_key]

    coords = await resolve_geocode(location)
    final_location = coords.get("name") or location

    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"https://api.weather-ai.co/v1/weather-geo",
                params={"lat": coords["lat"], "lon": coords["lon"]},
                headers={"Authorization": f"Bearer {WEATHER_AI_API_KEY}"}
            )
            handle_errors(res)
            data = res.json()
            current = data.get("current", {})
            
            code = str(current.get("condition_code", "0"))
            condition_map = {
                "0": "Clear", "1": "Mainly Clear", "2": "Partly Cloudy", "3": "Overcast",
                "45": "Fog", "48": "Fog", "51": "Drizzle", "53": "Drizzle", "55": "Drizzle",
                "61": "Rain", "63": "Rain", "65": "Heavy Rain", "71": "Snow", "73": "Snow", 
                "75": "Heavy Snow", "80": "Rain Showers", "81": "Rain Showers", "82": "Heavy Showers",
                "95": "Thunderstorm", "96": "Thunderstorm", "99": "Heavy Thunderstorm"
            }
            
            condition_str = condition_map.get(code, "Clear")
            is_day = current.get("is_day", 1)
            if is_day == 0 and "Night" not in condition_str:
                if condition_str in ["Clear", "Mainly Clear"] or "Cloudy" in condition_str or condition_str == "Overcast":
                    condition_str += " (Night)"
            
            result = {
                "temperature": current.get("temperature", 0),
                "condition": condition_str,
                "humidity": current.get("humidity", 0),
                "windSpeed": current.get("wind_speed", 0),
                "location": final_location,
                "feelsLike": current.get("feels_like", 0),
                "uvIndex": current.get("uv_index", "None"),
                "isDay": is_day == 1
            }
            weather_cache[cache_key] = result
            return result
    except Exception as e:
        print(f"Weather API Offline: {e}")
        # Graceful Offline Fallback
        return {
            "temperature": 0,
            "condition": "Offline",
            "humidity": 0,
            "windSpeed": 0,
            "location": "Offline",
            "feelsLike": 0,
            "uvIndex": "None",
            "isDay": True
        }

@app.get("/api/weather/forecast")
async def get_forecast(location: str = "Seattle, USA"):
    cache_key = hashkey("forecast", location)
    if cache_key in weather_cache:
        return weather_cache[cache_key]

    coords = await resolve_geocode(location)

    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"https://api.weather-ai.co/v1/weather-geo",
                params={"lat": coords["lat"], "lon": coords["lon"]},
                headers={"Authorization": f"Bearer {WEATHER_AI_API_KEY}"}
            )
            handle_errors(res)
            data = res.json()
            hourly = data.get("hourly", [])
            formatted_hourly = []
            for item in hourly[:24]:
                formatted_hourly.append({
                    "time": item.get("time", "00:00").split("T")[-1],
                    "temp": item.get("temperature", 0),
                    "wind": item.get("wind_speed", 0)
                })
            result = {"days": formatted_hourly}
            weather_cache[cache_key] = result
            return result
    except Exception as e:
        print(f"Weather API Offline: {e}")
        return {"days": []}

@app.get("/api/usage")
async def get_telemetry():
    cache_key = hashkey("usage")
    if cache_key in weather_cache:
        return weather_cache[cache_key]

    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"https://api.weather-ai.co/v1/usage",
                headers={"Authorization": f"Bearer {WEATHER_AI_API_KEY}"}
            )
            handle_errors(res)
            data = res.json()
            result = {
                "quotaUsed": data.get("period", {}).get("requestCount", 0),
                "quotaTotal": data.get("limits", {}).get("requests", 5000),
                "rateLimitStatus": "Aggressive Edge Deduplication Active in FastAPI"
            }
            weather_cache[cache_key] = result
            return result
    except Exception as e:
        print(f"Usage API Offline: {e}")
        return {
            "quotaUsed": 0,
            "quotaTotal": 0,
            "rateLimitStatus": "Offline"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
