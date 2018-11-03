/**
 * @file      Model classes for Backbone.js.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2017
 * @see       {@link https://github.com/dabamos/openadms-ui/}()
 */

'use strict';

import Backbone from 'backbone';
import { LocalStorage } from 'backbone.localstorage';

let Models = {};

export {
    Models as default,
    Models as Models
};

/*
 * Global OpenADMS UI settings model.
 */
Models.Settings = Backbone.Model.extend({
    initialize: function (name) {
        this.localStorage = new LocalStorage(name);
    },
    parse: function (response, options) {
        /* Required in order to update the view. See:
         * https://stackoverflow.com/a/36965652/1694861
         */
        return response[0];
    }
});

/**
 * App base model.
 */
Models.App = Backbone.Model.extend({
    defaults: {
        name: 'undefined',  /* The name of the app. */
        title: 'Undefined', /* The title of the app. */
        icon: 'help',       /* The name of the Semantic UI icon. */
        compiled: null,     /* The compiled Underscore.js template. */
        script: null        /* The app function. */
    }
});

/**
 * AppsList collection.
 */
Models.AppsList = Backbone.Collection.extend({
    model: Models.App
});