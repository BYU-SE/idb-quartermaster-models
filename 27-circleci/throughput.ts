/**
 * This exploration exists to evaluate the throughput curve of the initial
 * (unimproved, pre-mitigation) system as we increase the number of workers
 * servicing the build queue.
 */

import {
  metronome,
  FIFOQueue,
  Retry,
  simulation,
  stats,
  stageSummary
} from "@byu-se/quartermaster";

import { Database } from "./database"
import { BuildService } from "./build-service"

const db = new Database();
const retry = new Retry(db);
const service = new BuildService(retry);
retry.attempts = 10;
service.inQueue.setNumWorkers(1);

const initialEventsInQueue = 500000;
// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = initialEventsInQueue;

async function work() {
  const events = await simulation.run(service, initialEventsInQueue);
  console.log("done");
  console.log(stats.getRecorded("poll").map(x => `${x.now},${x.buildServiceWorkers},${x.sizeChange}`).join("\n"))
  stageSummary([db, retry, service])
}
work();

// stats
let last = { queueSize: initialEventsInQueue }
let keepIncreasing = true;
function poll() {
  const queue = service.inQueue as FIFOQueue;
  const now = metronome.now();
  const queueSize = queue.length();


  /**
   * Keep increasing, unless greater than 170, in which case we just drain the
   * queue by setting the workers to 40 so we don't get stuck with low
   * throughput at the end.
   */
  let buildServiceWorkers = service.inQueue.getNumWorkers();
  if (buildServiceWorkers > 240) {
    keepIncreasing = false;
    buildServiceWorkers = 70;
  }
  if (keepIncreasing) {
    buildServiceWorkers += 4
    console.log("Upping", buildServiceWorkers)
  }
  service.inQueue.setNumWorkers(buildServiceWorkers);

  let sizeChange = (queueSize - last.queueSize) / 1;

  const obj = { now, queueSize, buildServiceWorkers, sizeChange }
  stats.record("poll", obj);
  last = obj;
}
metronome.setInterval(poll, 1000);