/**
 * An exploration which demonstrates packet loss, higher latency, and network
 * congestion after clusters and their network control planes are de-scheduled 
 * and cluster management software are descheduled shortly afterward.
 * 
 * This exploration exists to prove the design of the Database, Build
 * Service, and ip-tables appropriately mock the architecture and problems 
 * listed in the incident report.
 * 
 */

import {
  metronome,
  simulation,
  stats,
  eventSummary, 
  stageSummary,
  Timeout
} from "../../src";
import { Cluster, Server } from "./database"
import { Balancer } from "./balancer";
import { Iptables } from "./ip-tables";

//database 1
//Server 1
//Server 2
//Server 3
const s1 = new Server();
const s2 = new Server();
const s3 = new Server();
const db1 = new Cluster([s1, s2, s3]);

//database 2
//Server 4
//Server 5
//Server 6
const s4 = new Server();
const s5 = new Server();
const s6 = new Server();
const db2 = new Cluster([s4, s5, s6]);

//balancer
const bal = new Balancer([db1, db2]);

//ip-tables
const ip = new Iptables(bal);

//timeout
const timeout = new Timeout(ip);
timeout.timeout = 172; // events time out after x ticks. x = 75% of mean cumulative distribution

// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200; // 68% - 1000 +/- 200    97% - 1000 +/- 400     99% 1000 +/- 600 
simulation.eventsPer1000Ticks = 1000;

//Initializes the flow of events.
async function work() {
  const events = await simulation.run(timeout, 50000); // (destination, total events sent).
  console.log("done");
  stats.summary();
  eventSummary(events);
  stageSummary([timeout, ip, bal, s1, s2, s3, s4, s5, s6]) //In output: "Overview of event time spent in stage" and "...behavior in stage", prints info of api, bal, s1, then failing server s2.
}

//After setting a server's availability to 0, the server cannot service events.
function breakServer() {
  s1.availability = 0;
  s2.availability = 0;
  s3.availability = 0;
  //s4.availability = 0;
  //s5.availability = 0;
  //s6.availability = 0;
}

//Changes availability of ip-tables stage
function puppetConfigChange() {
    ip.allowInboudTraffic = false;
}

//Reverts availability of ip-tables stage
function revertPuppetConfigChange() {
    ip.allowInboudTraffic = true;
}

//Initiates network congestion in the load balancer, i.e. cluster management software.
function balancerCapacityChange() {
    bal.queueCapacity = 5;
}

//stats
function poll() {
  const now = metronome.now();
  const eventRate = simulation.getArrivalRate();

  stats.record("poll", {
    now, eventRate,
    ip: ip.blockedTrafficCount, // Sum of events ip-tables has failed.
    s1: s1.availability,
    s2: s2.availability,
    s3: s3.availability,
    s4: s4.availability,
    s5: s5.availability,
    s6: s6.availability
  });
}

work();
metronome.setInterval(poll, 1000);
metronome.setTimeout(breakServer, 5000); // represents logical cluster de-scheduling
metronome.setTimeout(balancerCapacityChange, 10000); // represents queue backup
metronome.setTimeout(puppetConfigChange, 15000); //represents cluster management software descheduling

//TODO double check the incident report for architecture and failure accuracy.
    // replace breakServer with queue capacity? 
    // events in system - events worked on = concurrent
    // possible extras?
      // mimic BGP balancing packet transfer between databases