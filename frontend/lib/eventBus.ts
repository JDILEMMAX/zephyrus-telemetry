import { EventEmitter } from 'events';

/**
 * ARCHITECTURAL NOTE: UNIFIED IN-MEMORY EVENT BUS
 * -----------------------------------------------
 * In a true distributed serverless architecture (e.g., AWS Lambda, Vercel Edge),
 * discrete function instances operate in isolated memory spaces natively preventing 
 * cross-process event broadcasting. A production solution mandates a centralized 
 * pub/sub integration (such as Redis Pub/Sub or Google Cloud Pub/Sub).
 * 
 * However, because the structural preview executes in a persistent, containerized 
 * Cloud Run instance (Node.js Express VM footprint), a global internal EventEmitter 
 * flawlessly bridges asynchronous ingestion webhooks with our Server-Sent Event (SSE)
 * push pipeline, executing ultra-low latency anomaly dispatches.
 */

class GlobalEventBus extends EventEmitter {}

const globalAny: any = global;

if (!globalAny.eventBus) {
  globalAny.eventBus = new GlobalEventBus();
  // We expand the default listener cap to generously accommodate heavy multi-client streams.
  globalAny.eventBus.setMaxListeners(100);
}

export const eventBus: GlobalEventBus = globalAny.eventBus;
