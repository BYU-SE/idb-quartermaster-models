import { Event, metronome, TimedDependency } from "@byu-se/quartermaster";

export type Mode = "running" | "safety-shutdown"
export class Database extends TimedDependency {
  public maxXID: number = 1000;
  private timeBetweenVacuums: number = 1000;
  private _xid: number = 0;
  private _mode: Mode = "running"

  constructor() {
    super();
    metronome.setInterval(() => this.autoVacuum(), this.timeBetweenVacuums)
  }


  async workOn(event: Event): Promise<void> {
    if (this._mode === "safety-shutdown")
      throw "fail";

    // fail if the xid ever reaches the max value
    this._xid++;
    if (this._xid > this.maxXID) {
      this._mode = "safety-shutdown";
    }

    await super.workOn(event);
  }

  private autoVacuum() {
    this._xid = 0;
  }

  public get mode(): Mode {
    return this._mode;
  }

}