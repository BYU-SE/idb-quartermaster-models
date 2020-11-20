/**
 * An exploration which demonstrates a website losing capacity to serve
 * clients after all the nodes fail.
 * 
 * This exploration exists to prove the design of the PostgreSQLCluster 
 * appropriately mocks the architecture and problems listed in the 
 * incident report.
 * 
 */

import {
  metronome,
  simulation,
  stats,
  eventSummary,
  stageSummary
} from "@byu-se/quartermaster";
import { PostgreSQLCluster, PostgreSQLNode } from "./cluster"
import { APIService } from "./api-service";

const n1 = new PostgreSQLNode();
const n2 = new PostgreSQLNode();
const n3 = new PostgreSQLNode();
const db = new PostgreSQLCluster([n1, n2, n3]);

const api = new APIService(db);

simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 1000;

async function work() {
  const events = await simulation.run(api, 10000);
  console.log("done");
  stats.summary();
  eventSummary(events);
  stageSummary([api, n1, n2, n3])
}
work();

//After setting a node's availability to 0, the node cannot service events.
//After setting pacemakerWorking to false, it can no longer select a new primary node.
function breakSQL() {
  n1.availability = 0;
  n2.availability = 0;
  n3.availability = 0;
  db.pacemakerWorking = false;
}
metronome.setTimeout(breakSQL, 5000);


function poll() {
  const now = metronome.now();
  const eventRate = simulation.getArrivalRate();

  stats.record("poll", {
    now, eventRate,
    n1: n1.availability,
    n2: n2.availability,
    n3: n3.availability,
    pacemakerWorking: db.pacemakerWorking
  });
}
metronome.setInterval(poll, 1000);