export class LruCache<K, V> {
  public constructor(private readonly maxSize: number) {}

  private readonly map = new Map<K, V>();

  public get(key: K): V | undefined {
    const value = this.map.get(key);

    if (value === undefined) {
      return undefined;
    }

    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  public set(key: K, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxSize) {
      const oldestKey = this.map.keys().next().value;

      if (oldestKey !== undefined) {
        this.map.delete(oldestKey);
      }
    }

    this.map.set(key, value);
  }

  public delete(key: K): void {
    this.map.delete(key);
  }

  public clear(): void {
    this.map.clear();
  }
}
