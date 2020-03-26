/**
 * Module: Logs
 *
 * Lists log messages of given project id, sensor node id, and time period in a
 * table.
 */

let settings = {
    pid: '',                                        // Selected project ID.
    nid: '',                                        // Selected sensor node ID.
    start: moment().subtract(1, 'days').format(),   // Start of time range.
    end: moment().add(1, 'days').format(),          // End of time range.
};

/* Show date range picker. */
$('#logs-dt').daterangepicker({
    autoApply: true,
    autoUpdateInput: true,
    timePicker: true,
    timePicker24Hour: true,
    timePickerSeconds: true,
    startDate: settings.start,
    endDate: settings.end,
    minYear: 2020,
    maxYear: 2100,
    locale: {
        format: 'YYYY/MM/DD HH:mm:ss'
    },
}, function(start, end, label) {
    settings.start = start.format();
    settings.end = end.format();
    fetchLogs(settings.pid, settings.nid, settings.start, settings.end);
});

/* Listen to dropdown changes. */
$('select').on('change', function() {
    $('#logs-button').removeAttr('disabled');

    let id = $(this).attr('id');
    let value = $(this).val();

    switch (id) {
        case 'logs-pid':
            /* Fetch sensor node ids. */
            settings.pid = value;

            showStatus('Fetching sensor node IDs …');
            fetch(`projects/${settings.pid}/nodes/`, null, populateDropdown, '#logs-nid');
        case 'logs-nid':
            /* Fetch sensor log messages. */
            $('#logs-dt').removeAttr('disabled');
            settings.nid = value;

            showStatus('Fetching log messages …');
            fetchLogs(settings.pid, settings.nid, settings.start, settings.end);
    }
});

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
    $('#logs-status').addClass('hidden');

    if ($.isArray(array) && array.length > 0) {
        $(id).children('tbody').empty();
        $.each(array, function() {
            log.debug(`Fetching log messages of pid "${settings.pid}" and nid "${this}" ...`);
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
    $(id).children('tbody').prepend(html);
}

/* Sends an AJAX request to `resource` and calls `callback` with parameters
 * `id` and `data`. */
function fetch(resource, data, callback, id) {
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
            type: 'get',
            data: data,
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

/* Fetches selected log messages from server. */
function fetchLogs(pid, nid, start, end) {
    let $tbody = $('#logs-messages').children('tbody');
    $tbody.empty();
    $tbody.html('<td class="center" colspan="4"><div class="spinner"></div></td>');

    let url = `projects/${pid}/nodes/${nid}/logs/`;
    /* GET parameters `start` and `end`. */
    let data = {
        start: start,
        end: end
    };
    fetch(url, data, populateTable, '#logs-messages');
}

/* Run on load. */
$(function() {
    log.debug('Running module "logs" ...');
    showStatus('Fetching project IDs ...');
    fetch('projects/', null, populateDropdown, '#logs-pid');
});
