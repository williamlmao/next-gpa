#! /usr/bin/env node

const prompt = require("prompt");
const fs = require("fs");
const {
  create,
  whichConfig,
  determineIgnoredDirectories,
  getDirectories,
} = require("./utils");

const ignoredDirectories = determineIgnoredDirectories();

const handleSetup = async () => {
  console.log("No tsconfig.json or jsconfig.json found");
  prompt.start();
  prompt.get(create, function (err, result) {
    if (err) {
      return onErr(err);
    }
    if (result.create.includes("y")) {
      prompt.get(whichConfig, function (err, result) {
        const baseConfig = {
          compilerOptions: {
            baseUrl: ".",
            paths: {},
          },
        };

        if (result.whichConfig === "ts") {
          fs.writeFileSync("./tsconfig.json", JSON.stringify(baseConfig));
        } else {
          fs.writeFileSync("./jsconfig.json", JSON.stringify(baseConfig));
        }
      });
    }
    if (result.create.includes("n")) {
      // Kill the whole process
      process.exit();
    }
  });
  function onErr(err) {
    console.log(err);
    return 1;
  }
};

const updatePathAliases = async () => {
  const directories = await getDirectories("./");
  const tsconfigExists = fs.existsSync("./tsconfig.json");
  const jsconfigExists = fs.existsSync("./jsconfig.json");
  if (!tsconfigExists && !jsconfigExists) {
    handleSetup();
    return;
  }

  let file = tsconfigExists ? "tsconfig.json" : "jsconfig.json";
  console.log(
    "Ignoring the following directories:",
    ignoredDirectories.join(", ")
  );
  fs.readFile(file, "utf-8", function (err, data) {
    if (err) throw err;
    data = JSON.parse(data);
    if (!data.compilerOptions.baseUrl) {
      data.compilerOptions.baseUrl = "./";
    }
    if (!data.compilerOptions.paths) {
      data.compilerOptions.paths = {};
    }
    directories.forEach((directory) => {
      if (
        directory !== "node_modules" &&
        !directory.includes(".") &&
        !ignoredDirectories.includes(directory)
      ) {
        data.compilerOptions.paths[`@/${directory}/*`] = [`./${directory}/*`];
        console.log(`Added path alias for ${directory}`);
      }
    });

    fs.writeFile(file, JSON.stringify(data), function (err) {
      if (err) throw err;
    });
  });
};

updatePathAliases();
