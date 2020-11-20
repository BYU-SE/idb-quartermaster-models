import { Stage, Event, FIFOQueue, TimedDependency } from "@byu-se/quartermaster";

export class PostgreSQLCluster extends Stage {
  public primaryNode: number = 0;
  public pacemakerWorking: boolean = true;
  constructor(protected cluster: PostgreSQLNode[]) {
    super();
  }

  async workOn(event: Event): Promise<void> {
    const instance = this.pacemaker();
    await instance.accept(event);
  }

  // Choose a node to serve the request
  private pacemaker(): PostgreSQLNode {
    if (this.pacemakerWorking) {
      if (this.cluster[this.primaryNode].availability < 0.995) {
        this.primaryNode = Math.floor(Math.random() * this.cluster.length);
        return this.pacemaker();
      }
    }
    return this.cluster[Math.floor(Math.random() * this.cluster.length)];
  }
}

export class PostgreSQLNode extends TimedDependency { //could be master or replica; irrelevant.
  constructor() {
    super();
    this.inQueue = new FIFOQueue(1, 50);
  }
}