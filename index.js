const readline = require("readline");
const yargs = require("yargs");
const FileSystem = require("./src/FileSystem");
const CommandProcessor = require("./src/CommandProcessor");

const fileSystem = new FileSystem();

// Create a readline interface to read user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Parse command-line arguments using yargs
const saveState = yargs.option("save_state", {
  describe: "Specify whether to save state",
  type: "boolean",
  default: false,
}).argv;

const loadState = yargs.option("load_state", {
  describe: "Specify whether to load state",
  type: "boolean",
  default: false,
}).argv;

const path = yargs.option("path", {
  describe: "Specify the path",
  type: "string",
  default: false,
}).argv;

// Extract parsed options
const saveStateParsed = saveState.save_state;
const loadStateParsed = loadState.load_state;
const pathParsed = path.path;

// Create an instance of the CommandProcessor with the file system, path, and save state options
const commandProcessor = new CommandProcessor(
  fileSystem,
  pathParsed,
  saveStateParsed
);

console.log("Welcome to the In-Memory File System!");
console.log("Type your commands below:");

// Load state from a file if load state option is specified
if (loadStateParsed && pathParsed) commandProcessor.loadStateFromFile();

// Listen for user input
rl.on("line", (input) => {
  commandProcessor.processCommand(input);
  rl.prompt();
});

// Handle close event (e.g., when the user types 'exit' or closes the application)
rl.on("close", () => {
  commandProcessor.processCommand("exit");
  process.exit(0);
});

rl.prompt();
