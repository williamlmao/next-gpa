const { readdir } = require("fs/promises");

const create = [
  {
    name: "create",
    description:
      "Would you like to create a config file? Please enter yes or no (y/n)",
    pattern: /y[es]*|n[o]?/,
    message: "Please enter yes or no (y/n)",
  },
];

const whichConfig = [
  {
    name: "whichConfig",
    description:
      "Are you using Typescript or Vanilla JS in your project? Please enter ts or js",
    pattern: /ts|js/,
    message: "Please enter ts or js",
  },
];

const determineIgnoredDirectories = () => {
  const args = process.argv.slice(2);
  let ignoredDirectories = ["node_modules", "dist", "build"];
  if (args.includes("--ignore")) {
    // Remove the first item in array and key the rest
    let ignoredDirectoryArgs = args.slice(args.indexOf("--ignore") + 1);
    ignoredDirectories = [...ignoredDirectories, ...ignoredDirectoryArgs];
  }
  return ignoredDirectories;
};

const getDirectories = async (source) =>
  (await readdir(source, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

module.exports = {
  create,
  whichConfig,
  determineIgnoredDirectories,
  getDirectories,
};
