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

/* Importing one by one doesn't work. This is so fucking stupid. */
import { core, apps } from './openadms-ui.js';

let views = {};

export {
    views as default,
    views as views
};

/* Initialise the logger. */
Logger.useDefaults();
let logger = Logger.get('view');

/**
 * View of the page.
 */
views.Page = Backbone.View.extend({
    el: '#main',
    initialize: function() {
        // this.renderCore('index', null);
    },
    renderError: function(name) {
        let model = core.get('error');
        let compiled = model.get('compiled');
        let meta = {
            'name': name,
            'title': model.get('title'),
            'icon': model.get('icon')
        };

        this.$el.html(compiled(meta));

        return this;
    },
    renderApp: function(name, args) {
        let model = apps.get(name);

        if (model != null) {
            logger.debug(`Rendering app "${name}"`);
            let run = model.get('script');
            let compiled = model.get('compiled');
            let meta = {
                'name': model.get('name'),
                'title': model.get('title'),
                'icon': model.get('icon'),
            };

            this.$el.html(compiled(meta));
            run(name);
        } else {
            logger.debug(`App "${name}" not found`);
            this.renderError(name);
        }

        return this;
    },
    renderCore: function(name, args) {
        let model = core.get(name);

        if (model != null) {
            logger.debug(`Rendering core app "${name}"`);
            let run = model.get('script');
            let compiled = model.get('compiled');
            let meta = {
                'name': model.get('name'),
                'title': model.get('title'),
                'icon': model.get('icon')
            };

            this.$el.html(compiled(meta));
            run(name);
        } else {
            logger.debug(`Core App "${name}" not found`);
            this.renderError(name);
        }

        return this;
    }
});

/**
 * View of an App item in the App menu.
 */
views.AppItem = Backbone.View.extend({
    tagName: 'a',
    initialize: function(options) {
        _.bindAll(this, 'render');
        this.model.bind('change', this.render);
    },
    render: function() {
        $(this.el).empty();

        $(this.el).addClass('item');
        $(this.el).attr('href', '#app/' + this.model.get('name'));
        $(this.el).append('<i class="' + this.model.get('icon') + ' icon"></i>');
        $(this.el).append(this.model.get('title'));

        return this;
    }
});

/**
 * View of the App menu.
 */
views.AppMenu = Backbone.View.extend({
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
        let element = $(this.el);

        // Clear potential old entries first.
        element.empty();

        // Go through the collection items.
        this.collection.forEach(function(item) {
            // Instantiate an AppItem view for each App.
            let appItem = new views.AppItem({
                model: item
            });

            element.append(appItem.render().el);
        });

        return this;
    }
});