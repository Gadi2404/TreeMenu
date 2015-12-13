EMC.components.vBars = function(elm){
    this.DOM = {
        scope : elm // the component placeholder
    }

    // mock data
    this.mock = {
        title : 'Protection history',
        avarage : 0,
        items : [
            {
                riskLevel : '',
                value     : Math.floor(Math.random() * 100) + 1,
                label     : 'jan'
            },
            {
                riskLevel : '',
                value     : Math.floor(Math.random() * 100) + 1,
                label     : 'feb'
            },
            {
                riskLevel : '',
                value     : Math.floor(Math.random() * 100) + 1,
                label     : 'mar'
            },
            {
                riskLevel : '',
                value     : Math.floor(Math.random() * 100) + 1,
                label     : 'apr'
            },
            {
                riskLevel : '',
                value     : Math.floor(Math.random() * 100) + 1,
                label     : 'may'
            },
            {
                riskLevel : '',
                value     : Math.floor(Math.random() * 100) + 1,
                label     : 'jun'
            },
            {
                riskLevel : '',
                value     : Math.floor(Math.random() * 100) + 1,
                label     : 'jul'
            },
            {
                riskLevel : '',
                value     : Math.floor(Math.random() * 100) + 1,
                label     : 'aug'
            },
            {
                riskLevel : '',
                value     : Math.floor(Math.random() * 100) + 1,
                label     : 'sep'
            },
            {
                riskLevel : '',
                value     : Math.floor(Math.random() * 100) + 1,
                label     : 'oct'
            },
            {
                riskLevel : '',
                value     : Math.floor(Math.random() * 100) + 1,
                label     : 'nov'
            },
            {
                riskLevel : '',
                value     : Math.floor(Math.random() * 100) + 1,
                label     : 'dec'
            }
        ]
    };

    var that = this;

    this.mock.items.forEach(function(item){
        that.mock.avarage = (that.mock.avarage + item.value) / 2;

        if( item.value == 100 )
            item.riskLevel = 'none';
        else if( item.value < 50 )
            item.riskLevel = 'high';
        else if(item.value >= 50)
            item.riskLevel = 'medium';
    });

    this.init();
};

EMC.components.vBars.prototype = {
    template : EMC.tmpl("components\\vBars"),

    init : function(){
        if( this.DOM.scope )
            this.DOM.scope.addClass('loading');

        this.promise && this.promise.abort(); // cancel the last request if there was any
        this.promise = this.getData(this.mock);

        $.when( this.promise )
            .done( this.render.bind(this) )
            .fail( this.onGetDataFail )
    },

    getData : function(request){
        return request || $.ajax({
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

        var HTML = $( this.template(data) );

        if( this.DOM.scope )
            this.DOM.scope.replaceWith(this.DOM.scope = HTML);
        else
            console.warn('no DOM scope found');

        this.animate();
    },

    // animate bars
    animate : function(){
        this.DOM.scope.find('.bar').each(function(i){
            var bar = this;
            setTimeout(function(){
                bar.style.height = bar.dataset.to;
            }, i * 50 + 200);
        })
    }
}