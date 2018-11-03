/**
 * @file      OpenADMS UI is a single-page application serving as a remote
 *            control interface for OpenADMS Node instances. It is written in
 *            ECMAScript 2015 and relies on jQuery, Backbone.js, Semantic UI,
 *            and PouchDB.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2018
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

/* I really hate JavaScript. Front-end programming is for monkeys. See:
   https://hackernoon.com/how-it-feels-to-learn-javascript-in-2016-d3a717dd577f
   Next time, I'll do this in Fortran. */

'use strict';

/* Obscure imports. */
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import { LocalStorage } from 'backbone.localstorage';
import Logger from 'js-logger';
import Plotly from 'plotly.js-basic-dist';
import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication'
import path from 'path';
import 'semantic-ui';
import 'backbone-forms';

import Models from './model.js';
import Views from './view.js';
import Router from './router.js';

/* Why is this shit even necessary? */
export {
    apps as default,
    apps as apps
};

/* OpenADMS UI version. */
let version = 1.0;

/* OpenADMS UI root path. */
let rootPath = '/openadms-ui/';

/* Path to the Apps. */
let appsPath = 'src/apps/';

/* Collection to store App models. */
let apps = new Models.AppsList();

/* View instances. */
let views = {};

/* Load PouchDB plug-ins. */
PouchDB.plugin(PouchAuth);

/* Initialise the logger. */
Logger.useDefaults();
let logger = Logger.get('root');

/* Hacking in some global variables to be used by Apps while in strict mode. */
(function (global) {
    global.$ = $;
    global._ = _;
    global.Backbone = Backbone;
    global.LocalStorage = LocalStorage;
    global.Logger = Logger;
    global.Plotly = Plotly;
    global.PouchDB = PouchDB;
    global.path = path;
    global.UI = {
        rootPath: rootPath,
        appsPath: appsPath,
        loadApps: loadApps,
        Models: {
            App: Models.App,
            AppsList: Models.AppsList,
            Settings: Models.Settings
        },
        version: version
    };
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
 * Creates and renders page and App menu Views.
 */
function initView() {
    views.page = new Views.Page();
    /* Only pass those Apps which should be displayed in the menu. */
    views.appsMenu = new Views.AppsMenu(new Models.AppsList(apps.where({menu: true})));
    views.appsMenu.render();
}

/**
 * Creates and starts the Backbone router.
 */
function initRouter() {
    let router = new Router.Router(views.page);
    Backbone.history.start({
        root: rootPath
    });
}

/**
 * Loads Apps from a root path and stores them in a given collection.
 * @param  {string}              rootPath   - Path to load the Apps from.
 * @param  {Backbone.Collection} collection - Collection to store the Apps in.
 * @return {function}                       - Function to run deferred.
 */
function loadApps(rootPath, collection) {
    let autoLoadFile = path.join(rootPath, 'apps.json');
    logger.debug('Loading Apps list file "' + autoLoadFile + '"');

    return $.ajax({
        url: autoLoadFile,
        dataType: 'json'
    }).then(function(json) {
        let autoLoad = json.autoload;
        return $.when.apply($, autoLoad.map(function (appName) {
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
            ).then(function (meta, script, template) {
                let data = _.first(meta);

                data.id = data.name;
                data.script = new Function('args', _.first(script));
                data.compiled = _.template(_.first(template));

                collection.add(data);
                logger.debug(`Loaded App "${data.name}"`);
            });
        }));
    });
}

$(document).ready(function () {
    /* Use Promises to pre-load everything. */
    $.when(loadApps(path.join(rootPath, appsPath), apps))
        .then(initView)
        .then(initRouter)
        .done(hideLoader);
});