/**
 * @file      Backbone.js views.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2017
 * @see       {@link https://www.dabamos.de/}
 */

var views = {};

/**
 * Views.
 */
views.FrontendView = Backbone.View.extend({
    el: '#main',
    initialize: function() {
        this.renderCore('index', null);
    },
    renderApp: function(name, args) {
        if (name in apps) {
            var compiled = apps[name].get('compiled');
            this.$el.html(compiled(apps[name].get('meta')));

            var run = apps[name].get('run');
            run(name);
        } else {
            var compiled = core['error'].get('compiled');
            var meta = { name: name };
            this.$el.html(compiled(meta));
        }

        return this;
    },
    renderCore: function(name, args) {
        if (name in core) {
            var compiled = core[name].get('compiled');
            this.$el.html(compiled(core[name].get('meta')));

            var run = core[name].get('run');
            run(name);
        } else {
            var compiled = core['error'].get('compiled');
            var meta = { name: name };
            this.$el.html(compiled(meta));
        }

        return this;
    }
});