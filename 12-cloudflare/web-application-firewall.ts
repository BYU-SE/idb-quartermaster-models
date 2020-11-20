import { Stage, Event, metronome, normal, FIFOQueue } from "@byu-se/quartermaster";

export class WebApplicationFirewall extends Stage {
  private resourcesUsed: number = 0;
  private maxResources: number = 5000;
  public protectionWorking: boolean;
  public availability: number = 0.995;
  constructor(protected wrapped: Stage) {
    super();
    this.inQueue = new FIFOQueue(1, 200);
    this.protectionWorking = true;
  }

  async workOn(event: Event): Promise<void> {
    const latency = normal(8, 2);
    await metronome.wait(latency);
    if (this.resourcesUsed >= this.maxResources)
      this.availability = 0.20;
    const available = Math.random() < this.availability;
    if (available) {
      this.resourcesUsed++;
      await this.RegularExpression();
      await this.wrapped.accept(event);
      this.resourcesUsed--;
    }
    else
      throw "fail";
  }

  // A function that runs when incident conditions change and enable the defective regex to consume cpu memory.
  // Runs when protectionWorking is false and stops running when resourcesUsed reaches limit.
  async RegularExpression(): Promise<void> {
    if (!this.protectionWorking && !(this.resourcesUsed >= this.maxResources))
      this.resourcesUsed += 2;
  }

  public getResourceUtilization() {
    return this.maxResources - this.resourcesUsed;
  }
}