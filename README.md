# Cartman
A simple download booster

- [Installation](#installation)
- [API](#api)
- [Example Uses](#example-uses)

## Installation
While Cartman is not yet an NPM package, you can follow these instruction to download him:

`git clone https://github.com/AdiedX/cartman.git`<br>
`cd cartman`

Install dependencies:

`npm install`

Add a symbolic link in the global directory for cartman:

`npm link`

## API
```bash
cartman download <url> <destination> <portionOfFile> <chunkSize>
```

### url
URL of the resource you want to download. This is the only mandatory command line argument

Example: `http://norvig.com/big.txt`


### destination
Path to the file to which the downloaded contents will be written. Should be a file name:

`./my-downloaded-file`

### portionOfFile
How much of the file do you want to download. Specified in MiB [mebibytes](https://en.wikipedia.org/wiki/Mebibyte).

### chunkSize
How little of the file do you want to download with each HTTP request. Also specified in MiB.

## Example uses
```bash
cartman download http://norvig.com/big.txt ./my-file.txt 4 1
```

```bash
cartman download https://raw.githubusercontent.com/zemirco/sf-city-lots-json/master/citylots.json ./my-data.json 10 2
```

To get help:

```bash
cartman --help
```
