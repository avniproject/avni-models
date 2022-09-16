import PersistedObject from "./PersistedObject";

class ConfigFile extends PersistedObject {
  static schema = {
    name: "ConfigFile",
    primaryKey: "fileName",
    properties: {
      fileName: "string",
      contents: "string",
    },
  };

   constructor(that = null) {
    super(that);
  }

  get fileName() {
      return this.that.fileName;
  }

  set fileName(x) {
      this.that.fileName = x;
  }

  get contents() {
      return this.that.contents;
  }

  set contents(x) {
      this.that.contents = x;
  }

  static create(fileName, contents) {
    const configFile = new ConfigFile();
    configFile.fileName = fileName.toLowerCase();
    configFile.contents = contents;
    return configFile;
  }

  toString() {
    return this.fileName;
  }
}

export default ConfigFile;
