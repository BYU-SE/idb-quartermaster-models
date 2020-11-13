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
  simulation,
  stats,
  LRUCache,
  Timeout,
  stageSummary,
  eventSummary
} from "@byu-se/quartermaster";
import { Database } from "./database"
import { APIService } from "./api-service"


const db = new Database();
const cache = new LRUCache(db);
const apiService = new APIService(cache);
const timeOut = new Timeout(apiService);

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 1500;

async function work() {
  const events = await simulation.run(timeOut, 50000);
  const seg1Events = events.slice(0, shutdownTime / 1000 * simulation.eventsPer1000Ticks)
  const seg2Events = events.slice(shutdownTime / 1000 * simulation.eventsPer1000Ticks, rebootTime / 1000 * simulation.eventsPer1000Ticks)
  const seg3Events = events.slice(rebootTime / 1000 * simulation.eventsPer1000Ticks)

  console.log("done");
  stageSummary([db, cache, apiService]);
  eventSummary(events);
  console.log("Segment 1");
  eventSummary(seg1Events);
  console.log("Segment 2");
  eventSummary(seg2Events);
  console.log("Segment 3");
  eventSummary(seg3Events);

  stats.summary();
}
work();



function poll() {
  const now = metronome.now();

  const eventRate = simulation.getArrivalRate();
  const obj: any = {
    now,
    eventRate,
    cacheSize: Object.keys(cache.getStore()).length,
    databaseMaxConcurrency: db.inQueue.getNumWorkers(),
    actualConcurrency: db.concurrent
  }

  stats.record("poll", obj);
}
metronome.setInterval(poll, 1000);


//segment 1 runs normally tick 0 - 11,000


// segment 2 (zookeeper shuts down servers) starts at tick 11,000 - 16,000
const shutdownTime = 11000;
function zookeeperTerminated() {
  cache.clear();
  db.inQueue.setNumWorkers(0);
}
metronome.setTimeout(zookeeperTerminated, shutdownTime);



// segment 3 (caches are empty, slow site
const rebootTime = 16000;
function recover() {
  db.inQueue.setNumWorkers(300);
}
metronome.setTimeout(recover, rebootTime);