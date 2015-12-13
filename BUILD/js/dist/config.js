EMC.config = (function(){
    "use strict";

    // setup underscore template
    _.templateSettings = {
        interpolate : /\{\{\=(.+?)\}\}/g,
        escape      : /\{\{\-(.+?)\}\}/g,
        evaluate    : /\{\{(.+?)\}\}/g
    };


    var baseURL = '/api/';

    // if DEV enviourment, set the default AJAX to use JSONP
    if( EMC.DEV ){
        baseURL = 'http://EMC/api/';

        $.ajaxSetup({
            dataType    : 'jsonp',
            crossDomain : true
        });
    }

    return {
        baseURL : baseURL,
        API : {
            locations : baseURL + 'getLocations',
            getData  : baseURL + 'getData',     // [userId]
        },
        // a list of valid routes
        routes : {
            //"location" : routeMatcher("location/:mainLocation/:subLocation/:extra")
        }
    }
})();