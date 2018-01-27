/**
 * @file      The Project Manager handles project and sensor node information.
 *            New projects can be added to the internal PouchDB database. Project
 *            alteration is done by nested Apps.
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

        // Render App on call, e. g., '#app/proman/args'.
        if (proman.models.appsList.get(args))
            proman.views.App.render(args);
    })
    .done(function () {
        $('#app-view').removeClass('loading');
    });

/**
 * Project Table.
 */
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

/* Table row view of single project. */
proman.views.ProjectItem = Backbone.View.extend({
    tagName: 'tr',
    events: {
		'click .ui.radio.checkbox': function() {
		    // Set selected radio checkbox.
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

        // Either display all projects or notice if no projects exist.
        if (this.collection.length > 0)
            this.collection.forEach(function(item) {
                let itemView = new proman.views.ProjectItem({
                    model: item
                });

                element.append(itemView.render().el);
            });
        else
            element.append('<tr><td class="center aligned" colspan="3"><em>no projects yet</em></td></tr>');

        // Re-init checkbox in order to capture label click events.
        $('.ui.checkbox').checkbox();

        return this;
    }
});

/**
 * Project Action Buttons.
 */
proman.models.ProjectAction = Backbone.Model.extend();
proman.models.ProjectActions = Backbone.Collection.extend({
    model: proman.models.ProjectAction
});

proman.views.ProjectActionItem = Backbone.View.extend({
    tagName: 'a',
    className: 'item',
    role: 'button',
    attributes : function () {
        return {
            id : this.model.get('id'),
            role: 'button'
        };
    },
    initialize: function () {
        _.bindAll(this, 'render');
        this.model.bind('change', this.render);
    },
    render: function () {
        if (this.model.get('disabled'))
            $(this.el).toggleClass('disabled');

        $(this.el).empty();
        $(this.el).append($('<i class="' + this.model.get('icon') + ' icon"></i>'));
        $(this.el).append(this.model.get('text'));

        return this;
    }
});

proman.views.ProjectActionsList = Backbone.View.extend({
    actions: null,
    projects: null,
    el: '#project-action',
    className: 'ui horizontal list',
    initialize: function (options) {
        this.actions = options.actions;
        this.projects = options.projects;

        _.bindAll(this, 'render');

        this.actions.bind('reset', this.render);
        this.actions.bind('add', this.render);
        this.actions.bind('remove', this.render);
    },
    render: function () {
        let element = $(this.el);
        element.empty();

        this.actions.forEach(function(item) {
            let itemView = new proman.views.ProjectActionItem({
                model: item
            });

            element.append(itemView.render().el);
        });

        return this;
    }
});

/**
 * Instantiation of models and views.
 */
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

proman.models.projectActions = new proman.models.ProjectActions([
    {
        disabled: true,
        icon: 'checkmark',
        id: 'activate',
        text: 'Activate'
    },
    {
        disabled: true,
        icon: 'write',
        id: 'edit',
        text: 'Edit'
    },
    {
        disabled: false,
        icon: 'remove',
        id: 'delete',
        text: 'Delete'
    }
]);

proman.views.projectActionsList = new proman.views.ProjectActionsList({
    actions: proman.models.projectActions,
    projects: proman.models.projectActions
});

/* Render project table and action buttons. */
proman.views.projectTable.render();
proman.views.projectActionsList.render();

/* Delete project. */
$('#delete').click(function () {
    if (checkedRadio) {
        $('.mini.modal').modal({
            closable  : false,
            onApprove : function() {
                // Remove project from collection and database.
                proman.models.projects.remove(proman.models.projects.get(checkedRadio));
                // Reset selected checkbox.
                setCheckedRadio(null);
            }
        }).modal('show');
    }
});