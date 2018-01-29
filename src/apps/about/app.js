/**
 * @file      The about page.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2018
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

let About = {};
About.Views = {};

/**
 * View displays the OpenADMS UI version number inside a table cell.
 */
About.Views.VersionView = Backbone.View.extend({
    el: '#version',
    render: function() {
        // Output OpenADMS UI version.
        $(this.el).empty();
        $(this.el).append(UI.version.toFixed(1));
        return this;
    }
});

/* Instantiate and render the view. */
let version  = new About.Views.VersionView();
version.render();