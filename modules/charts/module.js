/**
 * Module: Charts
 *
 * Plotting timeseries fetched from an OpenADMS Server instance in a plotly
 * chart using jQuery. A little ugly, but gets the job done.
 */

let settings = {
    pid: '',    // Selected project ID.
    nid: '',    // Selected sensor node ID.
    sensor: '', // Selected sensor name.
    target: ''  // Selected target name.
};

$('#charts-button').click(function() {
    $(this).attr('disabled', '');
    fetchCSV(`projects/${settings.pid}/nodes/${settings.nid}/sensors/${settings.sensor}/targets/${settings.target}/observations/`);
});

/* Listen to dropdown changes. */
$('select').on('change', function() {
    $('#charts-button').removeAttr('disabled');

    let id = $(this).attr('id');
    let value = $(this).val();

    switch (id) {
        case 'charts-pid':
            settings.pid = value;
            showStatus('Fetching sensor node IDs ...');
            fetch(`projects/${settings.pid}/nodes/`, populateDropdown, '#charts-nid');
        case 'charts-nid':
            settings.nid = value;
            showStatus('Fetching sensor names ...');
            fetch(`projects/${settings.pid}/nodes/${settings.nid}/sensors/`, populateDropdown, '#charts-sensor');
        case 'charts-sensor':
            settings.sensor = value;
            showStatus('Fetching target names ...');
            fetch(`projects/${settings.pid}/nodes/${settings.nid}/sensors/${settings.sensor}/targets/`, populateDropdown, '#charts-target');
        case 'charts-target':
            settings.target = value;
            $('#charts-dt').removeAttr('disabled');
    }
});

/* Show date range picker. */
$('#charts-dt').daterangepicker({
    autoApply: true,
    autoUpdateInput: true,
    timePicker: true,
    timePicker24Hour: true,
    timePickerSeconds: true,
    startDate: moment().startOf('hour'),
    endDate: moment().startOf('hour').add(12, 'hour'),
    minYear: 2020,
    maxYear: 2100,
    locale: {
        format: 'YYYY/MM/DD HH:mm:ss'
    },
}, function(start, end, label) {
    log.debug('A new date selection was made: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
});

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
function populateDropdown(id, array) {
    $('#charts-status').addClass('hidden');
    $(id).removeAttr('disabled');

    if ($.isArray(array) && array.length > 0) {
        let $dropdown = $(id);
        $dropdown.empty();

        $.each(array, function() {
            $dropdown.append($("<option>").val(this).text(this)).trigger('change');
        });
    }
}

/* Sends an AJAX request to `resource` and populates the dropdown list of given `id`. */
function fetch(resource, callback, id) {
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

function fetchCSV(resource) {
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
            timeout: 10000,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Basic ' + btoa(user + ':' + password));
            },
            headers:{
                'Accept': 'text/csv',
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
                log.debug('Received CSV');
                log.debug(data);
            }
        });
    }
}

function showChart() {
    /* The plotly.js layout. */
    let layout = {
        paper_bgcolor: 'transparent',
        hovermode: 'closest',
        autosize: true,
        font: {
            family: 'sans-serif',
            size: 12,
            color: '#212121',
        },
        margin: {
            autoexpand: false,
            l: 50,
            r: 25,
            b: 50,
            t: 25,
            pad: 0
        },
        showlegend: true,
        xaxis: {
            showline: true,
            showgrid: true,
            showticklabels: true,
            ticks: 'outside',
            title: 'Time',
            type: 'date'
        },
        yaxis: {
            showline: true,
            title: 'N/A',
        }
    };

    /* The plotly.js chart options. */
    let options = {
        displaylogo: false,
        modeBarButtonsToRemove: ['sendDataToCloud'],
        responsive: true,
        scrollZoom: true,
        toImageButtonOptions: {
            format: 'svg', // one of png, svg, jpeg, webp
            filename: 'plot',
            height: 600,
            width: 2000,
            scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
        }
    };

    /* The plotly.js chart data. */
    let data = {
        x: [],
        y: [],
        text: [],
        type: 'lines',
        name: 'Temperature &amp; Pressure',
        line: {
            color: 'rgb(19, 84, 122)',
            width: 1
        }
    };

    Plotly.newPlot('charts-plotly', [data], layout, options);
}

/* Run on load. */
$(function() {
    log.debug('Running module "charts" ...');
    showStatus('Fetching project IDs ...');
    fetch('projects/', populateDropdown, '#charts-pid');
    showChart();
});
