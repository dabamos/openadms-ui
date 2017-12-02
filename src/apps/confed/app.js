/**
 * @file      The Configuration Editor App is used to create JSON-based
 *            configuration files for OpenADMS Node.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2017
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

// Semantic UI.
$('.ui.dropdown').dropdown({
    on: 'click'
});
$('.ui.buttons .dropdown.button').dropdown({
    action: 'combo'
});
$('.menu .item').tab();

let models = {};
let views = {};

let apps = new UI.models.AppsList();

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
views.AppItem = Backbone.View.extend({
    tagName: 'li',
    initialize: function(options) {
        _.bindAll(this, 'render');
        this.model.bind('change', this.render);
    },
    render: function() {
        $(this.el).empty();
        $(this.el).append('<a href="#"><i class="' + this.model.get('icon') + ' icon"></i>' + this.model.get('title') + '</a>');
        return this;
    }
});

/**
 * AppItemsList view.
 */
views.AppItemsList = Backbone.View.extend({
    collection: null,
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
            let appItem = new views.AppItem({
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
views.Module = Backbone.View.extend({
    el: '#app-view',
    render: function(name, args) {
        let model = apps.get(name);

        if (model != null) {
            let compiled = model.get('compiled');
            this.$el.html(compiled());
        }

        return this;
    }
});

appItemsList = new views.AppItemsList(apps);
appItemsList.render();

module = new views.Module();
module.render('test');