import { useEffect } from 'react';

/**
 * ============================================================================
 * ARCHITECTURAL NOTE: ENVIRONMENTAL SIMULATION ENGINE
 * ============================================================================
 * This hook is a dedicated development utility designed to cycle through all 
 * available atmospheric states. It tests the structural integrity of the 
 * Glassmorphism UI, Framer Motion physics, and dynamic accent colors without 
 * burning actual API quota.
 * 
 * EXECUTION:
 * Import this hook in `page.tsx` and pass your `setWeatherData` state dispatcher.
 * Uncomment the function call inside your component to activate the 5-second cycle.
 * ============================================================================
 */

export function useWeatherSimulator(setWeatherData: any) {
    useEffect(() => {
        const conditions = [
            { condition: 'Sunny', temp: 28, isDay: true },
            { condition: 'Clear (Night)', temp: 18, isDay: false },
            { condition: 'Partly Cloudy', temp: 22, isDay: true },
            { condition: 'Partly Cloudy (Night)', temp: 18, isDay: false },
            { condition: 'Cloudy', temp: 18, isDay: true },
            { condition: 'Mist', temp: 15, isDay: true },
            { condition: 'Drizzle', temp: 16, isDay: true },
            { condition: 'Rainy Day', temp: 15, isDay: true },
            { condition: 'Heavy Rain', temp: 13, isDay: true },
            { condition: 'Thunderstorm', temp: 12, isDay: true },
            { condition: 'Hail', temp: 3, isDay: true },
            { condition: 'Snow', temp: -2, isDay: true },
            { condition: 'Blizzard', temp: -8, isDay: true },
            { condition: 'Tornado', temp: 24, isDay: true },
            { condition: 'Windy', temp: 14, isDay: true }
        ];

        let index = 0;

        const interval = setInterval(() => {
            index = (index + 1) % conditions.length;
            setWeatherData((prev: any) => ({
                ...prev,
                condition: conditions[index].condition,
                temperature: conditions[index].temp,
                isDay: conditions[index].isDay
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, [setWeatherData]);
}
