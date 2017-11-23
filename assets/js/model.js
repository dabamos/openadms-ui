/**
 * @file      Backbone.js models.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2017
 * @see       {@link https://www.dabamos.de/}
 */

var models = {};

/**
 * App model.
 */
models.App = Backbone.Model.extend({
    defaults: {
        name: 'undefined',
        meta: {},
        compiled: null,
        run: null,
    }
});

/**
 * AppList model.
 */
models.AppList = Backbone.Collection.extend({
    model: models.App
});