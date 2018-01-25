/**
 * @file      About page.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2018
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

let about = {};
about.views = {};

/**
 * View displays the OpenADMS UI version number inside a table cell.
 */
about.views.VersionView = Backbone.View.extend({
    el: '#version',
    render: function() {
        // Output OpenADMS UI version.
        $(this.el).empty();
        $(this.el).append(version.toFixed(1));
        return this;
    }
});

/* Instantiate and render the view. */
about.views.versionView = new about.views.VersionView();
about.views.versionView.render();