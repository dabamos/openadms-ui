/* Removes profile from LocalStorage. */
function remove() {
    store.remove('ui.profile.url');
    store.remove('ui.profile.user');
    store.remove('ui.profile.password');
}

/* Shows a status message. */
function showStatus(str) {
    log.info(str);
    $('#settings-status').removeClass('hidden');
    $('#settings-status').html(str);
}

$('#settings-delete-profile').click(function() {
    remove();
    showStatus('Profile has been deleted');
});
