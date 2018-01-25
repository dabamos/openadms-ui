/**
 * @file      Router for Backbone.js.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2017
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

'use strict';

import 'backbone';

let router = {};

export {
    router as default,
    router as router
};

/**
 * Router.
 */
router.Router = Backbone.Router.extend({
    initialize: function(view) {
        this.view = view;
    },
    routes: {
        '': 'showApp',
        'app/:name(/*args)': 'showApp',
    },
    showApp: function(name, args) {
        /* Render single App. */
        if (name === null)
            name = 'index';

        this.view.renderApp(name, args);
    }
});
