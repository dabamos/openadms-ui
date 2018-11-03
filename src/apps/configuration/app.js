/**
 * @file      A configuration tool for remote CouchDB databases.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2018
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

/* Initialise the logger. */
let logger = Logger.get('configuration');

/* Default App to show. */
const defaultApp = 'couchdb';

/* Open PouchDB database for settings. */
// let db = new PouchDB('ui');

/* View classes of subordinate Apps. */
let AppManager = {};
AppManager.Views = {};

/* Model and view instances. */
AppManager.models = {};
AppManager.views = {};

/* Collection with all auto-loaded subordinate Apps. */
AppManager.models.appsList = new UI.Models.AppsList();

/* View container for subordinate Apps. */
AppManager.Views.App = Backbone.View.extend({
    el: '#app-view',
    render: function (name) {
        let app = AppManager.models.appsList.get(name);
        if (app !== null) {
            logger.debug('Rendering app "' + name + '"');
            let run = app.get('script');
            let compiled = app.get('compiled');
            let vars = {
                'name': app.get('name'),
                'title': app.get('title'),
                'icon': app.get('icon')
            };
            /* Display the compiled App template inside the div. */
            $(this.el).html(compiled(vars));
            /* Run the App script. */
            run();
        }
        return this;
    }
});

/* App menu item view. */
AppManager.Views.AppItem = Backbone.View.extend({
    tagName: 'a',
    className: 'ui item',
    attributes: { href: '#' },
    initialize: function () {
        _.bindAll(this, 'render');
        this.model.bind('change', this.render);
    },
    render: function (isActive) {
        // Quick and dirty ...
        let $el = $(this.el);
        $el.empty();
        if ($el) {
            $el.append('<i class="' + this.model.get('icon') + ' icon"></i>' + this.model.get('title'));
            $el.attr('href', '#app/configuration/' + this.model.get('name'));
            /* Add class `active` to element if App is selected. */
            if (isActive)
                $el.addClass('active');
        }
        return this;
    }
});

/* Apps menu view. */
AppManager.Views.AppsMenu = Backbone.View.extend({
    el: '#sub-apps-menu',
    initialize: function (collection) {
        this.collection = collection;
        _.bindAll(this, 'render');
        this.collection.bind('reset', this.render);
        this.collection.bind('add', this.render);
        this.collection.bind('remove', this.render);
    },
    render: function (args) {
        let $el = $(this.el);
        $el.empty();
        this.collection.forEach(function (item) {
            let appItem = new AppManager.Views.AppItem({
                model: item
            });
            /* Add class `active` to active menu item. */
            let isActive = (args == item.get('name'));
            $el.append(appItem.render(isActive).el);
        });
        return this;
    }
});

/**
 * View for subordinate Apps.
 */
AppManager.Views.Module = Backbone.View.extend({
    el: '#app-view',
    render: function (name, args) {
        let $model = AppManager.models.appsList.get(name);
        if ($model !== null)
            $(this.el).html($model.get('compiled'));
        return this;
    }
});

/* Use Promises to load all subordinate Apps and store them in
   `AppManager.models.appsList`. */
$.when(UI.loadApps(path.join(UI.rootPath,
                             UI.appsPath,
                             'configuration/apps/'),
                             AppManager.models.appsList)).then(function () {
    /* Render Apps menu. */
    AppManager.views.appsMenu = new AppManager.Views.AppsMenu(AppManager.models.appsList);
    AppManager.views.appsMenu.render(args);

    if (AppManager.models.appsList.get(args)) {
        /* Render App on call, e.g., '#app/configuration/<args>'. */
        new AppManager.Views.App().render(args);
    } else {
        /* Render default app. */
        new AppManager.Views.App().render(defaultApp);
    }
}).done(function () {
    /* Remove loading screen. */
    $('#app-view').removeClass('loading');
});
