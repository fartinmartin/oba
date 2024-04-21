iCloud();

async function iCloud() {
  const path = process.env.DIST_PATH;
  if (!path) throw Error(`Could not find DIST_PATH in .env`);
  const file = Bun.file(`build/oba.js`);
  await Bun.write(path, file);
}
