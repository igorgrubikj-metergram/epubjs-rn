import StaticServer from 'react-native-static-server';

import RNFetchBlob from "rn-fetch-blob";

import {unzip} from 'react-native-zip-archive'

const Dirs = RNFetchBlob.fs.dirs

if (!global.Blob) {
  global.Blob = RNFetchBlob.polyfill.Blob;
}

const Uri = require("epubjs/lib/utils/url");

class EpubStreamer {

  constructor(opts) {
    opts = opts || {};
    this.port = opts.port || "3" + Math.round(Math.random() * (1000 - 100 + 1) + 100);
    this.root = opts.root || "www";

    this.serverOrigin = 'file://';

    this.urls = [];
    this.locals = [];
    this.paths = [];

    this.started = false;
    this.server = undefined;
  }

  setup() {
    // Add the directory
    return RNFetchBlob.fs.exists(`${Dirs.DocumentDir}/${this.root}`)
      .then((exists) => {
        if (!exists) {
          return RNFetchBlob.fs.mkdir(`${Dirs.DocumentDir}/${this.root}`);
        }
      })
      .then(() => {
        return new StaticServer(this.port, this.root, { localOnly: true });
      })
      .catch((e) => { console.error(e) });
  }

  start() {
    this.started = true;
    return this.setup()
      .then((server) => {
        this.server = server;
        return this.server.start();
      })
      .then((url) => {
        this.serverOrigin = url;
        return url;
      });
  }

  stop() {
    this.started = false;
    if (this.server) {
      this.server.stop();
    }
  }

  kill() {
    this.started = false;
    if (this.server) {
      this.server.kill();
    }
  }

  add(bookUrl) {
    let uri = new Uri(bookUrl);
    const filename = this.filename(bookUrl);

    return RNFetchBlob
      .config({
        fileCache: true,
        path: Dirs.DocumentDir + '/' + filename
      })
      .fetch("GET", bookUrl)
      .then((res) => {
        const sourcePath = res.path();
        const targetPath = `${Dirs.DocumentDir}/${this.root}/${filename}`;
        const url = `${this.serverOrigin}/${filename}/`;

        return unzip(sourcePath, targetPath)
          .then((path) => {

            this.urls.push(bookUrl);
            this.locals.push(url);
            this.paths.push(path);

            // res.flush();

            return url;
          })
      });
  }

  async deleteFile(bookId) {
    await RNFetchBlob.fs.unlink(`${Dirs.DocumentDir}/${this.root}/${bookId}`).then(() => {
        return {
          message: `Epub with id ${bookId} successfully deleted`
        }
     })
     .catch((err) => {
        throw new Error('Unable to delete file: ', err);
     })
  }

  check(bookUrl) {
    const filename = this.filename(bookUrl);
    const targetPath = `${Dirs.DocumentDir}/${this.root}/${filename}`;

    return RNFetchBlob.fs.exists(targetPath);
  }

  checkById(bookId) {
    const targetPath = `${Dirs.DocumentDir}/${this.root}/${bookId}`;
    return RNFetchBlob.fs.exists(targetPath);
  }

  async listSavedBooks() {
    try {
      let files = await RNFetchBlob.fs.ls(`${Dirs.DocumentDir}/${this.root}`);
      console.log('Files: ',files);
      return files;
    } catch (error) {
      console.log('EPUBJS-RN listSavedBooks ERROR: ',error);
      throw new Error(error);
    }
  }

  get(bookUrl) {
    return this.check(bookUrl)
      .then((exists) => {
        if (exists) {
          const filename = this.filename(bookUrl);
          return `${this.serverOrigin}/${filename}/`;
        }

        return this.add(bookUrl);
      })
  }

  filename(bookUrl) {
    let uri = new Uri(bookUrl);
    let finalFileName;
    if (uri.filename.indexOf("?") > -1) {
      finalFileName = uri.filename.split("?")[0].replace(".epub", "");
    } else {
      finalFileName = uri.Path.directory.split('/')[2];
    __DEV__ && console.log("Final File Name", finalFileName);
    }
    return finalFileName;
  }

  remove(path) {
    return RNFetchBlob.fs.lstat(path)
      .then((stats) => {
        let index = this.paths.indexOf(path);
        this.paths.splice(index, 1);
        this.urls.splice(index, 1);
        this.locals.splice(index, 1);
      })
      .catch((err) => { })
  }

  clean() {
    this.paths.forEach((path) => {
      this.remove(path);
    });
  }
}

export default EpubStreamer;
