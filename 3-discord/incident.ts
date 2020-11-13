/**
 * Models some of the architecture of Discord during the incident
 * described in an October 2017 incident report.
 * 
 * https://discordstatus.com/incidents/qk9cdgnqnhcn
 * 
 */

import {
  simulation,
  stageSummary,
  eventSummary,
  metronome,
  stats,
} from "@byu-se/quartermaster";
import { APIService } from "./api-service";
import { RedisCluster } from "./redis";


const api = new APIService();
const redis = new RedisCluster(api);

// configuration
api.mean = api.errorMean = 400;
api.std = api.errorStd = 80;


redis.ring.forEach(instance => {
  instance.ttl = 50000;
  instance.capacity = 500;
});


// scenario
simulation.keyspaceMean = 1000;
simulation.keyspaceStd = 200;
simulation.eventsPer1000Ticks = 200;

async function work() {
  const events = await simulation.run(redis, 80000);
  console.log("done");
  stageSummary(redis.ring)
  eventSummary(events);
  stats.summary(true);
}
work();

// stats
function poll() {
  const now = metronome.now();

  const eventRate = simulation.getArrivalRate();
  const obj: any = {
    now, eventRate, apiLoad: api.concurrent, apiState: api.state
  }
  redis.ring.forEach((instance, index) => {
    const key = `redis-${index}`
    obj[key] = Object.keys(instance.getStore()).length
  })

  stats.record("poll", obj);
}
metronome.setInterval(poll, 1000);


// fail a selection of nodes
// observe ripple effect in cached data expiring at similar times
// observe a large percent of requests with extended latency
const firstFailTime = 50000;
metronome.setTimeout(() => {
  redis.failNode(0)
  redis.failNode(1)
  redis.failNode(2)
  redis.failNode(3)
  redis.failNode(4)
}, firstFailTime)


// cascading failure below (api layer)
// re-fail the nodes, introduce a fatal configuration in the api service to 
// allow the cache failure to cascade into the api layer
// stop the failure after some time, so we can demonstrate other failures
const secondFailTime = 200000;
const allowFailTime = 100000;
metronome.setTimeout(() => {
  redis.failNode(0)
  redis.failNode(1)
  redis.failNode(2)
  redis.failNode(3)
  redis.failNode(4)
}, secondFailTime)
metronome.setTimeout(() => api.maxConcurrency = 30, secondFailTime);
metronome.setTimeout(() => api.maxConcurrency = 50, secondFailTime + allowFailTime);