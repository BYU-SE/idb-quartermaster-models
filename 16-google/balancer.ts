import { Event, TimedDependency, FIFOQueue } from "../../src";
import { Cluster } from "./database"

export class Balancer extends TimedDependency {
  public queueCapacity: number = 50;
  constructor(protected databases: Cluster[]) {
    super();
    this.inQueue = new FIFOQueue(1, this.queueCapacity); //queue length; ( (Events a worker can run), (number of workers) )
  }

  async workOn(event: Event): Promise<void> {
    // Transfer some work to a random server
    const r = Math.floor(Math.random() * this.databases.length)
    await this.databases[r].accept(event);
  }
}