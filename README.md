![OpenADMS UI](https://www.dabamos.de/github/openadms.png)

**OpenADMS UI** is a single-page application for the remote control of
[OpenADMS Node](https://github.com/dabamos/openadms-node/) and
[OpenADMS Server](https://github.com/dabamos/openadms-server/)
instances. It is written in standard JavaScript, using some features of
ECMAScript 2015. Therefore, a modern web browser is required to run OpenADMS UI
properly. All dependencies ([jQuery](https://jquery.com/),
[Backbone.js](https://backbonejs.org/),
[Underscore.js](https://underscorejs.org/), …) are shipped with the source code.

## Run
Launch OpenADMS UI by simply serving the root directory with a web server of
your choice (nginx, Hiawatha, httpd, …). For testing, you can start the Python 3
HTTP server module (or execute ``run.sh``):

```
$ cd ../
$ python3 -m http.server 8080
```

Open your web browser and access
[http://localhost:8080/openadms-ui/](http://localhost:8080/openadms-ui/).
OpenADMS UI must be served from path ``openadms-ui/``. Otherwise, change
``ROOT_PATH`` in ``core/openadms-ui.js`` to the actual path and reload the page.

## Build
The JavaScript source code can be shipped without transpiling (no
[node.js](https://nodejs.org/) or [npm](https://www.npmjs.com/) required). To
update the dependencies, copy the minified scripts to `vendor/`, and the
minified style sheets to `assets/css/vendor/`.

Do not minify the source code in `core/`, as all scripts are loaded dynamically.

## Architecture
The OpenADMS UI Single-Page Application consists of four parts:

1. The **HTML template** `index.html` defines the layout of the web application.
2. The **style sheet** is based on the [mini.css](https://minicss.org/) framework. Some adjustments have been made to it in `assets/css/style.css`.
3. The application **source code** `core/openadms-ui.js` that preloads all dependencies, loads modules, and creates the view. Model classes are loaded from `core/model.js`, view classes from `core/view.js`, and the router from `core/router.js`.
4. Pages are encapsulated in **modules** that are loaded dynamically from directory `modules/`. Each module consists of the HTML template in `template.html`, the module logic in `module.js`, and mandatory meta information in `meta.json`. Modules must be added to `modules/modules.json` to be loaded by OpenADMS UI.

## Adding Modules
OpenADMS UI can be extended by writing additional modules. Add a module
directory to ``modules/`` and place the following files inside it:

* ``meta.json`` (module information),
* ``template.html`` (Underscore.js template),
* ``module.js`` (module script, may be empty).

The JSON file ``meta.json`` stores information regarding the module:

```json
{
  "name": "mymodule",
  "title": "My Module",
  "description": "A short description",
  "menu": true
}
```

The name must equal the name of the module directory. The title and the
description will be displayed in the Underscore.js template. If ``menu`` is set
to ``true``, a link to the module will be added to the navigation menu
automatically.

The HTML template ``template.html`` contains elements and optional Underscore.js
placeholders of meta values.

The module script ``module.js`` will be run as a JavaScript function each time
the module is loaded. The variable ``args`` is given as an argument to the
module function and stores the complete routing path beyond the module name
(e. g., ``#module/mymodule/<args>``).

### Loading Modules
Enable the module by adding the module name to ``modules`` in
``modules/modules.json``. Open
``http://localhost:8080/openadms-ui/#module/mymodule``
to display the module.

### Subordinate Modules
Modules can have subordinate modules. You may want to use the
``ui.loadModules()`` function to load them deferred.

## JSDoc
Run JSDoc to generate the source code documentation:

```
$ ./jsdoc.js -r ./core -d ./docs
```

You will find the HTML pages in directory ``docs/``.

## Licence
OpenADMS UI is distributed under the BSD-2-Clause licence.
