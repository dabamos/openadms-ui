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

$('#unid').val(uuid4());

$('#new-unid').click(function () {
    $('#unid').val(uuid4);
});