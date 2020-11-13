/**
 * This exploration exists to evaluate the fruitfulness of one of the
 * mitigations done by engineers in the incident report. They chose to improve
 * slow queries, leading to less latency in the database. 
 * 
 * With new latency improvements, throughput increases (to 2900 events / 1000 
 * ticks) before the queue length increases. Processing does not slow down.
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

// the improvements
db.latencyA = 0.05;
db.latencyB = 1.035;


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