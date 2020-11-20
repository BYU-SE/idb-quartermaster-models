
import { Stage, Event } from "@byu-se/quartermaster";

// Allow passage to lower level stuff normally
// when failed (no resources), then it starts rejecting all events
export class Filesystem extends Stage {

  public diskIsFull: boolean = false;

  constructor(protected wrapped: Stage) {
    super();
  }

  async workOn(event: Event): Promise<void> {
    if (this.diskIsFull) {
      throw "fail";
    }
    await this.wrapped.accept(event);
  }
}