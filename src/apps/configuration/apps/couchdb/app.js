/**
 * @file      The CouchDB couchdbiguration page.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2018
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

/* Initialise the logger. */
let logger = Logger.get('couchdb');

/* Enable tabbed menu. */
$('.menu .item').tab();

/*
 * Load settings from LocalStorage.
 */
let settings = new UI.Models.Settings('couchdb');
settings.fetch();

/*
 * Forms.
 */
/* Semantic UI form field template. */
let tpl = _.template('\
    <div class="field" data-editor>\
        <label for="<%= editorId %>"><%= title %></label>\
    </div>\
');

/* Backbone form. */
let Forms = {};
Forms.CouchDB = Backbone.Form.extend({
    model: settings,
    idPrefix: 'couchdb-',
    template: _.template($('#couchdb-template').html()),
    schema: {
        host: { type: 'Text', template: tpl, fieldClass: 'required eight wide' },
        port: { type: 'Text', template: tpl, fieldClass: 'required two wide' },
        database: { type: 'Text', template: tpl, fieldClass: 'required ten wide' },
        username: { type: 'Text', template: tpl, fieldClass: 'required five wide' },
        password: { type: 'Password', template: tpl, fieldClass: 'required five wide' }
    }
});

let form = new Forms.CouchDB();
form.on('submit', function (event) {
    event.preventDefault();
    form.commit();
    settings.save();
});
form.render();
$('#couchdb').append(form.el);

/*
 * PouchDB options.
 */
const pouchOpts = {
    skip_setup: true,
    auth: {
        username: settings.get('username'),
        password: settings.get('password')
    }
};

/*
 * AJAX options.
 */
const ajaxOpts = {
    ajax: {
        headers: {
            Authorization: 'Basic ' + window.btoa(settings.get('username') + ':' + settings.get('password'))
        },
        withCredentials: false
    }
};

/* Create PouchDB database. */
const url = settings.get('host') + ':' + settings.get('port') + '/' + settings.get('database');
let db = new PouchDB(url, pouchOpts);

db.login(settings.get('username'), settings.get('password'), ajaxOpts).then(function () {
    return db.info();
}).then(function (docs) {
    $('#db-info').html(`<code>${docs.db_name}</code><br><code>${docs.adapter}</code>`);
}).catch(function (error) {
    logger.error(error.message);
    $('.ui.error.message').html(`Error: ${error.message}`).toggle();
});

/* Validate database connection details. */
$('.ui form').form({
    on: 'blur',
    fields: {
        couchdbServer: {
            identifier: 'couchdb[server]',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please enter the server URL, for example: <code>https://db.example.com/</code>.'
                },
                {
                    type: 'regExp',
                    value: /^[\w.:/]+$/i,
                    prompt: 'Not a valid FQDN or IP address.'
                }
            ]
        },
        couchdbPort: {
            identifier: 'couchdb[port]',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please enter a valid port (default: 5984).'
                },
                {
                    type: 'regExp',
                    value: /^[0-9]+$/i,
                    prompt: 'Only numbers (0-9) allowed in port.'
                }
            ]
        },
        couchdbPath: {
            identifier: 'couchdb[path]',
            rules: [
                {
                    type: 'regExp',
                    value: /^[\w/-]+$/i,
                    prompt: 'Not a valid server path, for example: <code>couchdb</code>.'
                }
            ]
        },
        couchdbDatabase: {
            identifier: 'couchdb[database]',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please enter database name.'
                },
                {
                    type: 'regExp',
                    value: /^[\S]+$/i,
                    prompt: 'Not a valid database name.'
                }
            ]
        },
        couchdbCredentials: {
            identifier: 'couchdb[user]',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please enter a valid user name.'
                },
                {
                    type: 'regExp',
                    value: /^[\w/-]+$/i,
                    prompt: 'Not a valid user name.'
                }
            ]
        },
        couchdbPassword: {
            identifier: 'couchdb[password]',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please enter a valid password.'
                },
                {
                    type: 'regExp',
                    value: /^[\S]+$/i,
                    prompt: 'Not a valid password.'
                }
            ]
        },
    }
});