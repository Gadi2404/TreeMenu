EMC.components.hBars = function(elm){
    this.DOM = {
        scope : elm // the component placeholder
    }

    this.init();
};

EMC.components.hBars.prototype = {
    template : EMC.tmpl("components\\hBars"),

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
        // mock data
        return {
            items : [
                {
                    value        : 103,
                    name         : 'Unprotected Clients',
                    percentValue : 8
                },
                {
                    value        : 103,
                    name         : 'Protected',
                    percentValue : 50
                },
                {
                    value        : 4322,
                    name         : "Objects Meeting RPO's",
                    percentValue : 93
                }
            ]
        };

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

        var HTML = $( this.template(data) ),
            DOMscopeClass = this.DOM.scope[0].className;

        // add original component placeholder classes to the template
        HTML.addClass(DOMscopeClass);

        if( this.DOM.scope )
            this.DOM.scope.replaceWith(this.DOM.scope = HTML);
        else
            console.warn('no DOM scope found');

        this.animate();
    },

    // animate bars
    animate : function(){
        this.DOM.scope.find('.hBars__bar').each(function(i){
            var bar = this;
            setTimeout(function(){
                bar.style.width = bar.dataset.to;
            }, i * 150 + 100);
        })
    }
}