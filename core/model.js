/**
 * @file      Implementation of the Backbone.js model classes.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Modulelied Sciences, 2020
 * @see       {@link https://github.com/dabamos/openadms-ui/}()
 */

'use strict';

/* Backbone.js model classes. */
let Models = {};

/**
 * Global OpenADMS UI settings model.
 */
Models.Settings = Backbone.Model.extend({
    initialize: function (name) {
        //this.localStorage = new LocalStorage(name);
    },
    parse: function (response, options) {
        /* Required in order to update the view. See:
         * https://stackoverflow.com/a/36965652/1694861
         */
        return response[0];
    }
});

/**
 * Module base model.
 */
Models.Module = Backbone.Model.extend({
    defaults: {
        name: 'undefined',  /* The name of the module. */
        title: 'Undefined', /* The title of the module. */
        description: 'n/a', /* The second title of the module. */
        compiled: null,     /* The compiled Underscore.js template. */
        script: null        /* The module function. */
    }
});

/**
 * ModulesList collection.
 */
Models.ModulesList = Backbone.Collection.extend({
    model: Models.Module
});
