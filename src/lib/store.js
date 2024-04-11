const fm = FileManager.iCloud();
const docs = fm.documentsDirectory();

export async function create(name, initial = {}) {
  const rootPath = fm.joinPath(docs, "fartinmartin");
  const filePath = fm.joinPath(rootPath, name + ".json");

  if (fm.fileExists(filePath)) {
    console.log(`store exists at: ${clean(filePath)}`);
    await fm.downloadFileFromiCloud(filePath);
  } else {
    if (!fm.fileExists(rootPath)) fm.createDirectory(rootPath);
    fm.writeString(filePath, JSON.stringify(initial));
    console.log(`store created at: ${clean(filePath)}`);
  }

  return {
    read: () => read(filePath),
    write: (data) => write(filePath, data),
    get: (key) => get(filePath, key),
    set: (key, value) => set(filePath, key, value),
    delete: (key) => del(filePath, key),
  };
}

function read(filePath) {
  try {
    const data = fm.readString(filePath);
    return JSON.parse(data);
  } catch (error) {
    console.error(error);
    return null;
  }
}

function write(filePath, data) {
  fm.writeString(filePath, JSON.stringify(data));
}

function get(filePath, key) {
  const data = read(filePath);
  return data[key];
}

function set(filePath, key, value) {
  const data = read(filePath);
  data[key] = value;
  write(filePath, data);
}

function del(filePath, key) {
  const data = read(filePath);
  delete data[key];
  write(filePath, data);
}

function clean(path) {
  return "Scriptable/" + path.split("Scriptable/Documents/")[1];
}
