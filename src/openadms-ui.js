/**
 * @file      OpenADMS UI is a single-page application for the remote control of
 *            OpenADMS Node and OpenADMS Server instances. It is written in
 *            ECMAScript 2015 and relies on jQuery, Backbone.js, and Semantic UI.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2018
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

/* I really hate JavaScript. Front-end programming is for monkeys. See:
   https://hackernoon.com/how-it-feels-to-learn-javascript-in-2016-d3a717dd577f */
'use strict';

/* Obscure imports. */
import $ from 'jquery';
import _ from 'underscore';
import Logger from 'js-logger';
import PouchDB from 'pouchdb';
import path from 'path';
import 'semantic-ui';

import models from './model.js';
import views from './view.js';
import router from './router.js';

/* OpenADMS UI version. */
let version = 1.0;

/* Collections to store App models. */
let core = new models.AppsList();
let apps = new models.AppsList();

/* Path to the App directories. */
let rootAppPath = 'src/';

/* PouchDB database. */
let database = new PouchDB('ui');

/* Why is this shit even necessary? */
export {
    core as default,
    core as core,
    apps as apps
};

/* Initialise the logger. */
Logger.useDefaults();
let logger = Logger.get('root');

/* Hacking in some global variables to be used by Apps while in strict mode. */
(function(global) {
    global.$ = $;
    global._ = _;
    global.Backbone = Backbone;
    global.Logger = Logger;
    global.UI = {
        models: {
            App: models.App,
            AppsList: models.AppsList
        },
        loadApps: loadApps
    };
    global.database = database;
    global.version = version;
})(window);

/**
 * Hides the Semantic UI loader screen.
 */
function hideLoader() {
    let loader = $('#loader');
    loader.dimmer('show');
    loader.dimmer('hide');
}

/**
 * Initialises the PouchDB database.
 */
function initDatabase() {
    let doc = {
        '_id': 'ui',
        'projects': {},
        'active': null
    };

    database.put(doc).then(function () {
        database.get('ui').then(function (doc) {
            logger.debug(`Initialised database`);
        }).catch(function (err) {
            logger.error(err);
        });
    });
}

/**
 * Creates and renders page and App menu views.
 */
function initView() {
    views.page = new views.Page();
    views.appMenu = new views.AppMenu(apps);
    views.appMenu.render();
}

/**
 * Creates and starts the Backbone router.
 */
function initRouter() {
    router.router = new router.Router(views.page);
    Backbone.history.start();
}

/**
 * Loads apps from a root path and stores them in a given collection.
 * @param  {string}              rootPath   - Path to load the apps from.
 * @param  {Backbone.Collection} collection - Collection to store the apps in.
 * @return {function}                       - Function to run deferred.
 */
function loadApps(rootPath, collection) {
    let appsFile = path.join(rootPath, 'apps.json');
    logger.debug(`Loading apps file ${appsFile}`);

    return $.ajax({
        url: appsFile,
        dataType: 'json'
    }).then(function(json) {
        let autoLoad = json.autoload;

        return $.when.apply($, autoLoad.map(function(appName) {
            let appPath = path.join(rootPath, appName);

            return $.when(
                $.ajax({
                    url: path.join(appPath, 'meta.json'),
                    dataType: 'json'
                }),
                $.ajax({
                    url: path.join(appPath, 'app.js'),
                    dataType: 'text' // Do not use 'script' here!
                }),
                $.ajax({
                    url: path.join(appPath, 'template.html'),
                    dataType: 'html'
                })
            ).then(function(meta, script, template) {
                let data = _.first(meta);

                data.id = data.name;
                data.script = new Function('args', _.first(script));
                data.compiled = _.template(_.first(template));

                collection.add(data);
                logger.debug(`Loaded app "${data.name}"`);
            });
        }));
    });
}

$(document).ready(function() {
    let corePath = path.join(rootAppPath, 'core');
    let appsPath = path.join(rootAppPath, 'apps');

    /* Use Promises to pre-load everything. */
    $.when(loadApps(corePath, core), loadApps(appsPath, apps))
        .then(initView)
        .then(initRouter)
        .then(initDatabase)
        .done(hideLoader);
});