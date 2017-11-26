/**
 * @file      Models for Backbone.js.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2017
 * @see       {@link https://www.dabamos.de/}
 */

'use strict';

import 'backbone';

let models = {};

export {
    models as default,
    models as models
};

/**
 * App base model.
 */
models.App = Backbone.Model.extend({
    defaults: {
        name: 'undefined',  // The name of the app.
        title: 'Undefined', // The title of the app.
        icon: 'help',       // The name of the Semantic UI icon.
        compiled: null,     // The compiled Underscore.js template.
        script: null        // The app function.
    }
});

/**
 * AppsList collection.
 */
models.AppsList = Backbone.Collection.extend({
    model: models.App
});
