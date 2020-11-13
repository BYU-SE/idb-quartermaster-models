import { Stage, Event, metronome, normal } from "@byu-se/quartermaster";
import { MySQLCluster } from "./database"

export class Balancer extends Stage {
  constructor(protected databases: MySQLCluster[]) {
    super();
  }

  async workOn(event: Event): Promise<void> {
    // Transfer some work to a random server
    const r = Math.floor(Math.random() * this.databases.length)
    await this.databases[r].accept(event);
  }
}