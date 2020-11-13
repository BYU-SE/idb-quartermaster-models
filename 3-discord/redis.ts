import { Event, LRUCache, Stage, WrappedStage } from "@byu-se/quartermaster";

/**
 * A model of the redis service.
 * 
 * 1 Master, 1 Replica
 * 
 * https://8kmiles.com/images/2014/09/ElastiCache-redis-as-a-Data-store-with-Ketama-Consistent-hashing.jpg
 */

export class RedisCluster extends WrappedStage {
  public readonly ring: RedisInstance[] = [];
  protected _killedNodes: RedisInstance[] = [];

  constructor(protected wrapped: Stage) {
    super(wrapped);

    for (let i = 0; i < 10; i++) {
      // i.e.
      // even index = master
      // odd index = replica
      this.ring.push(new RedisInstance(wrapped));
    }
  }

  // Choose a redis Intance to Serve the Request
  async workOn(event: Event): Promise<void> {
    const instance = this.sendTrafficTo(event);
    if (!instance) {
      // This should not happen, except I have seen the error "cannot call accept on undefined"
      // I've tried to trigger this bug manually quite a few times, but can't quite.
      console.error("no instances for event", event.key, "when instances are:", this.ring.map(x => !!x))
    }
    await instance.accept(event);
  }

  private sendTrafficTo(event: Event): RedisInstance {
    const index = parseInt(event.key.slice(2)) % 10;
    return this.ring[index];
  }

  /**
   * Fails an existing node by removing it from the ring
   * Spins up a new instance in its place. 
   * @param index 
   */
  public failNode(index: number) {
    const old = this.ring[index];
    const instance = new RedisInstance(this.wrapped);
    this._killedNodes.push(old);
    this.ring[index] = instance;

    instance.ttl = old.ttl;
    instance.capacity = old.capacity;
  }
}


class RedisInstance extends LRUCache { }