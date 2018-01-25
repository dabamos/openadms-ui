/**
 * @file      Used to create new projects.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2018
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

/**
 * Returns pseudo-random UUID4 as 32-character hexadecimal string.
 * @returns {string} - The UUID4 string.
 */
function uuid4() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/* Semantic UI. */
$('.button').popup();

$('#project-id').val(uuid4());

$('#new-id').click(function () {
    $('#project-id').val(uuid4);
});

/* Validate file selection. */
$('.ui form').form({
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
