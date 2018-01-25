/**
 * @file      The Project Manager handles project and sensor node information.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2018
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

/* Initialise the logger. */
Logger.useDefaults();
let logger = Logger.get('proman');

/* Views and models of the Project Manager. */
let proman = {};
proman.views = {};
proman.models = {};

/* Nested Apps will be displayed in div #app-view. */
proman.models.appsList = new UI.models.AppsList();

/* View container for nested Apps. */
proman.views.AppView = Backbone.View.extend({
    el: '#app-view',
    render: function (name) {
        let app = proman.models.appsList.get(name);

        if (app !== null) {
            logger.debug(`Rendering app "${name}"`);
            let run = app.get('script');
            let compiled = app.get('compiled');
            let vars = {
                'name': app.get('name'),
                'title': app.get('title'),
                'icon': app.get('icon'),
            };

            this.$el.html(compiled(vars));
            run();
        }

        return this;
    }
});

/* Use Promises to load all nested Apps. */
$.when(UI.loadApps('/src/apps/proman/apps/', proman.models.appsList))
    .then(function () {
        proman.views.appView = new proman.views.AppView();

        /* Render app on call, e. g., '#app/proman/args'. */
        if (proman.models.appsList.get(args))
            proman.views.appView.render(args);
    })
    .done(function () {
        $('#app-view').removeClass('loading');
    });