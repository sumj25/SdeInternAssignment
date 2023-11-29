class FileSystem {
  constructor() {
    // Initialize the file system with a root directory
    this.root = {
      type: "dir",
      name: "/",
      content: {},
    };
    // Set the current directory to the root
    this.currentDirectory = this.root;
  }

  mkdir(name) {
    // Create a new directory with the given name in the current directory
    if (!name || name.includes("/")) {
      console.log("Invalid directory name");
      return;
    }

    // Check if the directory already exists
    if (this.currentDirectory.content[name]) {
      console.log(`Directory '${name}' already exists`);
      return;
    }

    // Create the new directory
    this.currentDirectory.content[name] = {
      type: "dir",
      name: name,
      content: {},
      parent: this.currentDirectory,
    };
  }

  cd(path) {
    // Change the current directory to the specified path
    const resolvePath = this.resolvePath(path);
    if (resolvePath) {
      // Check if the resolved path is a directory
      if (resolvePath.type !== "dir") {
        console.log(`${path} is not a directory`);
        return;
      }
      this.currentDirectory = resolvePath;
    } else {
      console.log("Invalid path");
    }
  }

  ls(path) {
    // List the contents of the specified directory or the current directory
    const resolvePath =
      path == null ? this.currentDirectory : this.resolvePath(path);
    if (resolvePath) {
      // Check if the resolved path is a directory
      if (resolvePath.type !== "dir") {
        console.log(`${path} is not a directory`);
        return;
      }
      const content = Object.keys(resolvePath.content);
      console.log(content.join("\t"));
    } else {
      console.log("Invalid path");
    }
  }

  grep(fileName, pattern) {
    // Search for a pattern in the content of a file
    const file = this.currentDirectory.content[fileName];
    if (file && file.type === "file") {
      const content = file.content;
      const lines = content.split("\n");
      const matchedLines = lines.filter((line) => line.includes(pattern));

      if (matchedLines.length > 0) {
        console.log(`Pattern '${pattern}' found in file '${fileName}':`);
        console.log(matchedLines.join("\n"));
      } else {
        console.log(`Pattern '${pattern}' not found in file '${fileName}'`);
      }
    } else {
      console.log(`File '${fileName}' not found or is not a file`);
    }
  }

  cat(fileName) {
    // Display the content of a file
    const file = this.currentDirectory.content[fileName];
    if (file && file.type === "file") {
      console.log(file.content);
    } else {
      console.log(`File '${fileName}' not found or is not a file`);
    }
  }

  touch(fileName) {
    // Create a new empty file
    if (!fileName || fileName.includes("/")) {
      console.log("Invalid file name");
      return;
    }

    // Check if the file already exists
    if (this.currentDirectory.content[fileName]) {
      console.log(`File '${fileName}' already exists`);
      return;
    }

    // Create the new file
    this.currentDirectory.content[fileName] = {
      type: "file",
      name: fileName,
      content: "",
      parent: this.currentDirectory,
    };
  }

  echo(fileName, text) {
    // Set the content of a file
    const file = this.currentDirectory.content[fileName];
    if (file && file.type === "file") {
      file.content = text;
    } else {
      console.log(`File '${fileName}' not found or is not a file`);
    }
  }

  mv(source, destination) {
    // Move a file or directory
    const sourcePath = this.resolvePath(source);
    const destinationPath = this.resolvePath(destination);

    // Check for invalid source or destination paths
    if (sourcePath === destinationPath) {
      console.log(`Cannot move '${source}' to a subdirectory of itself`);
      return;
    }
    if (!sourcePath || !destinationPath) {
      console.log("Invalid source or destination path");
      return;
    }

    const fileName = sourcePath.name;

    // Check if the destination already contains a file or directory with the same name
    if (destinationPath.content[fileName]) {
      console.log(`Error: '${fileName}' already exists in '${destination}'`);
      return;
    }

    // Move the file or directory
    destinationPath.content[fileName] = sourcePath;
    delete sourcePath.parent.content[fileName];
    sourcePath.parent = destinationPath;
  }

  cp(source, destination) {
    // Copy a file or directory
    const sourcePath = this.resolvePath(source);
    const destinationPath = this.resolvePath(destination);

    // Check for invalid source or destination paths
    if (!sourcePath || !destinationPath) {
      console.log("Invalid source or destination path");
      return;
    }

    const fileName = sourcePath.name;
    // Check if the destination already contains a file or directory with the same name
    if (destinationPath.content[fileName]) {
      console.log(`Error: '${fileName}' already exists in '${destination}'`);
      return;
    }
    // Copy the file or directory
    destinationPath.content[fileName] = sourcePath;
  }

  rm(path, recursive = false) {
    // Remove a file or directory
    const targetPath = this.resolvePath(path);

    // Check for invalid paths
    if (!targetPath) {
      console.log("Invalid path");
      return;
    }

    // Prevent removal of the root directory
    if (targetPath === this.root) {
      console.log("Cannot remove the root directory");
      return;
    }

    // Check if the directory is not empty (unless the -r option is provided)
    if (
      !recursive &&
      targetPath.type === "dir" &&
      Object.keys(targetPath.content).length > 0
    ) {
      console.log(
        `Error: Directory '${path}' is not empty. Use -r option to delete anyway.`
      );
      return;
    }

    // Delete the file or directory
    delete targetPath.parent.content[targetPath.name];

    if (recursive || targetPath.type === "file") {
      console.log(
        `${
          targetPath.type === "file" ? "File" : "Directory"
        } '${path}' deleted successfully.`
      );
    } else {
      console.log(`File or directory '${path}' deleted successfully.`);
    }
  }

  resolvePath(path) {
    // Resolve the given path relative to the current directory
    if (!path || path === "/" || path === "~") {
      return this.root;
    }

    const parts = path.split("/").filter((part) => part !== "");
    let current = this.currentDirectory;

    for (const part of parts) {
      if (part === "..") {
        current = current.parent || current;
      } else if (part === ".") {
        current = current;
      } else {
        current = current.content[part];
      }

      if (!current) {
        return null;
      }
    }

    return current;
  }
}

// Export the FileSystem class for use in other modules
module.exports = FileSystem;
