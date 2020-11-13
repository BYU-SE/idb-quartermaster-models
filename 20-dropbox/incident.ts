/**
 * An exploration which demonstrates a website losing capacity to serve
 * clients after one of the servers fail.
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
  eventSummary, stageSummary
} from "@byu-se/quartermaster";
import { MySQLCluster, MySQLServer } from "./database"
import { Balancer } from "./balancer";
import { APIService } from "./api-service";

//database 1
//Server 1
//Server 2
//Server 3
const s1 = new MySQLServer();
const s2 = new MySQLServer();
const s3 = new MySQLServer();
const db1 = new MySQLCluster([s1, s2, s3]);

//database 2
//Server 4
//Server 5
//Server 6
const s4 = new MySQLServer();
const s5 = new MySQLServer();
const s6 = new MySQLServer();
const db2 = new MySQLCluster([s4, s5, s6]);

//balancer
const bal = new Balancer([db1, db2]);

//api service
const api = new APIService(bal);

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200; // 68% - 1000 +/- 200    97% - 1000 +/- 400     99% 1000 +/- 600 
simulation.eventsPer1000Ticks = 1000;

//Initializes the flow of events.
async function work() {
  const events = await simulation.run(api, 50000); // (destination, total events sent).
  console.log("done");
  stats.summary();
  eventSummary(events);
  stageSummary([api, bal, s2, s4]) //In output: "Overview of event time spent in stage" and "...behavior in stage", prints info of api, bal, s1, then failing server s2.
}
work();


//After setting a server's availability to 0, the server cannot service events.
function breakSQL() {
  s1.availability = 0;
  s2.availability = 0;
  s3.availability = 0;
  s4.availability = 0;
  s5.availability = 0;
  s6.availability = 0;
}
metronome.setTimeout(breakSQL, 5000);


//stats
function poll() {
  const now = metronome.now();
  const eventRate = simulation.getArrivalRate();

  stats.record("poll", {
    now, eventRate,
    s1: s1.availability,
    s2: s2.availability,
    s3: s3.availability,
    s4: s4.availability,
    s5: s5.availability,
    s6: s6.availability,
  });
}
metronome.setInterval(poll, 1000);