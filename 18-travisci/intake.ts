import { Event, FIFOQueue, Stage } from "@byu-se/quartermaster";

export class Intake extends Stage {
  constructor(protected wrapped: Stage) {
    super();
    this.inQueue = new FIFOQueue(Infinity, 100); //queue length; ( (Events a worker can run), (number of workers) )
  }

  async workOn(event: Event): Promise<void> {
    // Do some work, latency is built in with queue.
    await this.wrapped.accept(event);
  }
}