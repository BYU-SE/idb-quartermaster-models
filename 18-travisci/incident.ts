/**
 * An exploration which demonstrates a loss of capacity to produce more
 * virtual machines after the cleanup service fails and the resources
 * for build capacity are exhausted.
 * 
 * This exploration exists to prove the design of the Virtualization 
 * and Build Service appropriately mock the architecture and problems 
 * listed in the incident report.
 * 
 */


import {
  metronome,
  simulation,
  stats,
  eventSummary,
  stageSummary,
  Timeout,
  Retry,
  FIFOQueue
} from "@byu-se/quartermaster";
import { Intake } from "./intake";
import { Virtualization } from "./virtualization";

// Drives the events' failures.
const vir = new Virtualization();

// Gives timeout to end simulation after a period of time.
const timeout = new Timeout(vir);
timeout.timeout = 150000; // times out after x ticks.

// Wraps timeout stage and resubmits events upon failure.
const retry = new Retry(timeout);

// Sends events through a queue.
const intake = new Intake(retry);

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 1000;

// Initializes the flow of events.
async function work() {
  const events = await simulation.run(intake, 30000); // (destination, total events sent).
  console.log("done");

  eventSummary(events);
  stageSummary([intake, retry, timeout, vir]);
  stats.summary(true);
}
work();

// Breaks cleanup function in Virtualization after x ticks
// After setting virtual's cleanupVM to fail, the cleanup will cause resourcesUsed to accumulate.
metronome.setTimeout(breakVir, 10000);

function breakVir() {
  vir.janitorProcessWorking = false;
}

function poll() {
  const now = metronome.now();
  const eventRate = simulation.getArrivalRate();
  const queueLength = (intake.inQueue as FIFOQueue).length();
  const availableResources = vir.getResourceUtilization();

  stats.record("poll", {
    now, eventRate, queueLength, availableResources, janitorProcessWorking: vir.janitorProcessWorking
  });
}
metronome.setInterval(poll, 1000);