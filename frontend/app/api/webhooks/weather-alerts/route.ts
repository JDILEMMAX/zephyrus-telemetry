import { NextResponse } from 'next/server';
import { eventBus } from '@/lib/eventBus';

/**
 * ARCHITECTURAL NOTE: WEBHOOK INGESTION & EVENT DELEGATION
 * --------------------------------------------------------
 * This exposed POST route acts as the ingestion mechanism for Weather-AI platform webhooks.
 * While REST API polling requires a client to perpetually 'ask' the server if anomalies exist
 * (which burns massive CPU cycles), Webhooks flip the paradigm — the server informs the application 
 * precisely when an anomaly takes place.
 * 
 * Execution Cycle:
 * 1. Proprietary Weather-AI API hits this endpoint with a payload.
 * 2. HMAC authentication ensures integrity (in production).
 * 3. The payload is instantly broadcast across our Global EventBus.
 * 4. The associated SSE (Server-Sent Events) pipeline detects the emission and pushes 
 *    the telemetry direct to active client sessions.
 */
export async function POST(request: Request) {
  try {
    // In strict production: Validate an `x-weather-ai-signature` HMAC here using environment secrets
    const body = await request.json();

    // Broadcast the decoded telemetry into the node memory space. 
    // This allows disjointed stream controllers in our architecture to instantly react.
    eventBus.emit('anomaly', {
      id: crypto.randomUUID(),
      severity: body.severity || 'critical',
      message: body.message || 'SEVERE: Anomalous weather pattern detected in your sector.',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, processed: true });
  } catch (error) {
    return NextResponse.json({ error: 'Malformed webhook synchronization' }, { status: 400 });
  }
}
