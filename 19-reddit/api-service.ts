import { Stage, Event, metronome, normal } from "@byu-se/quartermaster";

export class APIService extends Stage {
  constructor(protected wrapped: Stage) {
    super();
  }

  async workOn(event: Event): Promise<void> {
    // do some work
    const latency = normal(8, 2);
    await metronome.wait(latency);
    await this.wrapped.accept(event);
  }
}