/**
 * An exploration which demonstrates the queue growing and processing halting
 * after traffic exceeds 1900 events / 1000 ticks.
 * 
 * This exploration exists to prove the design of the Database and Build
 * Service appropriately mock the architecture and problems listed in the 
 * incident report.
 * 
 */

import {
  metronome,
  FIFOQueue,
  Retry,
  simulation,
  stats
} from "@byu-se/quartermaster";
import { Database } from "./database"
import { BuildService } from "./build-service"

const db = new Database();
const retry = new Retry(db);
const service = new BuildService(retry);
retry.attempts = 10;

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 1500;

async function work() {
  const events = await simulation.run(service, 50000);
  console.log("done");
  stats.summary();
}
work();

// stats
function poll() {
  const queue = service.inQueue as FIFOQueue;
  const now = metronome.now();
  const queueSize = queue.length();
  const eventRate = simulation.getArrivalRate();

  stats.record("poll", { now, queueSize, eventRate });

  simulation.eventsPer1000Ticks += 100;
}
metronome.setInterval(poll, 1000);