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
    if(!$('.ui.form').form('is valid'))
        return;

    // Disable create and cancel buttons.
    $('.ui.button').addClass('disabled');

    // Read input values.
    let $inputs = $form.find(':input');
    let values = {};

    $inputs.each(function () {
        values[this.name] = $(this).val();
    });

    // Create project document.
    let doc = {
        _id: values['project-id'],
        name: values['project-name'],
        id: values['project-id'],
        description: values['project-description'],
        nodes: {}
    };

    // Add project to database.
    db.put(doc).then(function (response) {
        if (response.ok) {
            // Show success message.
            $('.ui.success.message').html(`Added project “${doc.name}” to database`).toggle();

            // Get back to the project manager default page.
            setTimeout(function () {
                window.location = '#app/projectManager';
            }, 1000);
        }
    }).catch(function (err) {
        // Show error message.
        $('.ui.error.message').html(err);
    });

    event.preventDefault();
});