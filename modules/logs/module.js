/**
 * Module: Charts
 *
 * Plotting timeseries fetched from an OpenADMS Server instance in a plotly
 * chart using jQuery. A little ugly, but gets the job done.
 */

let settings = {
    pid: '',    // Selected project ID.
    nid: ''     // Selected sensor node ID.
}

/* Listen to dropdown changes. */
$('select').on('change', function() {
    $('#logs-button').removeAttr('disabled');

    let id = $(this).attr('id');
    let value = $(this).val();

    switch (id) {
        case 'logs-pid':
            settings.pid = value;
            showStatus('Fetching sensor node IDs ...');
            fetch(`projects/${settings.pid}/nodes/`, populateDropdown, '#logs-nid');
        case 'logs-nid':
            settings.nid = value;
            fetch(`projects/${settings.pid}/nodes/${settings.nid}/logs/`, populateTable, '#logs-messages');
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
    $('#logs-status').addClass('hidden');
    $('#logs-error').removeClass('hidden');
    $('#logs-error').html(str);
}

/* Shows a status message. */
function showStatus(str) {
    log.info(str);
    $('#logs-status').removeClass('hidden');
    $('#logs-error').addClass('hidden');
    $('#logs-status').html(str);
}

/* Populates a dropdown list of given `id` with elements from `array`. */
function populateDropdown(id, array) {
    $('#logs-status').addClass('hidden');
    $(id).removeAttr('disabled');

    if ($.isArray(array) && array.length > 0) {
        let $dropdown = $(id);
        $dropdown.empty();

        $.each(array, function() {
            $dropdown.append($("<option>").val(this).text(this)).trigger('change');
        });
    }
}

/* Populates a table of given `id` with elements from `array`. */
function populateTable(id, array) {
    if ($.isArray(array) && array.length > 0) {
        $(id).children('tbody').empty();
        $.each(array, function() {
            log.debug(`Fetching heartbeat status of pid "${settings.pid}" and nid "${this}" ...`);
            addRow(id, this);
        });
    }
}

/* Adds a single log message to table of given `id`. */
function addRow(id, obj) {
    log.debug(`Adding row to element "${id}" ...`);

    let html = `<tr><td data-label="Timestamp">${obj.dt}</td>` +
               `<td data-label="Level"><mark class="${obj.level}">${obj.level}</mark></td>` +
               `<td data-label="Module"><code>${obj.module}</code></td>` +
               `<td data-label="Message">${obj.message}</td></tr>`;
    $(id).children('tbody').append(html);
}

/* Sends an AJAX request to `resource` and populates the dropdown list of given `id`. */
function fetch(resource, callback, id) {
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
            beforeSend: function(xhr) {
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
                log.debug('Received response');
                $(id).attr('disabled', '');
                callback(id, data);
            }
        });
    }
}

/* Run on load. */
$(function() {
    log.debug('Running module "logs" ...');
    showStatus('Fetching project IDs ...');
    fetch('projects/', populateDropdown, '#logs-pid');
});
