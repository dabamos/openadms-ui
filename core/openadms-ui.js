/**
 * @file      OpenADMS UI is a single-page application serving as a remote
 *            control interface for OpenADMS Node instances.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2020
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

'use strict';

const VERSION      = 0.1;               /* OpenADMS UI version. */
const ROOT_PATH    = '/openadms-ui/';   /* Path on which OpenADMS UI is served: `https://www.example.com/openadms-ui/`. */
const MODULES_PATH = 'modules/';        /* Directory containing the modules. */
const LOG_LEVEL    = 'debug';           /* Logging level. */
const API_ENTRY    = '/api/v1/';        /* Entry point for the OpenADMS Server REST API. */

/* 3rd-party libraries to load at start-up. */
const VENDORS_PRIORITY = [
    'vendor/jquery-3.4.1.min.js',
    'vendor/underscore-min.js',
    'vendor/moment.min.js',
];

const VENDORS_NORMAL = [
    'vendor/backbone-min.js',
    'vendor/daterangepicker.min.js',
    'vendor/loglevel.min.js',
    'vendor/papaparse.min.js',
    'vendor/plotly.min.js',
    'vendor/store2.min.js',
    'vendor/url-join.js',
];

/* Core dependencies. */
const CORE = [
    'core/model.js',
    'core/view.js',
    'core/router.js',
];

/**
 * Checks for profile data in LocalStorage.
 */
function hasProfile() {
    if (!store.has('ui.profile.url') || !store.has('ui.profile.user') || !store.has('ui.profile.password')) {
        return false;
    }
    if (!store.get('ui.profile.url') || !store.get('ui.profile.user') || !store.get('ui.profile.password')) {
        return false;
    }
    return true;
}

/**
 * Hides the donut spinner using jQuery.
 */
function hideLoader() {
    $('#loader').fadeOut('normal', function() {
        $(this).remove();
    });
}

/**
 * Set global variables.
 */
function initializeGlobal(modules, views) {
    log.debug('Setting global variables ...');
    (function(global) {
        global.ui = {
            API_ENTRY: API_ENTRY,
            MODULES_PATH: MODULES_PATH,
            ROOT_PATH: ROOT_PATH,
            VERSION: VERSION,
            loadModules: loadModules,
            hasProfile: hasProfile,
            modules: modules,
            views: views,
            Models: {
                Module: Models.Module,
                ModulesList: Models.ModulesList,
                Settings: Models.Settings
            }
        };
    })(window);
}

/**
 * Creates and starts the Backbone.js router.
 */
function initializeRouter(rootPath, view) {
    log.debug('Initialising Backbone.js router ...');
    let router = new Router.Router(view);
    Backbone.history.start({
        root: rootPath
    });
}

/**
 * Creates and renders page and navigation menu views.
 */
function initializeViews(modules, views) {
    log.debug('Initialising Backbone.js view ...');
    views.page = new Views.Page(modules);
    /* Only pass those modules which should be displayed in the menu. */
    views.modulesMenu = new Views.ModulesMenu(new Models.ModulesList(modules.where({ menu: true })));
    views.modulesMenu.render();
}

/**
 * Load modules in `rootPath` file (e.g., `/openadms-ui/modules/modules.json').
 * The file contains an array of module names to be loaded:
 *
 *     {
 *       "modules:" [
 *         "home",
 *         "licence",
 *         "profile"
 *       ]
 *     }
 *
 * Requires jQuery to be present.
 */
function loadModules(rootPath, collection) {
    let modulesFile = urljoin(rootPath, 'modules.json');
    log.debug(`Loading modules file "${modulesFile}" ...`);

    return $.ajax({
        url: modulesFile,
        dataType: 'json'
    }).then(function(json) {
        let list = json.modules;

        return $.when.apply($, list.map(function(moduleName) {
            let modulePath = urljoin(rootPath, moduleName);

            return $.when(
                $.ajax({
                    url: urljoin(modulePath, 'meta.json'),
                    dataType: 'json'
                }),
                $.ajax({
                    url: urljoin(modulePath, 'module.js'),
                    dataType: 'text' /* Do not use 'script' here! */
                }),
                $.ajax({
                    url: urljoin(modulePath, 'template.html'),
                    dataType: 'html'
                })
            ).then(function(meta, script, template) {
                /* JSON meta data, JS script, and HTML template are loaded. */
                let data = _.first(meta);

                data.id = data.name;
                data.script = new Function('args', _.first(script));
                data.compiled = _.template(_.first(template));

                collection.add(data);
                log.debug(`Loaded module "${data.name}"`);
            });
        }));
    });
}

/**
 * Run the Single-Page Application `OpenADMS UI` on page load. Requires the
 * $script library to be present.
 */
(function() {
     /* Load 3rd-party libraries asynchronously. */
    $script(VENDORS_PRIORITY, function() {
        /* Now, jQuery and Underscore.js are available ... */
        $script(VENDORS_NORMAL, function() {
            /* ... and we have all other dependencies up. */
            /* Initialise logger. */
            log.setLevel(LOG_LEVEL);
            log.debug(`OpenADMS UI, v.${VERSION}`);
            log.debug('Copyright © 2020, Hochschule Neubrandenburg – University of Applied Sciences');

            /* Load OpenADMS UI core dependencies. */
            log.debug('Loading core dependencies ...');
            $script(CORE, function() {
                /* The Backbone.js collection to store module models. */
                let modules = new Models.ModulesList();
                /* The Backbone.js view instances. */
                let views = {};

                /* Load all modules, then initialise view and router. */
                $.when(loadModules(urljoin(ROOT_PATH, MODULES_PATH), modules)).done(function() {
                    initializeGlobal(modules, views);
                    initializeViews(modules, views);
                    initializeRouter(ROOT_PATH, views.page);
                    hideLoader();
                    /* OpenADMS UI is now up and running. */
                });
            });

        });
    });
})();
