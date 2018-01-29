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
let logger = Logger.get('project-manager');

/* Open PouchDB database for projects. */
let db = new PouchDB('projects');

/* Selected project in table. */
let checkedRadio = null;

function setCheckedRadio(id) {
    checkedRadio = id;
}

/* Apps of the Project Manager. */
let appsList = new UI.Models.AppsList();

/* Views and models of the Project Manager. */
let ProjectManager = {};
ProjectManager.Models = {};
ProjectManager.Views = {};

/* View container for nested Apps. */
ProjectManager.Views.App = Backbone.View.extend({
    el: '#app-view',
    render: function (name) {
        let app = appsList.get(name);

        if (app !== null) {
            logger.debug(`Rendering app "${name}"`);

            let run = app.get('script');
            let compiled = app.get('compiled');
            let vars = {
                'name': app.get('name'),
                'title': app.get('title'),
                'icon': app.get('icon'),
            };

            this.$el.html(compiled(vars));  // Display the compiled App template inside the div.
            run();                          // Run the App script.
        }

        return this;
    }
});

/* Use Promises to load all nested Apps and store them in `projectManager.Models.appsList`. */
$.when(UI.loadApps('/src/apps/project-manager/apps/', appsList))
    .then(function () {
        // Render App on call, e. g., '#app/projectManager/args'.
        if (appsList.get(args))
            new ProjectManager.Views.App().render(args);
    })
    .done(function () {
        $('#app-view').removeClass('loading');
    });

/**
 * Project table.
 */
ProjectManager.Models.Project = Backbone.Model.extend({
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

ProjectManager.Models.Projects = Backbone.Collection.extend({
    model: ProjectManager.Models.Project
});

ProjectManager.Views.ProjectItem = Backbone.View.extend({
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
        $(this.el).append('<td><div class="ui radio checkbox"><input id="' + this.model.get('id') + '" name="project" type="radio"><label>' + this.model.get('name') + '</label></div></td>');
        $(this.el).append('<td><code>' + this.model.get('id') + '</code></td>');
        $(this.el).append('<td>' + this.model.get('description') + '</td>');

        return this;
    }
});

/* Project table body. */
ProjectManager.Views.ProjectsTable = Backbone.View.extend({
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

        // Either display all projects or notice that no projects exist.
        if (this.collection.length > 0)
            this.collection.forEach(function(item) {
                let itemView = new ProjectManager.Views.ProjectItem({
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
 * Project actions (activate, edit, delete).
 */
ProjectManager.Models.ProjectAction = Backbone.Model.extend();

ProjectManager.Models.ProjectActions = Backbone.Collection.extend({
    model: ProjectManager.Models.ProjectAction
});

ProjectManager.Views.ProjectActionItem = Backbone.View.extend({
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
        $(this.el).append('<i class="' + this.model.get('icon') + ' icon"></i>');
        $(this.el).append(this.model.get('text'));

        return this;
    }
});

ProjectManager.Views.ProjectActionsList = Backbone.View.extend({
    el: '#project-action',
    className: 'ui horizontal list',
    events: {
        'click #delete': function() {
            if (checkedRadio) {
                $('.mini.modal').modal({
                    closable  : false,
                    onApprove : function() {
                        // Remove project from collection and database.
                        projects.remove(projects.get(checkedRadio));
                        // Reset selected checkbox.
                        setCheckedRadio(null);
                    }
                }).modal('show');
            }
        }
    },
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

        this.collection.forEach(function(item) {
            let itemView = new ProjectManager.Views.ProjectActionItem({
                model: item
            });

            element.append(itemView.render().el);
        });

        return this;
    }
});

/**
 * Instantiation of models and Views.
 */
let projects = new ProjectManager.Models.Projects([
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

let projectTable = new ProjectManager.Views.ProjectsTable({
    collection: projects
});

let projectActions = new ProjectManager.Models.ProjectActions([
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

let projectActionsList = new ProjectManager.Views.ProjectActionsList({
    collection: projectActions
});

/* Render project table and action buttons. */
projectTable.render();
projectActionsList.render();