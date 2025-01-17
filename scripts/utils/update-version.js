import fs from "fs";
import packageJson from "../../package.json" assert { type: "json" };

export function updateVersion(filePath) {
  if (packageJson.version.includes("-bate")) return;

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.log(`Error reading file: ${err}`);
        return reject(err);
      }

      const escapedName = packageJson.name.replace(/\//g, "\\/");
      const regex = new RegExp(`/${escapedName}@([^/]+)/`, "g");
      const updated = data.replace(regex, `/${packageJson.name}@${packageJson.version}/`);

      fs.writeFile(filePath, updated, "utf8", (err) => {
        resolve();

        if (err) {
          return reject(err);
        }
      });
    });
  });
}
