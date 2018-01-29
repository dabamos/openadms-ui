/**
 * @file      Views for Backbone.js.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2017
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

'use strict';

import $ from 'jquery';
import _ from 'underscore';
import 'backbone';
import Logger from 'js-logger';

import apps from './openadms-ui.js';

let Views = {};

export {
    Views as default,
    Views as Views
};

/* Initialise the logger. */
Logger.useDefaults();
let logger = Logger.get('view');

/**
 * View of the page.
 */
Views.Page = Backbone.View.extend({
    el: '#main',
    initialize: function() {
        // this.renderCore('index', null);
    },
    renderError: function(name) {
        let app = apps.get('error');
        let compiled = app.get('compiled');
        let meta = {
            'name': name,
            'title': app.get('title'),
            'icon': app.get('icon')
        };

        this.$el.html(compiled(meta));

        return this;
    },
    renderApp: function(name, args) {
        let app = apps.get(name);

        if (app != null) {
            logger.debug(`Rendering app "${name}"`);

            let run = app.get('script');
            let compiled = app.get('compiled');
            let vars = {
                'name': app.get('name'),
                'title': app.get('title'),
                'icon': app.get('icon'),
            };

            this.$el.html(compiled(vars));
            run(args);
        } else {
            logger.debug(`App "${name}" not found`);
            this.renderError(name);
        }

        return this;
    }
});

/**
 * View of an App item in the App menu.
 */
Views.AppItem = Backbone.View.extend({
    tagName: 'a',
    initialize: function(options) {
        _.bindAll(this, 'render');
        this.model.bind('change', this.render);
    },
    render: function() {
        let $element = $(this.el);
        $element.empty();

        $element.addClass('item');
        $element.attr('href', '#app/' + this.model.get('name'));
        $element.append('<i class="' + this.model.get('icon') + ' icon"></i>');
        $element.append(this.model.get('title'));

        return this;
    }
});

/**
 * View of the App menu.
 */
Views.AppMenu = Backbone.View.extend({
    collection: null,
    el: '#appmenu',
    initialize: function(collection) {
        this.collection = collection;

        _.bindAll(this, 'render');

        // Bind collection changes to re-rendering.
        this.collection.bind('reset', this.render);
        this.collection.bind('add', this.render);
        this.collection.bind('remove', this.render);
    },
    render: function() {
        let $element = $(this.el);
        $element.empty();

        this.collection.forEach(function(item) {
            // Instantiate an AppItem view for each App.
            let appItem = new Views.AppItem({
                model: item
            });

            $element.append(appItem.render().el);
        });

        return this;
    }
});