/**
 * @file      Implementation of the Backbone.js view classes.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2017
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

'use strict';

/* Backbone.js view classes. */
let Views = {};

/**
 * View of the module page.
 */
Views.Page = Backbone.View.extend({
    el: '#module',
    initialize: function (modules) {
        this.modules = modules;
        this.renderModule('home', null);
    },
    renderError: function (name) {
        let module = this.modules.get('error');
        if (module != null) {
            log.debug(`Rendering module "error" instead ...`);
            let compiled = module.get('compiled');
            let vars = {
                'name': name,
                'title': module.get('title'),
                'description': module.get('description')
            };
            /* Set HTML. */
            this.$el.empty();
            this.$el.append(`<h3>${vars.title}<small>${vars.description}</small></h3>`);
            this.$el.append(compiled(vars));
        } else {
            log.error(`Module "error" not found`);
        }
        return this;
    },
    renderModule: function (name, args) {
        let module = this.modules.get(name);
        if (module != null) {
            log.debug(`Rendering module "${name}" ...`);
            let run = module.get('script');
            let compiled = module.get('compiled');
            let vars = {
                'name': module.get('name'),
                'title': module.get('title'),
                'description': module.get('description')
            };
            /* Set HTML. */
            this.$el.empty();
            this.$el.append(`<h3>${vars.title}<small>${vars.description}</small></h3>`);
            this.$el.append(compiled(vars));
            /* Run module script. */
            run(args);
        } else {
            log.info(`Module "${name}" not found`);
            this.renderError(name);
        }

        return this;
    }
});

/**
 * View of a module item inside the navigation menu.
 */
Views.ModuleItem = Backbone.View.extend({
    tagName: 'a',
    initialize: function (options) {
        _.bindAll(this, 'render');
        this.model.bind('change', this.render);
    },
    render: function () {
        let $el = $(this.el);
        /* Set HTML. */
        $el.empty();
        $el.addClass('sublink-1');
        $el.attr('href', '#modules/' + this.model.get('name'));
        $el.append(this.model.get('title'));
        return this;
    }
});

/**
 * View of the navigation menu.
 */
Views.ModulesMenu = Backbone.View.extend({
    collection: null,
    el: '#menu',
    initialize: function (collection) {
        this.collection = collection;
        _.bindAll(this, 'render');

        /* Bind collection changes to re-rendering. */
        this.collection.bind('reset', this.render);
        this.collection.bind('add', this.render);
        this.collection.bind('remove', this.render);
    },
    render: function () {
        let $el = $(this.el);
        /* Set HTML. */
        $el.empty();
        $el.append('<a href="#modules/profile">Profile</a>');
        $el.append('<a href="#modules/status">Status</a>');
        $el.append('<span>Modules</span>');

        this.collection.forEach(function(item) {
            /* Instantiate a ModuleItem view for each module model. */
            let moduleItem = new Views.ModuleItem({
                model: item
            });
            $el.append(moduleItem.render().el);
        });

        $el.append('<a href="#modules/settings">Settings</a>');
        return this;
    }
});
