![OpenADMS UI](https://www.dabamos.de/github/openadms.png)

**OpenADMS UI** is a single-page application for the remote control of
[OpenADMS Node](https://github.com/dabamos/openadms-node/) and
[OpenADMS Server](https://github.com/dabamos/openadms-server/)
instances. It is written in ECMAScript 2015 and relies on jQuery, Backbone.js,
and Semantic UI.

## Run
Clone the repository with Git and serve the contents with a web server.
For testing, you can start the HTTP server module of Python 3 inside the
OpenADMS UI directory (or execute ``run.sh``):
```
$ python3 -m http.server 8080
```
Open your web browser and access ``http://localhost:8080/``.

## Build
Clone the repository with Git and run:
```
$ npm install
```
Build OpenADMS UI with:
```
$ npm run-script build
```
If you changed the Semantic UI source files, build it with Gulp:
```
$ cd semantic/
$ ../node_modules/gulp/bin/gulp.js build
```
The compiled files will be stored in ``semantic/dist/``.

## JSDoc
Run JSDoc to generate the source code documentation:
```
$ ./node_modules/jsdoc/jsdoc.js ./src/openadms-ui.js -d ./doc
```
You will find the HTML pages in directory ``doc/``.

## Licence
OpenADMS UI is licenced under BSD-2-Clause.