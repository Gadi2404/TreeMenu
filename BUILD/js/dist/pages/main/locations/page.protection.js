// **** EVERYTHING ON THIS FILE IS TEMPORARY BECAUSE THE STRUCTURE OF THE PAGES IS STILL UNKOWN SO I CAN'T STRUCTURE THE CODE YET ***

EMC.routes.protection = function(viewPath){
    "use strict";

    var promise,
        pageTemplate = EMC.tmpl("protection"),
        pageData,
        templateHelpers,
        componentsLoader;


    var DOM = { scope : $('#page') };

    // set loading state to the page
    DOM.scope.addClass('loading');

    ////////////////////////////////////////////////
    // Get page data from server (deprecated, this data, for all protection pages is coming in one big JSON)
    // function getData(){
    //     return $.ajax({
    //         type : 'GET',
    //         url  : '/mocks/locations.' + viewPath.join('.') + '.json'
    //     })
    // };

    // function onGetDataFail(){
    //     settings.DOM.elm.removeClass('loading');
    // };

    function render(data){
        DOM.scope.removeClass('loading');

        if( !data ) return;
        pageData = data;

        DOM.template = $( pageTemplate(data) );
        populateDOM();

        // settings.DOM.elm
        DOM.scope.html( DOM.template );

        return data;
    };

    function postRender(){
        for(var i in componentsLoader){
            if( componentsLoader.hasOwnProperty(i) )
                componentsLoader[i].init();
        }


        events.bind();

        // must be last:
        EMC.utilities.scriptsTemplates(DOM.scope);
    }





    /////////////////////////////////
    // DOM caching
    function populateDOM(){
        DOM.template             = $(DOM.template); //jQuerify it

        DOM.dateRange            = DOM.template.find('.dateRangeInput');
        DOM.summaryChildrenWrap  = DOM.template.find('.summaryChildrenWrap');
        DOM.protectionLevel      = DOM.template.find('.protectionLevel');
        DOM.protectionHistory    = DOM.template.find('.protectionHistory');
        DOM.breadcrumbs          = DOM.template.filter('.breadcrumbs');
        DOM.childrenViewBtns     = DOM.template.find('.childrenViewBtns');
        DOM.protectionGaps       = DOM.template.find('.protectionGaps');

        EMC.utilities.checkDOMbinding(DOM);
    };


    var events = {
        bind : function(){
            DOM.childrenViewBtns.on('click', 'button', events.callbacks.childrenView);

            $(window).on('scroll', events.callbacks.onScroll);
        },

        callbacks : {
            childrenView : function(e){
                var button = $(this),
                    view = button.data('view');

                if( button.hasClass('active') )
                    return;

                // mark current button as "active"
                button.addClass('active').siblings().removeClass('active');

                // change component view
                componentsLoader.summaryChildren.instance.render(null, view);
                EMC.utilities.scriptsTemplates(DOM.scope);
            },

            onScroll : function(e){
                var scrollY = window.scrollY;

                if( scrollY < DOM.breadcrumbs.data('startPost') )
                    DOM.breadcrumbs.removeClass('fixed');
                else if( DOM.breadcrumbs[0].getBoundingClientRect().top < 10 )
                   DOM.breadcrumbs.addClass('fixed');
            }
        }
    }


    // page components
    componentsLoader = {
        breadcrumbs : {
            instance : null,
            init : function(){
                // add component to the DOM and re-save DOM pointer to the new replaced HTML element
                DOM.breadcrumbs.replaceWith( DOM.breadcrumbs = componentsLoader.breadcrumbs.instance.DOM.scope );

                var clientRect = DOM.breadcrumbs[0].getBoundingClientRect();

                DOM.breadcrumbs.data({
                                        'startPost' : DOM.breadcrumbs.offset().top - 10,
                                        'height'    : clientRect.height
                                    });
            },
            add : function(data){
                componentsLoader.breadcrumbs.instance.add.call( componentsLoader.breadcrumbs.instance, data );
            }
        },

        rangePicker : {
            init : function(){
                var elm = DOM.dateRange;
                elm.rangePicker({ minDate:[2,2009], maxDate:[9,2015], RTL:true })
                        // subscribe to the "done" event after user had selected a date
                        .on('datePicker.done', function(e, result){
                            if( result instanceof Array )
                                console.log(new Date(result[0][1], result[0][0] - 1), new Date(result[1][1], result[1][0] - 1));
                            else
                                console.log(result);
                        });

                elm.rangePicker({ setDate:[[1,2015],[12,2015]], closeOnSelect:false });
            }
        },

        protectionLevel : {
            init : function(){
                EMC.components.protectionLevel(DOM.protectionLevel, pageData);
            }
        },

        summaryChildren : {
            instance : null,
            init : function(){
                if( pageData.items ){

                    pageData.items.forEach(function(item){
                        item.path = pageData.path + item.name.split(' ').join('-');
                    });
                    var mock = _.sortBy(pageData.items, 'protectionLevel');

                    componentsLoader.summaryChildren.instance = EMC.components.summaryChildren(DOM.summaryChildrenWrap, {mock:mock}, pageData);
                }
            }
        },

        protectionGaps : {
            instance : null,
            init : function(){
                if( !pageData.items ){
                    EMC.routes.protection.gaps(DOM.protectionGaps, viewPath);
                }
            }
        },

        protectionHistory : {
            instance : null,
            init : function(){
                var elm = DOM.protectionHistory.find('.vBars');
                componentsLoader.protectionHistory.instance = new EMC.components.vBars(elm);
            }
        },

        groupItem1 : {
            instance : null,
            init : function(){
                var elm = DOM.scope.find('.groupItem1');
                componentsLoader.groupItem1.instance = new EMC.components.hBars(elm);
            }
        },

        changeRate : {
            instances : {
                jobs   : null,
                client : null
            },

            init : function(){
                DOM.changeRateJobs = DOM.scope.find('.changeRate--jobs');
                DOM.changeRateClient = DOM.scope.find('.changeRate--client');

                var instances = componentsLoader.changeRate.instances;

                var jobsMock = {
                    title  : 'Jobs Success',
                    value  : 95,
                    change : 'up'
                }

                var clientMock = {
                    title  : 'Client Success',
                    value  : 70,
                    change : 'down'
                }

                instances.jobs   = new EMC.components.changeRate(DOM.changeRateJobs, { mock: jobsMock });
                instances.client = new EMC.components.changeRate(DOM.changeRateClient, { mock: clientMock });
            }
        }
    };


    function init(){
        // promise && promise.abort(); // cancel the last request if there was any
        // promise = getData();

        // $.when( promise )
        //     .then(render)
        //     .done(postRender)
        //     .fail(onGetDataFail);

        // create Breadcrumbs instance
        componentsLoader.breadcrumbs.instance = new EMC.components.Breadcrumbs();

        // get the object needed for this page (from the main system data structure) and run a callback function
        pageData = EMC.utilities.getObjectByPath( EMC.state.protection, viewPath.slice(1, viewPath.length), componentsLoader.breadcrumbs.add );

        if( !pageData ){
            console.log('pageData is wrong or undefined: ', pageData);
            return false;
        }

        render(pageData);
        postRender();
    }

    init();
}