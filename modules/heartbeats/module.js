/**
 * Module: Heartbeat
 *
 */

let settings = {
    pid: ''    // Selected project ID.
}

$('#heartbeats-refresh').click(function() {
    if (settings.pid) {
        fetch(`projects/${settings.pid}/nodes/`, populateTable, '#heartbeats-beats');
    } else {
        showError('Project ID missing');
    }
});

/* Listen to dropdown changes. */
$('#heartbeats-pid').on('change', function() {
    $(this).removeAttr('disabled');
    let id = $(this).attr('id');
    let value = $(this).val();

    if (value != settings.pid) {
        log.debug('Fetching sensor node IDs …');
        settings.pid = value;
        fetch(`projects/${settings.pid}/nodes/`, populateTable, '#heartbeats-beats');
    }
});

function hideError() {
    $('#heartbeats-error').addClass('hidden');
}

function hideStatus() {
    $('#heartbeats-status').addClass('hidden');
}

/* Shows an error message. */
function showError(str) {
    log.warn(str);
    hideStatus();
    $('#heartbeats-error').removeClass('hidden');
    $('#heartbeats-error').html(str);
}

/* Shows a status message. */
function showStatus(str) {
    log.info(str);
    hideError();
    $('#heartbeats-status').removeClass('hidden');
    $('#heartbeats-status').html(str);
}

/* Populates a dropdown list of given `id` with elements from `array`. */
function populateDropdown(id, array) {
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
    $(id).children('tbody').empty();

    $.each(array, function() {
        log.debug(`Fetching heartbeat status of pid "${settings.pid}" and nid "${this}" ...`);
        fetch(`projects/${settings.pid}/nodes/${this}/heartbeat/`, addRow, id);
    });
}

/* Adds a single row heartbeat information to table of given `id`. */
function addRow(id, obj) {
    log.debug(`Adding row to element "${id}" ...`);

    let color = 'tertiary';
    let title = 'in time';

    let now = moment(new Date());
    let end = moment(obj.dt)
    let duration = moment.duration(now.diff(end));
    let seconds = duration.asSeconds();
    let dt = end.format('YYYY-MM-DD HH:mm:ss');
    let rel = end.fromNow(true);

    if (seconds > obj.freq) {
        color = 'secondary';
        title = `${rel} overdue`;
    }

    let html = `<tr><td data-label="Sensor Node ID" title="${obj.nid}">${obj.nid}</td>` +
               `<td data-label="IP Address">${obj.ip}</td>` +
               `<td data-label="Frequency">${obj.freq} seconds</td>` +
               `<td data-label="Last Heartbeat">${dt}</td>` +
               `<td data-label="Status"><mark class="${color}">${title}</mark></td></tr>`;
    $(id).children('tbody').append(html);
}

/* Sends an AJAX request to `resource` and call the callback. */
function fetch(resource, callback, element) {
    if (!ui.hasProfile()) {
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
                log.debug('Received response');
                hideStatus();
                callback(element, data);
            }
        });
    }
}

/* Run on load. */
$(function() {
    log.debug('Running module "heartbeats" ...');
    fetch('projects/', populateDropdown, '#heartbeats-pid');
});
