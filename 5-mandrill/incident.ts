/**
 * Models some of the architecture of Discord during the incident
 * described in an October 2017 incident report.
 * 
 * https://discordstatus.com/incidents/qk9cdgnqnhcn
 * 
 */

import {
  simulation,
  eventSummary,
  metronome,
  stats
} from "@byu-se/quartermaster";
import { Database } from "./database";
import { APIService } from "./api-service";


const postgres = new Database();
const api = new APIService(postgres);

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 200;

async function work() {
  const events = await simulation.run(api, 50000);
  console.log("done");
  eventSummary(events);
  stats.summary(true);
}
work();


// stats
function poll() {
  const now = metronome.now();

  const eventRate = simulation.getArrivalRate();
  const postgresStatus = postgres.mode;
  const eventsSent = simulation.getEventsSent();
  stats.record("poll", { now, eventRate, eventsSent, postgresStatus });

  simulation.eventsPer1000Ticks += 50;
}
metronome.setInterval(poll, 1000);