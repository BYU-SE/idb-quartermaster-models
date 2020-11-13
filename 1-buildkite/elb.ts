import { Event, Stage, metronome } from "@byu-se/quartermaster";

export type HealthCheck = (stage: Stage) => boolean;

export class ELB extends Stage {
  public sendTrafficTo: number = 0;
  public healthCheck: HealthCheck = () => true;
  constructor(protected wrapped: Stage[]) {
    super();

    metronome.setInterval(() => {
      this.checkWrappedHealth();
    }, 5000);
  }

  checkWrappedHealth(): void {
    for (let i = 0; i < this.wrapped.length; i++) {
      const healthy = this.healthCheck(this.wrapped[i]);
      if (!healthy) {
        // rotate out
        this.wrapped.splice(i, 1);
      }
    }
  }

  async workOn(event: Event): Promise<void> {
    // round robin
    if (this.wrapped.length <= 0) {
      throw "fail"
    }
    this.sendTrafficTo = (this.sendTrafficTo + 1) % this.wrapped.length;
    await this.wrapped[this.sendTrafficTo].accept(event);
  }

}