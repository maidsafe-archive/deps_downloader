# deps_downloader
Cli to download assets and libraries on demand for your project. Inspired by electron-download but more universal.


## Installation

Add to your project via `npm install --save`

## Configuration

### Simple

The simplest configuration is if you only have one item to download, which follows the electron conventions. Like electron itself. For that just add to your `package.json`'s `script`-section:

```
    "postinstall": "deps_downloader --filename electron --version 1.6.1 --filePattern 
    \"electron$\" "
```

### Complex

To allow for more complex configurations, you can also add a top-level section `download_deps` in the `package.json` and run `deps_downloader --package package.json` in your `postinstall`-section. Example:

```
    "scripts" : {
        "postinstall": "deps_downloader --package package.json"
    },
    "download_deps": {
        "electron" : {
            "version": "1.6.1"
            "filePattern": "electron$"
        },
        "ENV" : {
            "test" : {
                "version": "1.5.0"
            }
            "win32" : {
                "electron" : {
                    "filePattern": "electron.exe$"
                }
            }
        }
    }
```

This example does the same as before but now overwrites the filePattern to `electron.exe` on windows systems and uses the version `1.5.1` in case it is run in `NODE_ENV='test'`. You can add any number of entries in `download_deps` each containing a configuration set except for `ENV` which contains the overwrites.

`ENV` may contain any `NODE_ENV` environment (default is `development`). Each environment or platform may contain extra entries. Any Platform may also contain a `ENV` entry with other node-env environment overwrites. See [examples/complex.json] for a complex version.
