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
  Timeout,
  eventSummary,
  metronome,
  stats
} from "@byu-se/quartermaster";
import { ELB } from "./elb"
import { Database } from "./database"
import { DashboardService } from "./dashboard-service"

const database = new Database();
const service1 = new DashboardService(database);
const service2 = new DashboardService(database);
const service3 = new DashboardService(database);
const service4 = new DashboardService(database);
const balancer = new ELB([service1, service2, service3, service4])
const timeout = new Timeout(balancer);

balancer.healthCheck = () => database.cpu > 0.98;
// ensure that requests aren't pending forever and simulation ends
timeout.timeout = 1000;


// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 4000;

async function work() {
  const events = await simulation.run(timeout, 160000);
  console.log("done");
  stageSummary([timeout, balancer, service1, service2, service3, service4, database])
  eventSummary(events);
  stats.summary();
}
work();

// stats

function poll() {
  const now = metronome.now();

  const eventRate = simulation.getArrivalRate();
  stats.record("poll", { now, eventRate, concurrent: database.concurrent, cpu: database.cpu, dashboardInstances: balancer["wrapped"].length });

  simulation.eventsPer1000Ticks += 100;
}
metronome.setInterval(poll, 1000);