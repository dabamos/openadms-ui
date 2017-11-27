let logger = Logger.get('basic');
logger.debug('Basic App is online');

let models = {};
let views = {};

let apps = new OpenADMS.models.AppsList();

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
    el: '#modules',
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

views.Module = Backbone.View.extend({
    el: '#view',
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