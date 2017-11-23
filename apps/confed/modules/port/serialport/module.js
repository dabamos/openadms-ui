var editor = {};

editor.ModuleModel = Backbone.Model.extend({
    initialize: function(data){
        this.data = data;
    }
});

editor.ComponentView = Backbone.View.extend({
    el: '#serialport-form',
    render: function(){
        return this;
    },
    events: {
        'change input#serialport-port':                'updatePort',
        'change input#serialport-baudrate':            'updateBaudrate',
        'change input#serialport-bytesize':            'updateByteSize',
        'change input#serialport-parity':              'updateParity',
        'change input#serialport-stopbits':            'updateStopBits',
        'change input#serialport-timeout':             'updateTimeout',
        'change input#serialport-softwareflowcontrol': 'updateSoftwareFlowControl',
        'change input#serialport-hardwareflowcontrol': 'updateHardwareFlowControl',
        'change input#serialport-maxattempts':         'updateMaxAttempts'
    },
    toBoolean: function(value){
        return (value == 'on') ? true : false;
    },
    updatePort: function(){
        this.model.set('port', this.$('#serialport-port').val());
    },
    updateBaudrate: function(){
        this.model.set('baudRate', Number(this.$('#serialport-baudrate').val()));
    },
    updateByteSize: function(){
        this.model.set('byteSize', Number(this.$('#serialport-bytesize').val()));
    },
    updateParity: function(){
        this.model.set('parity', this.$('#serialport-parity').val());
    },
    updateStopBits: function(){
        this.model.set('stopBits', Number(this.$('#serialport-stopbits').val()));
    },
    updateTimeout: function(){
        this.model.set('timeout', Number(this.$('#serialport-timeout').val()));
    },
    updateSoftwareFlowControl: function(){
        this.model.set('softwareFlowControl', this.toBoolean(this.$('#serialport-softwareflowcontrol').val()));
    },
    updateHardwareFlowControl: function(){
        this.model.set('hardwareFlowControl', this.toBoolean(this.$('#serialport-hardwareflowcontrol').val()));
    },
    updateMaxAttempts: function(){
        this.model.set('maxAttempts', Number(this.$('#serialport-maxattempts').val()));
    },
});

editor.RawView = Backbone.View.extend({
    el: '#mypreview',
    initialize: function(){
        // Listen for changes of the model.
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
        this.render();
    },
    render: function(){
        // Insert model data into textarea.
        this.$el.val(JSON.stringify(this.model, null, 2));
        return this;
    }
});

editor.moduleModel = new editor.ModuleModel(data);
editor.componentView = new editor.ComponentView({model: editor.moduleModel});
editor.rawView = new editor.RawView({model: editor.moduleModel});
