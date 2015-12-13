EMC.components.protectionLevel = function(elm, data){
    var promise;  // the request's promise object

    var settings = {
        DOM      : {
            elm : elm
        },
        template : EMC.tmpl("components\\protection-level"),
        endPoint : EMC.config.API.protection_level
    };

    function init(fcb){
        fcb = fcb || onGetDataFail || function(){}; // fail callback

        if( settings.DOM.elm )
            settings.DOM.elm.addClass('loading');

        promise && promise.abort(); // cancel the last request if there was any
        promise = getData();

        $.when( promise )
            .done( render )
            .fail(fcb)
    };

    function getData(){
        // mock data
        if( data )
            return data;

        return $.ajax({
            type        : 'GET',
            url         : EMC.API.baseURL + settings.endPoint,
            data        : data
        })
    };

    function onGetDataFail(){
        if( settings.DOM.elm )
            settings.DOM.elm.removeClass('loading');

        // should write some error message, or at least try again a few times before showing such message
    };

    function render(data){
        if( settings.DOM.elm )
            settings.DOM.elm.removeClass('loading');

        if( !data ) return;

        // settings.DOM.elm
        var HTML = settings.template(data);

        if( settings.DOM.elm )
            settings.DOM.elm.replaceWith(HTML);
    };

    ///////////////////////////////
    init();

    return {
        init    : init,
        getData : getData
    }
};