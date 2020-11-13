import { Stage, Event, FIFOQueue, TimedDependency } from "../../src";

export class Cluster extends Stage {
  constructor(protected cluster: Server[]) {
    super();
  }

  // Serves the request
  async workOn(event: Event): Promise<void> {
    const instance = this.networkControl();
    await instance.accept(event);
  }

  // Choose a cluster to serve the request
  private networkControl(): Server {
    return this.cluster[Math.floor(Math.random() * this.cluster.length)];
  }
}

export class Server extends TimedDependency { //could be master or replica; irrelevant.
  constructor() {
    super();
    this.inQueue = new FIFOQueue(1, 50); //queue length; ( (Events a worker can run), (number of workers) )
  }
}