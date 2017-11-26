![OpenADMS UI](https://www.dabamos.de/github/openadms.png)

**OpenADMS UI** is a single-page application for the remote control of
[OpenADMS Node](https://github.com/dabamos/openadms-node/) and
[OpenADMS Server](https://github.com/dabamos/openadms-server/)
instances. It is written in ECMAScript 2015 and relies on jQuery, Backbone.js,
and Semantic UI.

## Installation
Clone the repository with Git and run:
```
$ npm install
```

## Build
Build OpenADMS UI with:
```
$ npm run-script build
```
Semantic UI can be build with Gulp:
```
$ cd semantic/
$ ../node_modules/gulp/bin/gulp.js build
```
The compiled files will be stored in ``semantic/dist/``.

## Run
For testing, you can use ``http.server`` of Python 3 inside the OpenADMS UI
directory:
```
$ python3 -m http.server 8080
```
Open your web browser and access ``http://localhost:8080/``.

## JSDoc
Run JSDoc to generate the source code documentation:
```
$ ./node_modules/jsdoc/jsdoc.js ./src/openadms-ui.js -d ./doc
```
You will find the HTML pages in directory ``./doc``.

## Licence
OpenADMS UI is licenced under BSD-2-Clause.
