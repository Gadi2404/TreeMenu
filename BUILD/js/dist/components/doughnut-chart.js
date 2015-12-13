EMC.components.Doughnut = function(settings = {}){
    var template = EMC.tmpl("components\\plotting\\doughnut");
    this.settings = $.extend({}, { radius:[70,70], value:0 }, settings);
    this.compiledTemplate = template(this.settings);
    this.elm = $(this.compiledTemplate);

    // setTimeout( this.setValue.bind(this), 0 );
};

EMC.components.Doughnut.prototype = {
    render : function(){
    },

    setValue: function (value = this.settings.value){
        if( !value || value < 0 || value > 100 ){
            console.warn('no value: ', value);
            return false;
        }

        var circle    = this.elm.find('.circle-front'),
            dasharray = 2 * Math.PI * this.settings.radius[1];

        circle.css('stroke-dashoffset', dasharray * (1 - (value/100)) + 'px');

        return this;
    }
};
