import { Event, metronome, normal, WrappedStage } from "@byu-se/quartermaster";

export class DashboardService extends WrappedStage {
  async workOn(event: Event): Promise<void> {
    // do some work
    const latency = normal(8, 2);
    await metronome.wait(latency);
    await this.wrapped.accept(event);
  }
}