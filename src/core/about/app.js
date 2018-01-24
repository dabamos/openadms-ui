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
about.views.Version = Backbone.View.extend({
    el: '#version',
    render: function() {
        // Output OpenADMS UI version.
        $(this.el).empty();
        $(this.el).append(window.version);
        return this;
    }
});

/* Instantiate and render the view. */
about.views.version = new about.views.Version();
about.views.version.render();