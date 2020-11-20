/**
 * An exploration which demonstrates an increase in retry failures of request writes to
 * a server and a disk becoming full which causes the Tarsnap service to reject events.
 * 
 * This exploration exists to prove the design of the Filesystem and Server 
 * appropriately mock the architecture and problems listed in the incident report.
 */

import {
  metronome,
  simulation,
  stats,
  eventSummary,
  stageSummary,
  Retry,
} from "@byu-se/quartermaster";
import { S3Server } from "./server";
import { Filesystem } from "./filesystem";
import { APIService } from "./api";

const S3 = new S3Server();

const retry = new Retry(S3);
retry.attempts = 5;

const fs = new Filesystem(retry);

const api = new APIService(fs);

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 1000;

// Initializes the flow of events.
async function work() {
  const events = await simulation.run(api, 30000);
  const pre = events.slice(0, 5000 * simulation.eventsPer1000Ticks / 1000);
  const post = events.slice(5000 * simulation.eventsPer1000Ticks / 1000);

  console.log("Pre:");
  eventSummary(pre);
  console.log("Post:");
  eventSummary(post);

  console.log("done");
  eventSummary(events);
  stageSummary([api, fs, retry, S3]);
  stats.summary(true);
}

function fileSystemCleanupJobFailed() {
  fs.diskIsFull = true;
}

function poll() {
  const now = metronome.now();
  const eventRate = simulation.getArrivalRate();
  const FSDiskIsFull = fs.diskIsFull;
  stats.record("poll", {
    now, eventRate, FSDiskIsFull
  });
}

work();
metronome.setInterval(poll, 1000);
metronome.setTimeout(fileSystemCleanupJobFailed, 5000);