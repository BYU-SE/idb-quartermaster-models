import { Event, WrappedStage } from "@byu-se/quartermaster";

export class Iptables extends WrappedStage {
  public allowInboudTraffic: boolean = true;
  public blockedTrafficCount = 0;

  async workOn(event: Event): Promise<void> {
    // do some work
    if (this.allowInboudTraffic) {
      await this.wrapped.accept(event);
    }
    else {
      //await this.wrapped.accept(event);
      this.blockedTrafficCount++;
      throw "fail";
    }
  }
}