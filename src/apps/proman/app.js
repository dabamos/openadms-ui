/**
 * @file      The Project Manager handles project and sensor node information.
 *            New projects can be added to the internal PouchDB database. Project
 *            handling is done by nested Apps.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2018
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

/* Initialise the logger. */
Logger.useDefaults();
let logger = Logger.get('proman');

/* Open PouchDB database for projects. */
let db = new PouchDB('projects');

/* Selected project in table. */
let checkedRadio = null;

function setCheckedRadio(id) {
    checkedRadio = id;
}

/* Views and models of the Project Manager. */
let proman = {};
proman.models = {};
proman.views = {};

/* Apps of the Project Manager. */
proman.models.appsList = new UI.models.AppsList();

/* View container for nested Apps. */
proman.views.App = Backbone.View.extend({
    el: '#app-view',
    render: function (name) {
        let app = proman.models.appsList.get(name);

        if (app !== null) {
            logger.debug(`Rendering app "${name}"`);

            let run = app.get('script');
            let compiled = app.get('compiled');
            let vars = {
                'name': app.get('name'),
                'title': app.get('title'),
                'icon': app.get('icon'),
            };

            // Display the compiled App template inside the div.
            this.$el.html(compiled(vars));
            // Run the App script.
            run();
        }

        return this;
    }
});

/* Use Promises to load all nested Apps and store them in `proman.models.appsList`. */
$.when(UI.loadApps('/src/apps/proman/apps/', proman.models.appsList))
    .then(function () {
        proman.views.App = new proman.views.App();

        /* Render App on call, e. g., '#app/proman/args'. */
        if (proman.models.appsList.get(args))
            proman.views.App.render(args);
    })
    .done(function () {
        $('#app-view').removeClass('loading');
    });

/* Project model. */
proman.models.Project = Backbone.Model.extend({
    initialize: function () {
        this.bind('remove', this.onRemove, this);
    },
    onRemove: function () {
        // Remove model from database.
        db.get(this.id).then(function (doc) {
            return db.remove(doc);
        });
    },
});

/* Projects collection. */
proman.models.Projects = Backbone.Collection.extend({
    model: proman.models.Project
});

/* Table data cell view of projects table. */
proman.views.ProjectItem = Backbone.View.extend({
    tagName: 'tr',
    events: {
		'click .ui.radio.checkbox': function() {
		    setCheckedRadio(this.model.get('id'));
		}
    },
    initialize: function () {
        _.bindAll(this, 'render');
        this.model.bind('change', this.render);
    },
    render: function () {
        $(this.el).empty();
        $(this.el).append($('<td><div class="ui radio checkbox"><input id="' + this.model.get('id') + '" name="project" type="radio"><label>' + this.model.get('name') + '</label></div></td>'));
        $(this.el).append($('<td><code>' + this.model.get('id') + '</code></td>'));
        $(this.el).append($('<td>' + this.model.get('description') + '</td>'));

        return this;
    }
});

/* Project table body. */
proman.views.ProjectsTable = Backbone.View.extend({
    collection: null,
    el: 'tbody',
    initialize: function (options) {
        this.collection = options.collection;

        _.bindAll(this, 'render');

        this.collection.bind('reset', this.render);
        this.collection.bind('add', this.render);
        this.collection.bind('remove', this.render);
    },
    render: function () {
        let element = $(this.el);
        element.empty();

        if (this.collection.length > 0)
            this.collection.forEach(function(item) {
                let itemView = new proman.views.ProjectItem({
                    model: item
                });

                element.append(itemView.render().el);
            });
        else
            element.append('<tr><td colspan="3"><em>no projects yet</em></td></tr>');

        return this;
    }
});

/* Instantiate model and view. */
proman.models.projects = new proman.models.Projects([
    {
        name: 'TestProject',
        id: 'df912f4b5a6b4e82846777c97d19ec56',
        description: 'Simple test project'
    },
    {
        name: 'BridgeProject2',
        id: 'e4bc9b4f72a74a4a9a8cd3c9ab40053b',
        description: 'Deformation monitoring project'
    }
]);

proman.views.projectTable = new proman.views.ProjectsTable({
    collection: proman.models.projects
});

/* Render the project table. */
proman.views.projectTable.render();

/* Semantic UI interactivity. Must be called after view initialisation. */
$('.ui.button').popup();

/* Delete project. */
$('#delete').click(function () {
    if (checkedRadio) {
        proman.models.projects.remove(proman.models.projects.get(checkedRadio));
        setCheckedRadio(null);
    }
});