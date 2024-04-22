import * as io from "./io";

// https://github.com/evandcoleman/scriptable/blob/main/src/lib/cache.js

export default class Cache {
  fm: ReturnType<typeof FileManager.iCloud>;
  cachePath: string;
  expirationMinutes: number;

  constructor(
    public name: string,
    expirationMinutes?: number,
  ) {
    this.fm = FileManager.iCloud();
    this.cachePath = io.appPath(name);

    const ONE_WEEK = 60 * 24 * 7;
    this.expirationMinutes = expirationMinutes ?? ONE_WEEK;

    if (!this.fm.fileExists(this.cachePath)) {
      console.log(`[cache:${this.name}] creating: ${io.clean(this.cachePath)}`);
      this.fm.createDirectory(this.cachePath);
    } else {
      console.log(`[cache:${this.name}] exists: ${io.clean(this.cachePath)}`);
    }
  }

  async read(key: string, expirationMinutes?: number) {
    try {
      const path = this.fm.joinPath(this.cachePath, key);
      await this.fm.downloadFileFromiCloud(path);
      const createdAt = this.fm.creationDate(path);

      const exp = Math.min(
        expirationMinutes ?? Infinity,
        this.expirationMinutes,
      );

      const elapsed = new Date().getTime() - createdAt.getTime();
      const expInMs = exp * (10000 * 6);

      if (elapsed > expInMs) {
        console.log(`[cache:${this.name}] expired, removing: ${io.clean(path)}`); // prettier-ignore
        this.fm.remove(path);
        return null;
      }

      console.log(`[cache:${this.name}] reading from ${io.clean(path)}...`);
      const value = this.fm.readString(path);

      try {
        return JSON.parse(value);
      } catch (error) {
        return value;
      }
    } catch (error) {
      return null;
    }
  }

  write(key: string, value: any) {
    if (!value) return;

    const path = this.fm.joinPath(this.cachePath, key.replace("/", "-"));
    console.log(`[cache:${this.name}] caching to ${io.clean(path)}...`);

    if (typeof value === "string") {
      this.fm.writeString(path, value);
    } else {
      this.fm.writeString(path, JSON.stringify(value));
    }
  }
}
