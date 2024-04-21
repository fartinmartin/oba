const fm = FileManager.iCloud();
const docs = fm.documentsDirectory();

export function join(...args: string[]) {
  return args.reduce((acc, curr) => fm.joinPath(acc, curr), "");
}

export function appPath(...args: string[]) {
  const rootPath = join(docs, "fartinmartin", "oba");
  return join(rootPath, ...args);
}

export function read<T>(filePath: string) {
  if (!fm.fileExists(filePath)) {
    console.log(`[io] file does not exist: ${clean(filePath)}`);
    return null;
  }

  try {
    const data = fm.readString(filePath);
    console.log(`[io] ${clean(filePath)}:\n${data}`);
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`[io] could not parse data: ${clean(filePath)}`);
    console.error(error);
    return null;
  }
}

export function write(filePath: string, data: any) {
  const string = JSON.stringify(data);
  fm.writeString(filePath, string);
}

export function get<T>(filePath: string, key: keyof T) {
  const data = read<T>(filePath);
  if (!data) return undefined; // TODO: throw Error?
  return data[key];
}

export function set<T>(filePath: string, key: keyof T, value: any) {
  const data = read<T>(filePath);
  if (!data) return undefined; // TODO: throw Error?
  data[key] = value;
  write(filePath, data);
}

export function del<T>(filePath: string, key: keyof T) {
  const data = read<T>(filePath);
  if (!data) return undefined; // TODO: throw Error?
  delete data[key];
  write(filePath, data);
}

export function clean(path: string) {
  return path.split("Scriptable/Documents/")[1];
}
