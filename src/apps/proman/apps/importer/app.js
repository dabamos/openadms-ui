/**
 * @file      Importer for sensor node configuration files.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2018
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

/**
 * Reads JSON file contents from user upload and outputs to preview element.
 * @param   event     - The event.
 * @returns {boolean} - True on success, false on failure.
 */
function handleFileSelect(event) {
    let fr = new FileReader();
    let files = event.target.files;

    if (files.length <= 0)
        return false;

    fr.addEventListener('load', function(event) {
        let result = JSON.parse(event.target.result);
        let formatted = JSON.stringify(result, null, 2);
        $('#preview').val(formatted);
    }, false);

    fr.readAsText(files.item(0));
    return true;
}

/* Add event listener for JSON file upload. */
let selectFile = document.getElementById('selectFile');

if (selectFile)
    selectFile.addEventListener('change', handleFileSelect, false);

/* Faux file upload input. */
$('input:text').click(function () {
    $(this).parent().find('input:file').click();
});

$('input:file', '.ui.action.input').on('change', function (event) {
    let name = event.target.files[0].name;
    $('input:text', $(event.target).parent()).val(name);
});

/* Validate file selection. */
$('.ui form').form({
    on: 'blur',
    fields: {
        fileName: {
            identifier: 'fileName',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please select a JSON file'
                }
            ]
        }
    }
});

/* Prevent form submission. */
$('#jsonImport').submit(function (event) {
    event.preventDefault();
});