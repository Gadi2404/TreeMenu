const EMC = {
	// Everything high-level will be here, right under the namespace

    DOM : {
        $HTML : $(document.documentElement),
        $DOC  : $(document),
        $WIN  : $(window),
        $BODY : $(document.body)
    },

    // development flag,
    state : {
        protection : {}
    },

    DEV : window.location.hostname == 'localhost',

    components : {},

    templates : {},

    tmpl : function(s){
        return _.template(EMC.templates[s + '.html']);
    },

    viewChange : function(viewPath, viewData){
        EMC.DOM.$DOC.trigger('viewChange', [viewPath, viewData]);
    },

	// any global EMC-scope events binding goes here
	events : {
        bind : function(){
    		EMC.DOM.$WIN.on('beforeunload', EMC.events.callbacks.beforeunload);
            EMC.DOM.$DOC.on('click', 'a', function(){
                var url = $(this).attr('href');
                Router.navigate(url);
                return false;
            })

        },

        callbacks : {
            beforeunload : function(){
                EMC.DOM.$BODY.addClass('loading');
            }
        }
	},


    // on page load, before routes are triggered
    preRoutes : function(){
		// load fonts from Google (so the CSS won't block rendering pipeline)
        // requirejs(['css!http://fonts.googleapis.com/css?family=Roboto:300,400,500,700']);

        EMC.utilities.defaultCheckboxes(); // Default back every checkbox and input on the page which might have changed by the user
    },

    // routs manager
    routes : {
        locations  : {},
        protection : {},
        modals     : {
            protection : {}
        },

        initPage : function(){
            var routes = $(document.body).data('init');
            EMC.utilities.matchRoute(routes);
        }
    },

    // puste state history manager
    pushState : (function(){
       var historyStatesCounter = 0;

        function update(action, url, data){
            action = action || 'push';
            historyStatesCounter++;

            window.history[action + 'State']( data, null , url );
        }

        window.onpopstate = function(event) {
            if( !event.state ){
                return;
            }

            console.log(event);

            if( historyStatesCounter )
                historyStatesCounter--;
        };

        return {
            update : update
        }
    })(),

    init : function(){
		EMC.events.bind(); // high-level events
        EMC.preRoutes();
        EMC.routes.initPage();
    }
};

