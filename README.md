# deps_downloader
Cli to download assets and libraries on demand for your project. Inspired by electron-download but more universal.

**Note this repository is no longer maintained. For the latest on the SAFE Network project please see [safenetwork.tech](https://safenetwork.tech/) or our community forum [safenetforum.org](https://safenetforum.org/)**

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
                "version": "1.5.0",
                "override": false
            }
            "win32" : {
                "electron" : {
                    "filePattern": "electron.exe$"
                    "disabled": true
                }
            },
            "mobile": {
              "electron": {
                "disabled": true
              }
            }
        }
    }
```

This example does the same as before but now overwrites the filePattern to `electron.exe` on windows systems and uses the version `1.5.1` in case it is run in `NODE_ENV='test'`. You can add any number of entries in `download_deps` each containing a configuration set except for `ENV` which contains the overwrites.

`ENV` may contain any `NODE_ENV` environment (default is `dev`). Each environment or platform may contain extra entries. Any Platform may also contain a `ENV` entry with other node-env environment overwrites. See [examples/complex.json] for a complex version.

A `disabled` property may be added for a particular environment variable condition in order to prevent a default file from being downloaded.

If intending to download more than one version of a file, use the `override` property to prevent the the default configuration from being overwritten.

## License

This SAFE Network library is dual-licensed under the Modified BSD ([LICENSE-BSD](LICENSE-BSD) https://opensource.org/licenses/BSD-3-Clause) or the MIT license ([LICENSE-MIT](LICENSE-MIT) https://opensource.org/licenses/MIT) at your option.

## Contribution

Copyrights in the SAFE Network are retained by their contributors. No copyright assignment is required to contribute to this project.
