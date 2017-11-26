/**
 * @file      OpenADMS UI
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2017
 * @see       {@link https://www.dabamos.de/}
 */

/* I really hate JavaScript. Front-end programming is for monkeys. */
'use strict';

/* Obscure imports. */
import $ from 'jquery';
import _ from 'underscore';
import Logger from 'js-logger';
import * as urljoin from 'urljoin';
import 'semantic-ui';

/* I don't know if this is the correct way ... */
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

$(document).ready(function() {
    /**
     * Hides loader screen.
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
     * Creates and renders views.
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
     * Creates and starts router.
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

    /* Lazy load everything. */
    loadApps('/src/core/', core).then(loadApps('/src/apps/', apps))
                                .then(initView())
                                .then(initRouter())
                                .then(hideLoader());
});
