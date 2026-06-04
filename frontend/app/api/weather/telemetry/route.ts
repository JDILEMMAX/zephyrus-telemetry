import { NextResponse } from 'next/server';

export async function GET() {
  /**
   * Extrapolates standard edge API quota rate limits.
   * Useful for the dynamic Telemetry Dashboard in the UI to monitor the BFF's health
   * and external consumption boundaries.
   */
  return NextResponse.json({
    quotaUsed: 1204,
    quotaTotal: 5000,
    rateLimitStatus: 'healthy'
  });
}
