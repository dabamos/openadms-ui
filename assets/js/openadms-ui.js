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
var core = new models.AppsList();
var apps = new models.AppsList();

$(document).ready(function() {
    /**
     * Creates router and views using Backbone.js.
     */
    function initBackbone() {
        views.page = new views.Page();
        views.appMenu = new views.AppMenu(apps);
        views.appMenu.render();

        // Start the router.
        router.router = new router.Router(views.page);
        Backbone.history.start();
    }

    /**
     * Loads apps from a path and stores them in a given object.
     * @param  {string}              rootPath - Path to load the apps from.
     * @param  {Backbone.Collection} obj      - Collection to store the apps in.
     * @return {deferred}                     - Deferred object.
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
                    var data = {
                        id: _.first(meta).name,
                        name: _.first(meta).name,
                        title: _.first(meta).title,
                        icon: _.first(meta).icon,
                        run: new Function(_.first(script)),
                        compiled: _.template(_.first(template)),
                    };
                    obj.add(data);
                    Logger.debug(`Loaded app "${data.name}"`);
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
