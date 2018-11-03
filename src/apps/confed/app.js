/**
 * @file      The Configuration Editor App is used to create JSON-based
 *            configuration files for OpenADMS Node.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2018
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

/* Semantic UI */
$('.ui.dropdown').dropdown({
    on: 'click'
});

$('.ui.buttons .dropdown.button').dropdown({
    action: 'combo'
});

$('.menu .item').tab();

/* Backbone.js */
let ConfigurationEditor = {};
ConfigurationEditor.Views = {};

/* Second-degree apps. */
let apps = new UI.Models.AppsList();

let data = {
    id: 'test',
    name: 'test',
    title: 'Test',
    icon: 'setting',
    compiled: _.template('<h4>Hello, Sucker!</h4>'),
    script: new Function('return;')
};

apps.add(data);

/**
 * AppItem view.
 */
ConfigurationEditor.Views.AppItem = Backbone.View.extend({
    tagName: 'li',
    initialize: function() {
        _.bindAll(this, 'render');
        this.model.bind('change', this.render);
    },
    render: function() {
        // Quick and dirty ...
        $(this.el).empty();
        $(this.el).append('<a href="#"><i class="' + this.model.get('icon') + ' icon"></i>' + this.model.get('title') + '</a>');
        return this;
    }
});

/**
 * AppsMenu view.
 */
ConfigurationEditor.Views.AppsMenu = Backbone.View.extend({
    el: '#app-list',
    initialize: function(collection) {
        this.collection = collection;
        _.bindAll(this, 'render');
        this.collection.bind('reset', this.render);
        this.collection.bind('add', this.render);
        this.collection.bind('remove', this.render);
    },
    render: function() {
        let element = $(this.el);
        element.empty();
        this.collection.forEach(function(item) {
            let appItem = new ConfigurationEditor.Views.AppItem({
                model: item
            });

            element.append(appItem.render().el);
        });
        return this;
    }
});

/**
 * Module view for second-degree App contents.
 */
ConfigurationEditor.Views.Module = Backbone.View.extend({
    el: '#app-view',
    render: function(name, args) {
        let model = apps.get(name);

        if (model !== null) {
            let compiled = model.get('compiled');
            this.$el.html(compiled());
        }

        return this;
    }
});

/* Instantiate the Views. */
let appItemsList = new ConfigurationEditor.Views.AppsMenu(apps);
appsMenu.render();

let module = new ConfigurationEditor.Views.Module();
module.render('test');