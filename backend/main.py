import os
import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from cachetools import TTLCache, cached
from cachetools.keys import hashkey
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Zephyrus Backend Pipeline", description="Decoupled python microservice handling vast weather telemetry analytics")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WEATHER_AI_API_KEY = os.getenv("WEATHER_AI_API_KEY", "MOCK_API_KEY")
weather_cache = TTLCache(maxsize=100, ttl=600) # 10 minute TTL

async def resolve_geocode(location: str):
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"https://nominatim.openstreetmap.org/search",
                params={"q": location, "format": "json", "limit": 1},
                headers={"User-Agent": "Zephyrus/1.0"}
            )
            if res.status_code != 200:
                return None
            data = res.json()
            if data and len(data) > 0:
                return {"lat": float(data[0]["lat"]), "lon": float(data[0]["lon"])}
    except Exception as e:
        print(f"Geocoding error: {e}")
    return None

def handle_errors(res: httpx.Response):
    if res.status_code == 401:
        raise HTTPException(status_code=401, detail="Unauthorized access to telemetry API")
    if res.status_code == 429:
        raise HTTPException(status_code=429, detail="Rate limit exceeded on telemetry API")
    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail="Weather API error")

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
    if not coords:
        coords = {"lat": -1.2921, "lon": 36.8219} # Fallback to Nairobi

    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"https://api.weather-ai.co/v1/weather",
            params={"lat": coords["lat"], "lon": coords["lon"]},
            headers={"Authorization": f"Bearer {WEATHER_AI_API_KEY}"}
        )
        handle_errors(res)
        data = res.json()
        result = {
            "temperature": data.get("temperature", 23),
            "condition": data.get("condition", "Clear"),
            "humidity": data.get("humidity", 50),
            "windSpeed": data.get("windSpeed", 10),
            "location": location,
            "pressure": data.get("pressure", 1013),
            "radiation": data.get("radiation", "Normal")
        }
        weather_cache[cache_key] = result
        return result

@app.get("/api/weather/forecast")
async def get_forecast(location: str = "Seattle, USA"):
    cache_key = hashkey("forecast", location)
    if cache_key in weather_cache:
        return weather_cache[cache_key]

    coords = await resolve_geocode(location)
    if not coords:
        coords = {"lat": -1.2921, "lon": 36.8219} # Fallback to Nairobi

    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"https://api.weather-ai.co/v1/weather",
            params={"lat": coords["lat"], "lon": coords["lon"]},
            headers={"Authorization": f"Bearer {WEATHER_AI_API_KEY}"}
        )
        handle_errors(res)
        data = res.json()
        result = {"days": data.get("forecast", [])}
        weather_cache[cache_key] = result
        return result

@app.get("/api/usage")
async def get_telemetry():
    cache_key = hashkey("usage")
    if cache_key in weather_cache:
        return weather_cache[cache_key]

    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"https://api.weather-ai.co/v1/usage",
            headers={"Authorization": f"Bearer {WEATHER_AI_API_KEY}"}
        )
        handle_errors(res)
        data = res.json()
        result = {
            "quotaUsed": data.get("quotaUsed", 0),
            "quotaTotal": data.get("quotaTotal", 5000),
            "rateLimitStatus": "Aggressive Edge Deduplication Active in FastAPI"
        }
        weather_cache[cache_key] = result
        return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
