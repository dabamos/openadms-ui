/**
 * Module: Status
 *
 * Displays the status of a remote OpenADMS Server instance. Requires a valid
 * profile in LocalStorage.
 *
 * I'm to lazy to create the appropriate Backbone.js models and views. jQuery
 * will do the job instead for now.
 */

/* Reset the status table. */
function resetForm() {
    $('#status-status').html('<mark>unknown</mark>');
    $('#status-server-url').html('N/A');
    $('#status-api-url').html('N/A');
    $('#status-api-user').html('N/A');
    $('#status-database-name').html('N/A');
    $('#status-server-time').html('N/A');
    $('#status-server-uptime').html('N/A');
    $('#status-server-version').html('N/A');

    $('#status-profile-invalid').addClass('hidden');
}

/**
 * Sends an AJAX request to the OpenADMS Server instance defined in the
 * profile, and displays retrieved status information in the HTML table using
 * jQuery.
 */
function request() {
    resetForm();

    if (ui.hasProfile()) {
        log.debug('Profile found');

        /* Read profile from LocalStorage. */
        let url = store.get('ui.profile.url');
        let user = store.get('ui.profile.user');
        let password = store.get('ui.profile.password');
        let api = urljoin(url, ui.API_ENTRY);

        /* Set URLs in table. */
        $('#status-server-url').html(`<code>${url}</code>`);
        $('#status-api-url').html(`<code>${api}</code>`);
        $('#status-api-user').html(user);

        /* Send HTTP request. */
        log.debug(`Requesting "${api}" ...`);
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
                    $('#status-status').html('<mark class="secondary">unknown error</mark>');
                },
                401: function(response) {
                    $('#status-status').html('<mark class="secondary">invalid user name or password</mark>');
                },
                404: function(response) {
                    $('#status-status').html('<mark class="secondary">not found</mark>');
                },
                500: function(response) {
                    $('#status-status').html('<mark class="secondary">internal server error</mark>');
                },
            },
            success: function(data, status, xhr) {
                log.debug('Received response');
                let database = data.database || 'N/A';
                let uptime = data.uptime || 'N/A';
                let timestamp = data.timestamp || 'N/A';
                let version = data.version || 'N/A';

                $('#status-status').html('<mark class="tertiary">online</mark>');
                $('#status-database-name').html(database);
                $('#status-server-time').html(timestamp);
                $('#status-server-uptime').html(uptime);
                $('#status-server-version').html(version);
            }
        });
    } else {
        log.error('Profile incomplete or missing');
        $('#status-profile-invalid').removeClass('hidden');
    }
}

/* Refresh button click. */
$('#status-refresh').click(function() {
    request();
});

/* Run on load. */
$(function() {
    log.debug('Running module "status" ...');
    request();
});
