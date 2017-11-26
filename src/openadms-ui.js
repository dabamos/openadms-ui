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
import * as urljoin from 'urljoin';
import 'semantic-ui';

/* I don't even know if this is the correct way ... */
import models from './model.js';
import views from './view.js';
import router from './router.js';

/* Global collections to store `App` models. */
let core = new models.AppsList();
let apps = new models.AppsList();

/* Why is this shit even necessary? */
export {
    core as default,
    core as core,
    apps as apps
};

/* Initialise the logger. */
Logger.useDefaults();
let logger = Logger.get('openadms-ui');

/**
 * Hides the Semantic UI loader screen.
 * @return {function} - Function to run deferred.
 */
function hideLoader() {
    return function() {
        let loader = $('#loader');
        loader.dimmer('show');
        loader.dimmer('hide');
    };
}

/**
 * Creates and renders page and App menu views.
 * @return {function} - Function to run deferred.
 */
function initView() {
    return function() {
        views.page = new views.Page();
        views.appMenu = new views.AppMenu(apps);
        views.appMenu.render();
    };
}

/**
 * Creates and starts the Backbone.js router.
 * @return {function} - Function to run deferred.
 */
function initRouter() {
    return function() {
        router.router = new router.Router(views.page);
        Backbone.history.start();
    };
}

/**
 * Loads apps from a root path and stores them in a given collection.
 * @param  {string}              rootPath   - Path to load the apps from.
 * @param  {Backbone.Collection} collection - Collection to store the apps in.
 * @return {function}                       - Function to run deferred.
 */
function loadApps(rootPath, collection) {
    return $.ajax({
        url: urljoin(rootPath, 'apps.json'),
        dataType: 'json'
    }).then(function(kwargs) {
        let autoLoad = kwargs.autoload;

        return $.when.apply($, autoLoad.map(function(appName) {
            let path = urljoin(rootPath, appName);

            return $.when(
                $.ajax({
                    url: urljoin(path, 'meta.json'),
                    dataType: 'json'
                }),
                $.ajax({
                    url: urljoin(path, 'app.js'),
                    dataType: 'script'
                }),
                $.ajax({
                    url: urljoin(path, 'template.html'),
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
    /* Lazy load everything. */
    loadApps('/src/core/', core).then(loadApps('/src/apps/', apps))
                                .then(initView())
                                .then(initRouter())
                                .then(hideLoader());
});
