Logger.debug(`Started app "confed"`);

// Semantic UI.
$('.ui.dropdown').dropdown({
    on: 'click'
});
$('.ui.buttons .dropdown.button').dropdown({
    action: 'combo'
});
$('.menu .item').tab();

/* Class representing a module. */
class Module {
    /**
     * Creates a module.
     * @param {Object}   meta      - Meta information recarding the module.
     * @param {Object}   model     - Data model.
     * @param {Object}   schema    - JSON schema.
     * @param {Function} validator - JavaScript validator function..
     * @param {Function} script    - JavaScript function to run.
     * @param {string}   form      - HTML form.
     */
    constructor(meta, model, schema, validator, script, form) {
        this.name = meta.name;

        this.meta = meta;
        this.model = model;
        this.schema = schema;

        this.compiled = _.template(form);

        this.validate = new Function(validator);
        this.run = new Function(script);
    }
}

var modules = {}

/**
 * Loads modules from a path and stores them in a given object.
 * @param  {string} rootPath - Path the load the apps from.
 * @param  {Object} obj      - Object to store the apps in.
 * @return {deferred}        - Deferred object.
 */
function loadModules(rootPath, obj) {
    return $.ajax({
        url: urljoin(rootPath, 'modules.json'),
        dataType: 'json'
    }).then(function(data) {
        var moduleNames = data.modules;

        return $.when.apply($, moduleNames.map(function(moduleName) {
            var path = urljoin(rootPath, moduleName);

            return $.when(
                $.ajax({
                    url: urljoin(path, 'meta.json'),
                    dataType: 'json'
                }),
                $.ajax({
                    url: urljoin(path, 'model.json'),
                    dataType: 'json'
                }),
                $.ajax({
                    url: urljoin(path, 'schema.json'),
                    dataType: 'json'
                }),
                $.ajax({
                    url: urljoin(path, 'module.js'),
                    dataType: 'script'
                }),
                $.ajax({
                    url: urljoin(path, 'validator.js'),
                    dataType: 'script'
                }),
                $.ajax({
                    url: urljoin(path, 'form.html'),
                    dataType: 'html'
                })
            ).then(function(meta, model, schema, script, validator, form) {
                var module = new Module(_.first(meta),
                                        _.first(model),
                                        _.first(schema),
                                        _.first(script),
                                        _.first(validator),
                                        _.first(form));
                obj[module.name] = module;
                Logger.debug(`Loaded module "${module.name}"`);
            });
        }));
    });
}

