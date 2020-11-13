import { Stage, FIFOQueue, Event, metronome, normal } from "@byu-se/quartermaster";

export class BuildService extends Stage {
  constructor(protected wrapped: Stage) {
    super();
    this.inQueue = new FIFOQueue(Infinity, 220);
  }

  async workOn(event: Event): Promise<void> {
    // do some work
    const latency = normal(8, 2);
    await metronome.wait(latency);
    await this.wrapped.accept(event);
  }
}