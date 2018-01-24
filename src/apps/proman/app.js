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

/* Data models for projects and sensor nodes. */
let proman = {};
proman.views = {};
proman.models = {};

if (args)
    console.log(args);

/* Module view for second-degree App contents. */
proman.views.AppView = Backbone.View.extend({
    el: '#appview',
    render: function(name) {
        let app = proman.models.appsList.get(name);

        if (app != null) {
            /* Display the compiled template. */
            let compiled = app.get('compiled');
            this.$el.html(compiled());

            /* Run the script. */
            let run = app.get('script');
            run();
        }

        return this;
    }
});

/* Second-degree Apps will be stored in here. */
proman.models.appsList = new UI.models.AppsList();

/* Use Promises to load all second-degree Apps. */
$.when(UI.loadApps('/src/apps/proman/apps/', proman.models.appsList))
    .then(function () {
        // Function does the trick.
        proman.views.appView = new proman.views.AppView();
        proman.views.appView.render('importer');
    })
    .done(function () {
        $('#appview').removeClass('loading');
    });