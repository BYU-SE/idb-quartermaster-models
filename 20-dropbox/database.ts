import { Stage, Event, FIFOQueue, TimedDependency } from "@byu-se/quartermaster";

export class MySQLCluster extends Stage {
  constructor(protected cluster: MySQLServer[]) {
    super();
  }

  // Serves the request
  async workOn(event: Event): Promise<void> {
    const instance = this.sendTrafficTo(event);
    await instance.accept(event);
  }

  // Choose a cluster to serve the request
  private sendTrafficTo(event: Event): MySQLServer {
    return this.cluster[Math.floor(Math.random() * this.cluster.length)];
  }
}

export class MySQLServer extends TimedDependency { //could be master or replica; irrelevant.
  constructor() {
    super();
    this.inQueue = new FIFOQueue(1, 50); //queue length; ( (Events a worker can run), (number of workers) )
  }
}