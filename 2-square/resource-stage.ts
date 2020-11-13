import { Event, WrappedStage, metronome } from "@byu-se/quartermaster";

export class ResourceStage extends WrappedStage {
  public concurrent: number = 0;

  // bytes used for each new event
  public memoryUsagePerEvent: number = 1000;

  // total amount of memory used
  private memoryUsed: number = 0;

  // 3GB of RAM available
  public maxMemory: number = 3e9;

  // timeout of how long the memory chunk lasts per event
  public memoryFreeIn: number = 200;

  // CPU Usage
  public cpuUsagePerEvent: number = 0.001;

  // 100% CPU available
  public maxCPU: number = 1;


  async workOn(event: Event): Promise<void> {
    // if no free memory, we can't handle the traffic
    if (!this.hasFreeMemory()) {
      throw "fail"
    }

    this.concurrent++;
    this.memoryUsed += this.memoryUsagePerEvent;
    metronome.setTimeout(() => this.memoryUsed -= this.memoryUsagePerEvent, this.memoryFreeIn)

    // if we are above CPU, we still work because of burst units, but there is jitter added
    if (this.getCPU() >= this.maxCPU) {
      await metronome.wait(Math.random() * 5 + 2);
    }

    try {
      await this.wrapped.accept(event);
    } finally {
      this.concurrent--;
    }
  }

  public hasFreeMemory(): boolean {
    return this.getMemory() + this.memoryUsagePerEvent < this.maxMemory;
  }

  public getCPU(): number {
    return this.concurrent * this.cpuUsagePerEvent + 0.00000000115 * this.memoryUsed;
  }

  public getMemory(): number {
    return this.memoryUsed;
  }
}