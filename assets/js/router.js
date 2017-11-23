/**
 * @file      Backbone.js router.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2017
 * @see       {@link https://www.dabamos.de/}
 */

var router = {};

/**
 * Router.
 */
router.Router = Backbone.Router.extend({
    initialize: function(view) {
        this.view = view;
    },
    routes: {
        'app/:name(/*args)': 'showApp',
        'core/:name(/*args)': 'showCore',
    },
    showApp: function(name, args) {
        // Render additional apps.
        if (name == null)
            name = 'index';

        this.view.renderApp(name, args);
    },
    showCore: function(name, args) {
        // Render core apps.
        if (name == null)
            name = 'index';

        this.view.renderCore(name, args);
    }
});