/**
 * @file      Router for Backbone.js.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2020
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

'use strict';

let Router = {};

/**
 * The page router.
 */
Router.Router = Backbone.Router.extend({
    initialize: function(view) {
        this.view = view;
    },
    routes: {
        '': 'showModule',
        'module/': 'showModule',
        'module/:name(/*args)': 'showModule',
    },
    showModule: function(name, args) {
        /* Render single module. */
        if (name === null)
            name = 'index';

        log.debug(`Routing to module "${name}" ...`);
        this.view.renderModule(name, args);
    }
});
