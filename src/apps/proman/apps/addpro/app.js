/**
 * @file      Used to create new projects.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2018
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

/* Initialise the logger. */
Logger.useDefaults();
let logger = Logger.get('addpro');

/* Open PouchDB database. */
let db = new PouchDB('projects');

/**
 * Returns pseudo-random UUID4 as 32-character hexadecimal string.
 * @returns {string} - The UUID4 string.
 */
function uuid4() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/* Semantic UI. */
$('.button').popup();

$('input[name=project-id]').val(uuid4());

$('#new-id').click(function () {
    $('input[name=project-id]').val(uuid4);
});


/* Validate project details. */
let $form = $('.ui form');

$form.form({
    on: 'blur',
    fields: {
        projectId: {
            identifier: 'project-id',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please enter a project ID (for example, UUID4 as 32-character hexadecimal string)'
                },
                {
                    type: 'regExp',
                    value: /^\w+$/i,
                    prompt: 'Only characters (a-zA-Z0-9_) allowed in project ID'
                }
            ]
        },
        projectName: {
            identifier: 'project-name',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please enter a project name'
                },
                {
                    type: 'regExp',
                    value: /^\w+$/i,
                    prompt: 'Only characters (a-zA-Z0-9_) allowed in project name'
                }
            ]
        }
    }
});

/* Add project to database. */
$form.submit(function (event) {
    let $inputs = $form.find(':input');
    let values = {};

    $inputs.each(function () {
        values[this.name] = $(this).val();
    });

    let project = {
        _id: values['project-id'],
        name: values['project-name'],
        id: values['project-id'],
        description: values['project-description'],
        nodes: {}
    };

    db.get('ui').then(function (doc) {
        doc.projects[project.id] = project;
        return db.put(doc);
    }).then(function (response) {
        if (response.ok)
            logger.debug(`Added project "${project.name}" to database`);
    }).catch(function (err) {
        console.log(err);
    });

    event.preventDefault();
});