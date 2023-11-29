const fs = require("fs");

class CommandProcessor {
  constructor(fileSystem, pathParsed, saveStateParsed) {
    // Initialize the CommandProcessor with references to the file system, path, and save state options
    this.fileSystem = fileSystem;
    this.pathParsed = pathParsed;
    this.saveStateParsed = saveStateParsed;
  }

  loadStateFromFile() {
    // Load the state from a file specified by the pathParsed option
    const filePath = this.pathParsed;

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }
      // Split the file content into individual commands
      let commands = data.split("\n");
      // Remove the last element (empty string) after splitting
      if (commands.length > 0) {
        commands.pop();
        // Process each command from the file
        commands.forEach((command) => this.processCommand(command, true));
      }
    });
  }

  saveStateToFile(command) {
    // Save a command to a file specified by the pathParsed option
    const filePath = this.pathParsed;

    // Append the command to the file
    fs.appendFile(filePath, command + "\n", "utf8", (err) => {
      if (err) {
        console.error("Error appending to file:", err);
        return;
      }
    });
  }

  processCommand(input, isLoading = false) {
    // Process a command, split it into parts, and execute the corresponding file system method
    const [command, ...args] = input.trim().split(" ");
    // Save the command to the file if save state is enabled and it's not during loading
    if (this.saveStateParsed && this.pathParsed && !isLoading)
      this.saveStateToFile(input);

    switch (command) {
      case "mkdir":
        // Create a directory in the file system
        this.fileSystem.mkdir(...args);
        break;
      case "cd":
        // Change the current directory in the file system
        this.fileSystem.cd(...args);
        break;
      case "ls":
        // List the contents of a directory in the file system
        this.fileSystem.ls(...args);
        break;
      case "grep":
        // Search for a pattern in the content of a file
        const fileName = args[0];
        let pattern = args.slice(1).join(" ");
        // Remove surrounding double quotes if present
        if (pattern.startsWith('"') && pattern.endsWith('"')) {
          pattern = pattern.slice(1, -1);
        }
        this.fileSystem.grep(fileName, pattern);
        break;
      case "cat":
        // Display the content of a file
        this.fileSystem.cat(...args);
        break;
      case "touch":
        // Create an empty file in the file system
        this.fileSystem.touch(...args);
        break;
      case "echo":
        // Set the content of a file in the file system
        this.fileSystem.echo(args[0], args.slice(1).join(" "));
        break;
      case "mv":
        // Move a file or directory in the file system
        this.fileSystem.mv(...args);
        break;
      case "cp":
        // Copy a file or directory in the file system
        this.fileSystem.cp(...args);
        break;
      case "rm":
        // Remove a file or directory from the file system
        const recursiveFlagIndex = args.indexOf("-r");
        const pathIndex =
          recursiveFlagIndex !== -1 ? recursiveFlagIndex + 1 : 0;
        const path = args[pathIndex];
        const recursive = recursiveFlagIndex !== -1;
        this.fileSystem.rm(path, recursive);
        break;
      case "exit":
        // Exit the command processor
        console.log("Exiting...");
        process.exit();
        break;
      default:
        console.log("Invalid command");
    }
  }
}

// Export the CommandProcessor class for use in other modules
module.exports = CommandProcessor;
