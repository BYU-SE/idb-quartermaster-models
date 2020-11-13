import { Event, TimedDependency } from "@byu-se/quartermaster";

export class RagelParser extends TimedDependency {
  eventsWithMalformedData: number = 0.9999;
  async workOn(event: Event): Promise<void> {
    await super.workOn(event);
    if (Math.random() > this.eventsWithMalformedData) {
      (event as any)["parseError"] = true
    }
  }
}