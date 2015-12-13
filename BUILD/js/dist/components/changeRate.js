EMC.components.changeRate = function(elm, settings){
    this.DOM = {
        scope : elm // the component placeholder
    }

    this.settings = $.extend({}, settings)

    this.init();
};

EMC.components.changeRate.prototype = {
    template : EMC.tmpl("components\\changeRate"),

    init : function(){
        if( this.DOM.scope )
            this.DOM.scope.addClass('loading');

        this.promise && this.promise.abort(); // cancel the last request if there was any
        this.promise = this.getData();

        $.when( this.promise )
            .done( this.render.bind(this) )
            .fail( this.onGetDataFail )
    },

    getData : function(){
        if( this.settings.mock )
            return this.settings.mock;

        return $.ajax({
            type        : 'GET',
            url         : EMC.API.baseURL + settings.endPoint,
            data        : data,
            dataType    : 'jsonp',
            crossDomain : true
        })
    },

    onGetDataFail : function(){
        if( this.DOM.scope )
            this.DOM.scope.removeClass('loading');

        // should write some error message, or at least try again a few times before showing such message
    },

    render : function(data){
        if( this.DOM.scope )
            this.DOM.scope.removeClass('loading');

        if( !data ) return;

        var HTML = $(this.template(data));

        if( this.DOM.scope )
            this.DOM.scope.replaceWith(this.DOM.scope = HTML);
        else
            console.warn('no DOM scope found');

        this.animate();
    },

    // animate bars
    animate : function(){
        var percentElm = this.DOM.scope.find('.value');

        if( percentElm.data('to') )
            var task = new EMC.utilities.Task({ el:percentElm[0], duration:0.8, easingFunc:function(t){ return 1+(--t)*t*t*t*t; } });
    }
}