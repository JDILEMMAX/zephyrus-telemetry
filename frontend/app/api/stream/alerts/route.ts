import { eventBus } from '@/lib/eventBus';

// Ensure standard dynamic execution for persistent streaming
export const dynamic = 'force-dynamic';

/**
 * ARCHITECTURAL NOTE: SERVER-SENT EVENTS (SSE) DOWNSTREAM PIPELINE
 * ----------------------------------------------------------------
 * This GET route establishes a persistent, unidirectional TCP connection directly to the client view layer.
 * 
 * Unlike standard Request/Response architecture, the socket remains open. 
 * When the accompanying API layer (`/api/webhooks/weather-alerts`) fires an EventBus emission, 
 * this controller captures it, json-encodes the payload, and flashes it straight down the 
 * pipe into the React context. The ultimate result is real-time anomaly rendering instantly.
 */
export async function GET(request: Request) {
  const { signal } = request;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial Handshake Context
      controller.enqueue(encoder.encode('data: {"status": "connected"}\n\n'));

      // 2. Event Listener logic bounds to the Global EventBus bridging our webhook ingress.
      const onAlert = (payload: any) => {
        const data = JSON.stringify(payload);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      eventBus.on('anomaly', onAlert);

      // 3. Heartbeat cycle to prevent standard browser idle-timeouts from severing the socket
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat telemetry pulse\n\n'));
      }, 25000);

      // 4. Client Disconnect Cleanup Execution
      signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        eventBus.off('anomaly', onAlert);
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
