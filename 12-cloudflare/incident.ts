/**
 * An exploration which demonstrates a web security service losing capacity to serve clients. After a defective regular expression 
 * consumes cpu resources for a web application firewall, it loses capacity to serve most requests.
 * 
 * This exploration exists to prove the design of the WebApplicationFirewall and ContentDeliveryNetwork appropriately mock the 
 * architecture and problems listed in the incident report.
 * 
 */

import {
    metronome,
    simulation,
    stats,
    eventSummary, 
    stageSummary
  } from "@byu-se/quartermaster";
  import { ContentDeliveryNetwork } from "./content-delivery-network";
  import { WebApplicationFirewall } from "./web-application-firewall";

  const cdn = new ContentDeliveryNetwork();

  const waf = new WebApplicationFirewall(cdn);

  // scenario
  simulation.keyspaceMean = 1000;
  simulation.keyspaceStd = 200;
  simulation.eventsPer1000Ticks = 1000;
  
  //Initializes the flow of events.
  async function work() {
    const events = await simulation.run(waf, 31000); // (destination, total events sent).
    console.log("done");
    stats.summary();
    eventSummary(events);
    stageSummary([waf, cdn]) 
  }
  work();
  
  // Disables excess cpu monitoring.
  function breakCPUProtection() {
    waf.protectionWorking = false;
  }
  metronome.setTimeout(breakCPUProtection, 2000);
  
  //stats
  function poll() {
    const now = metronome.now();
    const eventRate = simulation.getArrivalRate();
    const availableResources = waf.getResourceUtilization();
    const protectionOn = waf.protectionWorking;
    const networkAvailability = waf.availability;
  
    stats.record("poll", {
      now, 
      eventRate, 
      availableResources, 
      protectionOn, 
      networkAvailability
    });
  }
  metronome.setInterval(poll, 1000);