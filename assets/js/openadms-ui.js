/**
 * @file      OpenADMS UI
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2017
 * @see       {@link https://www.dabamos.de/}
 */

'use strict';

/* Initialise the logger. */
Logger.useDefaults();

/* Global collections to store `App` models. */
var core = new models.AppsList();
var apps = new models.AppsList();

$(document).ready(function() {
    /**
     * Hides loader screen.
     * @return {function} - Function to run deferred.
     */
    function hideLoader() {
        return function() {
            var loader = $('#loader');
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
     * @return {deferred}                       - Deferred object.
     */
    function loadApps(rootPath, collection) {
        return $.ajax({
            url: urljoin(rootPath, 'apps.json'),
            dataType: 'json'
        }).then(function(kwargs) {
            var autoload = kwargs.autoload;

            return $.when.apply($, autoload.map(function(appName) {
                var path = urljoin(rootPath, appName);

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
                    var data = _.first(meta);
                    data['id'] = data.name;
                    data['script'] = new Function(_.first(script));
                    data['compiled'] = _.template(_.first(template));

                    collection.add(data);
                    Logger.debug(`Loaded app "${data.name}"`);
                });
            }));
        });
    }

    // Lazy load everything.
    loadApps('/core/', core).then(loadApps('/apps/', apps))
                            .then(initView())
                            .then(initRouter())
                            .then(hideLoader());
});
