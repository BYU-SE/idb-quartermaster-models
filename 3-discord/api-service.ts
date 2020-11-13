import { Event, FIFOQueue, metronome, Stage, TimedDependency } from "@byu-se/quartermaster";

type Status = "up" | "down";

export class APIService extends TimedDependency {
  public timeToRecover: number = 5000;
  public maxConcurrency: number = 100;

  private _state: Status = "up";
  constructor() {
    super();
    this.inQueue = new FIFOQueue(1, 35);
  }
  async workOn(event: Event): Promise<void> {
    if (this._state == "up") {
      if (this.concurrent > this.maxConcurrency) {
        const originalAvailability = this.availability;
        metronome.setTimeout(() => {
          this._state = "up"
          this.availability = originalAvailability
        }, this.timeToRecover);

        this._state = "down";
        this.availability = 0;
      }
    }

    await super.workOn(event);
  }

  public get state(): Status {
    return this._state;
  }
}