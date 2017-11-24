/**
 * @file      Views for Backbone.js.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2017
 * @see       {@link https://www.dabamos.de/}
 */

var views = {};

/**
 * View of the page.
 */
views.Page = Backbone.View.extend({
    el: '#main',
    initialize: function() {
        this.renderCore('index', null);
    },
    renderError: function(name) {
        var model = core.get('error');
        var compiled = model.get('compiled');
        var meta = {
            'name': name,
            'title': model.get('title'),
            'icon': model.get('icon')
        };

        this.$el.html(compiled(meta));

        return this;
    },
    renderApp: function(name, args) {
        var model = apps.get(name);

        if (model != null) {
            var run = model.get('script');
            var compiled = model.get('compiled');
            var meta = {
                'name': model.get('name'),
                'title': model.get('title'),
                'icon': model.get('icon'),
            };

            this.$el.html(compiled(meta));
            run(name);
        } else {
            this.renderError(name);
        }

        return this;
    },
    renderCore: function(name, args) {
        var model = core.get(name);

        if (model != null) {
            var run = model.get('script');
            var compiled = model.get('compiled');
            var meta = {
                'name': model.get('name'),
                'title': model.get('title'),
                'icon': model.get('icon')
            };

            this.$el.html(compiled(meta));
            run(name);
        } else {
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
        var element = $(this.el);

        // Clear potential old entries first.
        element.empty();

        // Go through the collection items.
        this.collection.forEach(function(item) {
            // Instantiate an AppItem view for each App.
            var appItem = new views.AppItem({
                model: item
            });

            element.append(appItem.render().el);
        });

        return this;
    }
});
