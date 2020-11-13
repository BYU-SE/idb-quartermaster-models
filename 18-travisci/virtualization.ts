import { Stage, metronome, normal, FIFOQueue } from "@byu-se/quartermaster";

export class Virtualization extends Stage {
  private resourcesUsed: number = 0;
  private maxResources: number = 6000;
  public janitorProcessWorking: boolean;
  constructor() {
    super();
    this.inQueue = new FIFOQueue(Infinity, 220); //queue length ( (Events a worker can run), (number of workers) )
    this.janitorProcessWorking = true;
  }

  async workOn(): Promise<void> {
    await this.createVM();
    await this.run();
    await this.cleanup();
  }

  async createVM(): Promise<void> {
    // try to create a new VM if there is resources
    // otherwise fail immediately
    if (this.resourcesUsed >= this.maxResources)
      throw "fail";

    this.resourcesUsed++;
  }

  async run(): Promise<void> {
    const latency = normal(10000, 1000);
    await metronome.wait(latency);
  }

  async cleanup(): Promise<void> {
    // if old configuration, always deallocate resources
    // if new configuration never deallocate resources
    if (this.janitorProcessWorking) {
      this.resourcesUsed--;
    }
  }

  public getResourceUtilization() {
    return this.resourcesUsed / this.maxResources;
  }
}
