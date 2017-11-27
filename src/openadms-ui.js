/**
 * @file      OpenADMS UI is a single-page application for the remote control of
 *            OpenADMS Node and OpenADMS Server instances. It is written in
 *            ECMAScript 2015 and relies on jQuery, Backbone.js, and Semantic UI.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2017
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

/* I really hate JavaScript. Front-end programming is for monkeys. See:
   https://hackernoon.com/how-it-feels-to-learn-javascript-in-2016-d3a717dd577f */
'use strict';

/* Obscure imports. */
import $ from 'jquery';
import _ from 'underscore';
import Logger from 'js-logger';
import path from 'path';
import 'semantic-ui';

import models from './model.js';
import views from './view.js';
import router from './router.js';

/* Collections to store App models. */
let core = new models.AppsList();
let apps = new models.AppsList();

let rootAppPath = '/src';

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
    global.OpenADMS = {
        models: {
            App: models.App,
            AppsList: models.AppsList
        },
        loadApps: loadApps
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
 * Creates and renders page and App menu views.
 */
function initView() {
    views.page = new views.Page();
    views.appMenu = new views.AppMenu(apps);
    views.appMenu.render();
}

/**
 * Creates and starts the Backbone.js router.
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
    return $.ajax({
        url: path.join(rootPath, 'apps.json'),
        dataType: 'json'
    }).then(function(kwargs) {
        let autoLoad = kwargs.autoload;

        return $.when.apply($, autoLoad.map(function(appName) {
            let appPath = path.join(rootPath, appName);

            return $.when(
                $.ajax({
                    url: path.join(appPath, 'meta.json'),
                    dataType: 'json'
                }),
                $.ajax({
                    url: path.join(appPath, 'app.js'),
                    dataType: 'script'
                }),
                $.ajax({
                    url: path.join(appPath, 'template.html'),
                    dataType: 'html'
                })
            ).then(function(meta, script, template) {
                let data = _.first(meta);

                data['id'] = data.name;
                data['script'] = new Function(_.first(script));
                data['compiled'] = _.template(_.first(template));

                collection.add(data);
                logger.debug(`Loaded app "${data.name}"`);
            });
        }));
    });
}

$(document).ready(function() {
    let corePath = path.join(rootAppPath, 'core');
    let appsPath = path.join(rootAppPath, 'apps');

    /* Lazy load everything. */
    $.when(loadApps(corePath, core), loadApps(appsPath, apps))
        .then(initView)
        .then(initRouter)
        .done(hideLoader);
});
