/**
 * @file      OpenADMS UI
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2017
 * @see       {@link https://www.dabamos.de/}
 */

'use strict';

/* Initialize the logger. */
Logger.useDefaults();

/* Global objects to store core and additional `App` instances under their respecitve name. */
var core = {};
var apps = {};

$(document).ready(function() {
    /**
     * Creates router and views using Backbone.js.
     */
    function initBackbone() {
        models.appList = new models.AppList(_.values(apps));

        // Create the view.
        views.frontendView = new views.FrontendView();

        // Start the router.
        router.router = new router.Router(views.frontendView);
        Backbone.history.start();
    }

    /**
     * Loads apps from a path and stores them in a given object.
     * @param  {string} rootPath - Path to load the apps from.
     * @param  {Object} obj      - Object to store the apps in.
     * @return {deferred}        - Deferred object.
     */
    function loadApps(rootPath, obj) {
        return $.ajax({
            url: urljoin(rootPath, 'apps.json'),
            dataType: 'json'
        }).then(function(data) {
            var appNames = data.apps;

            return $.when.apply($, appNames.map(function(appName) {
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
                    var app = new models.App({
                        name: _.first(meta).name,                   // The name of the app.
                        meta: _.first(meta),                        // The meta information.
                        run: new Function(_.first(script)),         // The app script.
                        compiled: _.template(_.first(template)),    // The compiled template.
                    });
                    obj[app.get('name')] = app;
                    Logger.debug(`Loaded app "${app.get('name')}"`);
                });
            }));
        });
    }

    // Lazy load everything.
    loadApps('/core/', core).then(loadApps('/apps/', apps))
                            .then(function() {
                                initBackbone();
                            });
});
