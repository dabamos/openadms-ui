![OpenADMS UI](https://www.dabamos.de/github/openadms.png)

**OpenADMS UI** is a single-page application for the remote control of
[OpenADMS Node](https://github.com/dabamos/openadms-node/) and
[OpenADMS Server](https://github.com/dabamos/openadms-server/)
instances. It is written in ECMAScript 2015 and relies on jQuery, Backbone.js,
Semantic UI, and PouchDB.

## Run
Launch OpenADMS UI by simply serving the directory contents with a web server
(nginx, Hiawatha, httpd, ...). For testing, you can start the HTTP server
module of Python 3 inside the OpenADMS UI directory (or execute ``run.sh``):
```
$ python3 -m http.server 8080
```
Open your web browser and access ``http://localhost:8080/``.

## Build
[Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) are
required to build OpenADMS UI. Clone the repository with Git and run:
```
$ npm install
```
Build OpenADMS UI with:
```
$ npm run-script build
```
The output file ``bundle.js`` will be saved to ``assets/js/``.
If you change any Semantic UI styles, re-package the CSS files with Gulp:
```
$ cd semantic/
$ ../node_modules/gulp/bin/gulp.js build-css
```
The compiled CSS files ``semantic.css`` and ``semantic.min.css`` will be
stored in ``assets/css/``.

## Writing Apps
OpenADMS UI can be extended by writing additional Apps. Add an App directory to
``apps/`` and place the following files inside it:

* ``meta.json`` (App information),
* ``template.html`` (Underscore.js template),
* ``app.js`` (optional script).

The JSON file ``meta.json`` stores all information regarding the App:
```
{
  "name": "myapp",
  "title": "My App",
  "icon": "puzzle",
  "menu": true
}
```
The name must equal the name of the App directory. The title will be displayed in
the App menu and optionally in the Underscore.js template. The icon can be
changed to a valid [Semantic UI icon](https://semantic-ui.com/elements/icon.html)
name. If ``menu`` is set to ``true``, the App will be listed in the App menu.

The file ``template.html`` contains the HTML elements and optional Underscore.js
placeholders for meta values.

The script ``app.js`` will be run as a JavaScript function each time the App is
loaded. A variable ``args`` is given as an argument to the function and
provides the extended routing path (e. g., ``#apps/myapp/args``).

Enable the App by adding the App name to ``autoload`` in ``apps/apps.json``.
Open ``http://localhost:8080/#apps/myapp/`` to display the App.

## JSDoc
Run JSDoc to generate the source code documentation:
```
$ ./node_modules/jsdoc/jsdoc.js -r ./src -d ./doc
```
You will find the HTML pages in directory ``doc/``.

## Licence
OpenADMS UI is licenced under BSD-2-Clause.