import { FIFOQueue, Stage, Event, Response, metronome, normal } from "@byu-se/quartermaster";

export class S3Server extends Stage {
  public mean: number = 100;
  public errorMean: number = 100;
  public std: number = 20;
  public errorStd: number = 20;

  public availability = 0.9900;

  constructor() {
    super();
    this.inQueue = new FIFOQueue(Infinity, 50);
  }

  async workOn(event: Event): Promise<void> {
    const numPreviousFails = (event as any)["num-failures"] || 0;
    const shouldProbablyFail = numPreviousFails > 0;
    const shouldAlwaysFail = numPreviousFails > 3;

    if (shouldAlwaysFail) {
      const latency = normal(4880, 100);
      await metronome.wait(latency);
      return Promise.reject("fail");
    }

    // there is some chance of a success
    // but failing is more likely if we have failed before 
    const available = shouldProbablyFail ? (Math.random() < (this.availability / 2)) : (Math.random() < this.availability);
    if (available) {
      const latency = normal(this.mean, this.std);
      await metronome.wait(latency);
      return;
    }

    // determine exactly how long to fail for
    if (numPreviousFails > 0) {
      // second+ time failure
      const latency = normal(4800, 100);
      await metronome.wait(latency);
    } else {
      // first time failure
      const latency = normal(this.errorMean, this.errorStd);
      await metronome.wait(latency);
    }

    //if not available
    return Promise.reject("fail");
  }

  protected fail(event: Event): Response {
    if (!(event as any)["num-failures"]) {
      (event as any)["num-failures"] = 1;
    } else {
      (event as any)["num-failures"]++;
    }
    throw "fail"
  }
}