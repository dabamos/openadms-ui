/**
 * Module: Charts
 *
 * Plotting timeseries fetched from an OpenADMS Server instance in a plotly
 * chart using jQuery. A little ugly, but gets the job done.
 */

let pid = '';       // Selected project ID.
let nid = '';       // Selected sensor node ID.
let sensor = '';    // Selected sensor name.
let target = '';    // Selected target name.

/* Listen to dropdown changes. */
$('select').on('change', function() {
    let id = $(this).attr('id');
    let value = $(this).val();

    switch (id) {
        case 'charts-pid':
            pid = value;
            showStatus('Fetching sensor node IDs ...');
            fetch('#charts-nid', `projects/${pid}/nodes/`);
        case 'charts-nid':
            nid = value;
            showStatus('Fetching sensor names ...');
            fetch('#charts-sensor', `projects/${pid}/nodes/${nid}/sensors/`);
        case 'charts-sensor':
            sensor = value;
            showStatus('Fetching target names ...');
            fetch('#charts-target', `projects/${pid}/nodes/${nid}/sensors/${sensor}/targets/`);
    }
});


/* Checks for profile data in LocalStorage. */
function hasProfile() {
    if (!store.has('ui.profile.url') || !store.has('ui.profile.user') || !store.has('ui.profile.password')) {
        log.warn('Profile missing');
        return false;
    }
    if (!store.get('ui.profile.url') || !store.get('ui.profile.user') || !store.get('ui.profile.password')) {
        log.warn('Profile empty');
        return false;
    }
    log.debug('Profile found');
    return true;
}

/* Shows an error message. */
function showError(str) {
    log.warn(str);
    $('#charts-status').addClass('hidden');
    $('#charts-error').removeClass('hidden');
    $('#charts-error').html(str);
}

/* Shows a status message. */
function showStatus(str) {
    log.info(str);
    $('#charts-status').removeClass('hidden');
    $('#charts-error').addClass('hidden');
    $('#charts-status').html(str);
}

/* Populates a dropdown list of given `id` with elements from `array`. */
function populate(id, array) {
    let $dropdown = $(id);
    $.each(array, function() {
        $dropdown.append($("<option>").val(this).text(this)).trigger('change');
    });
}

/* Sends an AJAX request to `resource` and populates the dropdown list of given `id`. */
function fetch(id, resource) {
    $(id).attr('disabled', '');

    if (!hasProfile()) {
        showError('Profile incomplete or missing');
    } else {
        let url = store.get('ui.profile.url');
        let user = store.get('ui.profile.user');
        let password = store.get('ui.profile.password');
        let api = urljoin(url, ui.API_ENTRY, resource);

        log.debug(`Requesting resource "${api}" ...`);
        $.ajax({
            url: api,
            crossDomain: true,
            dataType: 'json',
            timeout: 10000,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Basic ' + btoa(user + ':' + password));
            },
            statusCode: {
                0: function(response) {
                    showError('Unknown error');
                },
                401: function(response) {
                    showError('Invalid user name or password');
                },
                404: function(response) {
                    showError(`Resource "${api}" not found`);
                },
                500: function(response) {
                    showError('Internal server error');
                },
            },
            success: function(data, status, xhr) {
                /* Received an array of project ids. */
                log.debug('Received response');

                $(id).removeAttr('disabled');
                $('#charts-status').addClass('hidden');

                if ($.isArray(data) && data.length > 0) {
                    populate(id, data)
                }
            }
        });
    }
}

/* Run on load. */
$(function() {
    log.debug('Running module "table" ...');
    showStatus('Fetching project IDs ...');
    fetch('#charts-pid', 'projects/');
});
