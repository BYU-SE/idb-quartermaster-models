import { Stage, FIFOQueue, Event, metronome, normal, exponential } from "@byu-se/quartermaster";
export class Database extends Stage {
  public concurrent: number = 0;
  public mean: number = 12;
  public std: number = 3;

  public availability = 0.9995;

  constructor() {
    super();
    this.inQueue = new FIFOQueue(1, 65);
  }

  public get cpu(): number {
    return this.concurrent / this.inQueue.getNumWorkers();
  }

  async workOn(event: Event): Promise<void> {
    this.concurrent++;

    const latency = normal(this.mean, this.std);
    await metronome.wait(latency);

    if (Math.random() > this.availability) {
      this.concurrent--;
      throw "fail";
    }

    this.concurrent--;
  }
}