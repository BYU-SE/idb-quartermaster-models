import { TimedDependency, FIFOQueue } from "@byu-se/quartermaster";

export class ContentDeliveryNetwork extends TimedDependency {
  constructor() {
    super();
    this.inQueue = new FIFOQueue(1, 200);
  }
}