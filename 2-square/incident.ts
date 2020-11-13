/**
 * Models some of the architecture of BuildKite during the incident
 * described in a 2016 incident report.
 * 
 * https://building.buildkite.com/outage-post-mortem-for-august-23rd-82b619a3679b
 * 
 */

import {
  simulation,
  stageSummary,
  eventSummary,
  metronome,
  stats,
  TimedDependency
} from "@byu-se/quartermaster";
import { ResourceStage } from "./resource-stage";

const timed = new TimedDependency();
const service = new ResourceStage(timed);

timed.mean = timed.errorMean = 100;
timed.std = timed.errorStd = 10;
service.maxMemory = 2e9;
service.maxCPU = 2;
service.memoryUsagePerEvent = 15000


// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 2000;

async function work() {
  const events = await simulation.run(service, 136000);
  console.log("done");
  stageSummary([service])
  eventSummary(events);
  stats.summary(true);
}
work();

metronome.setTimeout(() => service.memoryFreeIn = 1000 * 50, 4000);


// stats
function poll() {
  const now = metronome.now();

  const eventRate = simulation.getArrivalRate();
  const memoryPercent = (service.getMemory() / service.maxMemory).toFixed(4) + " %"
  stats.record("poll", { now, eventRate, concurrent: service.concurrent, cpu: service.getCPU(), memory: service.getMemory(), memoryPercent });
}
metronome.setInterval(poll, 1000);