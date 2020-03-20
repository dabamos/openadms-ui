/**
 * Module: Profile
 *
 * This module just stores the connection details of a REST service entered in
 * the form in the LocaStorage of the web browser.
 */

/* Returns whether or not the given string contains a valid URL. Taken from:
 * https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url/49849482
 */
function isValidUrl(str) {
    let pattern = new RegExp('^(https?:\\/\\/)?'+           // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+                      // or IPv4 address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+                  // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+                         // query string
        '(\\#[-a-z\\d_]*)?$','i');                          // fragment locator
    return !!pattern.test(str);
}

/* Resets CSS classes. */
function reset() {
    $('#profile-url').removeClass('invalid');
    $('#profile-invalid-url').addClass('hidden');
    $('#profile-success').addClass('hidden');
    $('#profile-deleted').addClass('hidden');
}

/* Removes profile from LocalStorage. */
function remove() {
    store.remove('ui.profile.url');
    store.remove('ui.profile.user');
    store.remove('ui.profile.password');
}

/* Loads profile from LocalStorage and fills form. */
function load() {
    if (store.has('ui.profile.url')) {
        $('#profile-url').val(store.get('ui.profile.url'));
    }
    if (store.has('ui.profile.user')) {
        $('#profile-user').val(store.get('ui.profile.user'));
    }
    if (store.has('ui.profile.password')) {
        $('#profile-password').val(store.get('ui.profile.password'));
    }
}

/* Save connection details in LocalStorage. */
$('#profile-save').click(function() {
    reset();
    let url = $('#profile-url').val();

    if (isValidUrl(url)) {
        /* Save input values to LocalStorage. */
        store.set('ui.profile.url', $('#profile-url').val());
        store.set('ui.profile.user', $('#profile-user').val());
        store.set('ui.profile.password', $('#profile-password').val());
        /* Show message. */
        $('#profile-success').removeClass('hidden');
    } else {
        $('#profile-url').addClass('invalid');
        $('#profile-invalid-url').removeClass('hidden');
    }
});

/* Reload from LocalStorage. */
$('#profile-reload').click(function() {
    reset();
    load();
});

/* Clear form and hide messages. */
$('#profile-clear').click(function() {
    reset();
});

/* Delete profile. */
$('#profile-delete').click(function() {
    reset();
    remove();
    $('#profile-deleted').removeClass('hidden');
});

/* Load from LocalStorage at start-up. */
(function() {
    log.debug('Running module "profile" ...');
    load();
})();
