/**
 * @file      Backbone.js models.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2017
 * @see       {@link https://www.dabamos.de/}
 */

var models = {};

/**
 * App base model.
 */
models.App = Backbone.Model.extend({
    defaults: {
        name: 'undefined',
        title: 'Undefined',
        icon: 'help',
        compiled: null,
        run: null,
    }
});

/**
 * AppsList collection.
 */
models.AppsList = Backbone.Collection.extend({
    model: models.App
});