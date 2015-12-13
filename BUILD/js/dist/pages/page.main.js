////////////////////////////////////
// Main dashboard controller. A system might have several pages,
// some might be single-page apps, some are regular pages.

EMC.routes.main = function(){
    "use strict";

    ////////////////////////////////////////////////////////
    // DON Page elements' Caching

    var DOM = { }

    function populateDOM(){
        DOM.scope      = $('#page');
        DOM.sidebar    = $('#sidebar');
        DOM.mainmenu   = DOM.sidebar.find('.mainmenu');
        DOM.pageheader = DOM.scope.find('.pageheader');

        EMC.utilities.checkDOMbinding(DOM);
    }



    ////////////////////////////////////////////////////
    // Page Events

    var events = {
        bind : function(){
            $(document).on('click.route', '[data-href]', events.callbacks.changeRoute);
        },

        callbacks : {
            changeRoute : function(e){
                // make sure the modal will still work if triggered inside the "changeRoute" callback
                if( e.target.dataset && e.target.dataset.modal ){
                    EMC.components.modals.click_show.call(e.target);
                    return false;
                }

                var url = $(this).data('href');
                if( url )
                    Router.navigate(url);
            }
        }
    };


    function viewChange(route, routeData){
        // start the Array from 'protection' item
        var protectionIdx = routeData.indexOf('protection');
        routeData = routeData.slice(protectionIdx, routeData.length);

        // set View
        DOM.scope.attr('data-view', route);
        EMC.utilities.matchRoute(route, routeData);

        componentsLoader.sidebar.instance.set(window.location.pathname);
    }


    ////////////////////////////////////////////////////
    // Page routes

    function routes(){
        // Add routes (might use another router later, this is good for now)
        Router
            .add(/protection\/locations\/(.*)\/(.*)/, function() {
                viewChange('protection', _.values(Router.getFragment().split('/')) );
            })
            .add(/protection\/locations\/(.*)/, function() {
                viewChange('protection', _.values(Router.getFragment().split('/')) );
            })
            .add(/protection\/locations/, function() {
                viewChange('protection', _.values(Router.getFragment().split('/')) );
            })
            .add(function() {
                console.log('default route');
                // temp default route:
                Router.navigate('/protection/locations/united-states');
            })
            .listen();

        Router.check();
    }

    // gets section data (protection, utilization,...)
    function getData(){
        // get URL fragment Array (for breadcrumbs)
        var urlFragmentArr = Router.getFragment().split('/');
        urlFragmentArr.shift();

        // default main view
        var view = urlFragmentArr[0] || 'protection';

        return $.ajax({
            type     : 'GET',
            url      : '/mocks/' + view + '.txt',
            dataType : 'json'
        })
    }

    var componentsLoader = {
        sidebar : {
            instance : null,
            init : function(){
                componentsLoader.sidebar.instance = EMC.components.sidebar(EMC.state.protection);
            }
        }
    }


    ////////////////////////////////////////////////////
    // Initialize page

    function init(){
        $.when( getData() )
            .done(function(res){
                if( !res || !(res instanceof Object) || !res.length ){
                    return;
                }

                EMC.state.protection = res;
                componentsLoader.sidebar.init();

                routes();
            })
            .fail();

        populateDOM();
        events.bind();
    }

    init();
}