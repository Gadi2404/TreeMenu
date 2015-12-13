'use strict';

var EMC = {
    // Everything high-level will be here, right under the namespace

    DOM: {
        $HTML: $(document.documentElement),
        $DOC: $(document),
        $WIN: $(window),
        $BODY: $(document.body)
    },

    // development flag,
    state: {
        protection: {}
    },

    DEV: window.location.hostname == 'localhost',

    components: {},

    templates: {},

    tmpl: function tmpl(s) {
        return _.template(EMC.templates[s + '.html']);
    },

    viewChange: function viewChange(viewPath, viewData) {
        EMC.DOM.$DOC.trigger('viewChange', [viewPath, viewData]);
    },

    // any global EMC-scope events binding goes here
    events: {
        bind: function bind() {
            EMC.DOM.$WIN.on('beforeunload', EMC.events.callbacks.beforeunload);
            EMC.DOM.$DOC.on('click', 'a', function () {
                var url = $(this).attr('href');
                Router.navigate(url);
                return false;
            });
        },

        callbacks: {
            beforeunload: function beforeunload() {
                EMC.DOM.$BODY.addClass('loading');
            }
        }
    },

    // on page load, before routes are triggered
    preRoutes: function preRoutes() {
        // load fonts from Google (so the CSS won't block rendering pipeline)
        // requirejs(['css!http://fonts.googleapis.com/css?family=Roboto:300,400,500,700']);

        EMC.utilities.defaultCheckboxes(); // Default back every checkbox and input on the page which might have changed by the user
    },

    // routs manager
    routes: {
        locations: {},
        protection: {},
        modals: {
            protection: {}
        },

        initPage: function initPage() {
            var routes = $(document.body).data('init');
            EMC.utilities.matchRoute(routes);
        }
    },

    // puste state history manager
    pushState: (function () {
        var historyStatesCounter = 0;

        function update(action, url, data) {
            action = action || 'push';
            historyStatesCounter++;

            window.history[action + 'State'](data, null, url);
        }

        window.onpopstate = function (event) {
            if (!event.state) {
                return;
            }

            console.log(event);

            if (historyStatesCounter) historyStatesCounter--;
        };

        return {
            update: update
        };
    })(),

    init: function init() {
        EMC.events.bind(); // high-level events
        EMC.preRoutes();
        EMC.routes.initPage();
    }
};
"use strict";

EMC.templates = {
  "protection-gaps-table.html": "<table class='protectionGaps table table--fixed'>\r\n    <colgroup>\r\n        <col>\r\n        <col>\r\n        <col>\r\n    </colgroup>\r\n    <thead>\r\n        <tr>\r\n            <th><div class='sortBtn' data-sort='string' data-col='0'><span>Host</span></div></th>\r\n            <th>\r\n                <div class='sortBtn' data-sort='string' data-col='1'><span>Type</span></div>\r\n                <label class='dropDownMenuLabel filter' data-name='type'>\r\n                    <input type='checkbox'>\r\n                    <i class='icon-filter' title='filter by'></i>\r\n                    <div class='dropDownMenu'>\r\n                        {{ typeFilter.forEach(function(typeName, i){ }}\r\n                            <a data-filter-by='{{= typeName }}'>{{= typeName }}</a>\r\n                        {{ }); }}\r\n                    </div>\r\n                </label>\r\n            </th>\r\n            <th>\r\n                <div class='sortBtn' data-sort='string' data-col='2'><Span>Category</Span></div>\r\n                <label class='dropDownMenuLabel filter' data-name='category'>\r\n                    <input type='checkbox'>\r\n                    <i class='icon-filter' title='filter by'></i>\r\n                    <div class='dropDownMenu'>\r\n                        {{ categoryFilter.forEach(function(categoryName, i){ }}\r\n                            <a data-filter-by='{{= categoryName }}'>{{= categoryName }}</a>\r\n                        {{ }); }}\r\n                    </div>\r\n                </label>\r\n            </th>\r\n        </tr>\r\n    </thead>\r\n    <tbody>\r\n        {{ items.forEach(function(item, i){ }}\r\n        <tr>\r\n            <td>{{= item.host }}</td>\r\n            <td>{{= item.type }}</td>\r\n            <td class='category'>{{= item.category }}</td>\r\n        </tr>\r\n        {{ }); }}\r\n    </tbody>\r\n</table>",
  "protection-gaps.html": "<div class='protectionGaps'>\r\n    <header class='header--2'>\r\n        <h2>protection gaps categories {{= name ? \"- \" + name[0].split('-').join(' ') : '' }}</h2>\r\n    </header>\r\n    <div>\r\n        {{ if( isModal ){ }}\r\n        <component class='protectionLevel'></component>\r\n        {{ } }}\r\n        <div class='segmentsChartWrap'></div>\r\n    </div>\r\n    <header class='header--2'>\r\n        <h2>protection gaps details</h2>\r\n    </header>\r\n    <div class='protectionGapsTableWrap'>\r\n        <component class='protectionGapsTable {{= isModal ? \"table--fixed-header\" : \"\" }}'></component>\r\n    </div>\r\n</div>",
  "protection.html": "<component class='breadcrumbs'></component>\r\n<header class='page__header'>\r\n    <button class='btn btn--1 icon-star addToFavorites' title='Save to favorites'></button>\r\n    <button class='btn btn--1 icon-share-alt shareBtn' title='Share report'></button>\r\n    <span class='lastUpdate'>Last update: 3:44PM, NOV 10, 2015</span>\r\n    <h1 class='page__title'>{{= name }} Summary</h1>\r\n</header>\r\n\r\n<div class='page__inner'>\r\n    <div class='page__inner__summary'>\r\n        <component class='protectionLevel'></component>\r\n        <div class='summaryMetrics'>\r\n            <div class='protectionHistory'>\r\n                <header>\r\n                    <div class='dateRange'>\r\n                        <input class='dateRangeInput' title='Change report time range' type='text' placeholder='Date of inquery' value='' readonly />\r\n                    </div>\r\n                    <h2 class='title'>Protection History</h2>\r\n                </header>\r\n                <component class='vBars'></component>\r\n            </div>\r\n            <div class='summaryMetricsGroup'>\r\n                <component class='groupItem1'></component>\r\n                <div class=\"changeRateGroup\">\r\n                    <component class='changeRate changeRate--jobs'></component>\r\n                    <component class='changeRate changeRate--client'></component>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n    <label for='page__inner__summary' class='resizeToggler'><span class='btn--2'></span></label>\r\n\r\n    {{ if( typeof items !== 'undefined' && items.length ){ }}\r\n    <section class='childrenSection'>\r\n        <header class='childrenSection__header'>\r\n            <div class='childrenViewBtns'>\r\n                <!--<button class='btn btn--2 icon-line-chart'></button>-->\r\n                <button class='btn btn--2 childrenViewBtn-boxes icon-circle active' data-view='boxes'></button>\r\n                <button class='btn btn--2 childrenViewBtn-list icon-list' data-view='table'></button>\r\n            </div>\r\n            <h2 class='childrenSection__header__title'>Sub Groups of <span>{{= name }}</span></h2>\r\n        </header>\r\n\r\n        <div class='summaryChildrenWrap'></div>\r\n    </section>\r\n    {{ } else if( protectionLevel != 100 ){ }}\r\n    {{= EMC.tmpl(\"protection-gaps\")({ \"isModal\":false }) }}\r\n    {{ } }}\r\n</div>",
  "sidemenu.html": "{{ items.forEach(function(item){ }}\r\n    {{ if( item.items ){ }}\r\n    <dl>\r\n        <dt><a href=\"{{= path + item.name.split(' ').join('-').toLowerCase() }}\" class='{{= helpers.riskLevel(item) }}'>{{= item.name }}</a></dt>\r\n        {{ item.items.forEach(function(subItem){ }}\r\n            {{ if( subItem.items ){ }}\r\n            <dd>{{= template({ items:[subItem], template:template, helpers:helpers, path:path + item.name.split(' ').join('-').toLowerCase() + '/' }) }}</dd>\r\n            {{ } else { }}\r\n            <dd><a href=\"{{= path + item.name.split(' ').join('-').toLowerCase() + '/' + subItem.name.split(' ').join('-').toLowerCase() }}\" class='mainmenu__item {{= helpers.riskLevel(subItem) }}'><span>{{= subItem.name }}</span></a></dd>\r\n            {{ } }}\r\n        {{ }) }}\r\n    </dl>\r\n    {{ } else{ }}\r\n    <a href=\"{{= path + item.name.split(' ').join('-').toLowerCase() }}\" class='mainmenu__item {{= helpers.riskLevel(item) }}'><span>{{= item.name }}</span></a>\r\n    {{ } }}\r\n{{ }) }}",
  "summary-children-box-item.html": "<div class=\"summaryChildren boxesGrid\">\r\n    {{ items.forEach(function(item, i){ }}\r\n    <a href='{{= item.path.toLowerCase() }}' class='colItem summaryChildren__item {{= \"risk-level--\" + item.riskLevel }}'>\r\n        <header>\r\n            <h3>{{= item.name }}</h3>\r\n        </header>\r\n        <div class='doughnutChart'>\r\n            <script type='js/template-doughnut'>\r\n                { \"value\" : {{= item.protectionLevel }}, \"radius\":[70,68] }\r\n            </script>\r\n            <div class='info'>\r\n                <span class='percent' data-to='{{= item.protectionLevel }}'>0</span>\r\n                <span class='status'>Protected</span>\r\n            </div>\r\n        </div>\r\n        <div class=\"riskLevelWrap severityMark severityMark--{{= item.riskLevel}}\">\r\n            <span>{{= item.riskLevel != \"none\" ? item.riskLevel : \"No\" }} risk</span>\r\n        </div>\r\n        {{ if( item.hosts.unprotected ){ }}\r\n        <span class='protectedHosts'>{{= item.hosts.unprotected }} Hosts are not protected</span>\r\n        <button class='btn btn--3 viewGaps' data-modal='{ \"name\":\"protection.gaps\", \"data\":\"{{= item.path }}\" }'>VIEW PROTECTION GAPS</button>\r\n        {{ } else{ }}\r\n        <span class='protectedHosts'>All hosts are protected</span>\r\n        <span class='btn detectedGaps'>NO GAPS DETECTED</span>\r\n        {{ } }}\r\n    </a>\r\n    {{ }); }}\r\n</div>",
  "summary-children-table.html": "<table class='summaryChildren table'>\r\n    <colgroup>\r\n        <col>\r\n        <col class='hBar'>\r\n        <col>\r\n        <col>\r\n        <col class='center'>\r\n        <col class='trend'>\r\n        <col>\r\n    </colgroup>\r\n    <thead>\r\n        <tr>\r\n            <th><div class='sortBtn' data-sort='string' data-col='0'><span>Name</span></div></th>\r\n            <th><div class='sortBtn' data-sort='int' data-col='1'><span>Protection Level</span></div></th>\r\n            <th></th>\r\n            <th>\r\n                <div class='sortBtn' data-sort='string' data-col='3'><span>Risk Level</span></div>\r\n                <label class='dropDownMenuLabel filter'>\r\n                    <input type='checkbox'>\r\n                    <i class='icon-filter'></i>\r\n                    <div class='dropDownMenu'>\r\n                        <a data-filter-by='none'>No Risk</a>\r\n                        <a data-filter-by='medium'>Medium Risk</a>\r\n                        <a data-filter-by='high'>High Risk</a>\r\n                    </div>\r\n                </label>\r\n            </th>\r\n            <th class='center'><div class='sortBtn' data-sort='int' data-col='4'><span>Unprotected Hosts</span></div></th>\r\n            <th class='center'><div class='sortBtn' data-sort='string' data-col='5'><span>Trend</span></div></th>\r\n            <th></th>\r\n        </tr>\r\n    </thead>\r\n    <tbody>\r\n        {{ items.forEach(function(item, i){ }}\r\n        <tr data-href='{{= item.path.toLowerCase() }}'>\r\n            <td>{{= item.name }}</td>\r\n            <td data-sort-value='{{= item.protectionLevel }}'><div class='hBars__bar'><div style=\"width:{{= item.protectionLevel }}%\"></div></div></td>\r\n            <td>{{= item.protectionLevel }}% Protected</td>\r\n            <td data-sort-value='{{= item.riskLevel }}' class='risk-level risk-level--{{= item.riskLevel }}'><span>{{= item.riskLevel != \"none\" ? item.riskLevel : \"No\" }} risk</span></td>\r\n            <td class='center'>{{=item.hosts.unprotected}}</td>\r\n            <td class='center' data-sort-value='{{= item.trend }}'><i class='trending icon-arrow-{{= item.trend }}'></i></td>\r\n            {{ if( item.hosts.unprotected ){ }}\r\n            <td><button class='btn btn--3 viewGaps' data-modal='{ \"name\":\"protection.gaps\", \"data\":\"{{= item.path }}\" }'>VIEW GAPS</button></td>\r\n            {{ } else{ }}\r\n            <td>NO GAPS DETECTED</td>\r\n            {{ } }}\r\n        </tr>\r\n        {{ }); }}\r\n    </tbody>\r\n</table>",
  "components\\breadcrumbs-item.html": "<div class='breadcrumbs__item'>\r\n    <a href=\"{{= path.toLowerCase() }}\" class='breadcrumbs__link'>{{= name }}</a>\r\n    <div class='severityMark severityMark--{{= riskLevel }}'>\r\n        <span>{{= protectionLevel }}% Protected</span>\r\n    </div>\r\n</div>\r\n",
  "components\\breadcrumbs.html": "<div class='breadcrumbs unselectable'>\r\n    <div class='breadcrumbs__item'>\r\n        <a class='back'><span>Back</span></a>\r\n    </div>\r\n</div>",
  "components\\changeRate.html": "<div class='changeRate'>\r\n    <span class='title'>{{= title }}</span>\r\n    <span class='value percentage' data-to='{{= value }}'>0</span>\r\n    <i class='icon icon-arrow-{{= change }}'></i>\r\n</div>",
  "components\\hBars.html": "<div class='hBars'>\r\n    {{ items.forEach(function(item){ }}\r\n        <div class='hBars__item'>\r\n            <div class='info'>\r\n                <span class='percentage'>{{= item.percentValue }}</span>\r\n                <span class='value'>{{= item.value.toLocaleString() }}</span>\r\n                <span class='name'>{{= item.name }}</span>\r\n            </div>\r\n            <div class='hBars__barWrap'><div class='hBars__bar' data-to=\"{{= item.percentValue }}%\"></div></div>\r\n        </div>\r\n    {{ }); }}\r\n</div>",
  "components\\protection-level.html": "<div class='protectionLevel risk-level--{{= riskLevel }}'>\r\n    <header class='header--2'>\r\n        <h2>Protection Level</h2>\r\n    </header>\r\n    <div class='doughnutChart risk-level--{{= riskLevel }}'>\r\n        <script type='js/template-doughnut'>\r\n            { \"value\" : {{= protectionLevel }}, \"radius\":[70,68] }\r\n        </script>\r\n        <div class='info'>\r\n            <span class='percent' data-to='{{= protectionLevel }}'>0</span>\r\n            <span class='status'>Protected</span>\r\n        </div>\r\n    </div>\r\n\r\n    <div class='hBars__bar'><div style=\"width:{{= protectionLevel }}%\"></div></div>\r\n\r\n    <div class='riskAlertBox risk-level--{{= riskLevel }}'>\r\n        <i {{= riskLevel === 'none' ? 'style=\"display:none\"' : '' }} class='icon-warning'></i>\r\n        {{ if( hosts.unprotected ){ }}\r\n        <div class='texts'>\r\n            <span class='riskLevelTitle'>{{= riskLevel }} Risk</span>\r\n            <span class='description'>{{= hosts.unprotected }} hosts are not protected</span>\r\n        </div>\r\n        <button {{= typeof items == 'undefined' ? 'style=\"display:none\"' : '' }} class='btn btn--3' data-modal='{ \"name\":\"protection.gaps\", \"data\":\"{{= path }}\" }'>VIEW PROTECTION GAPS</button>\r\n        {{ } else{ }}\r\n        <div class='texts'>\r\n            <span class='riskLevelTitle'>{{= riskLevel != \"none\" ? riskLevel : \"No\" }} Risk</span>\r\n            <span class='description'>All hosts are protected</span>\r\n        </div>\r\n        <span class='btn btn--0'>NO GAPS DETECTED</span>\r\n        {{ } }}\r\n    </div>\r\n</div>",
  "components\\vBars.html": "<div class='vBars'>\r\n    {{ items.forEach(function(item){ }}\r\n        <div class='vBars__item risk-level--{{= item.riskLevel }}'>\r\n            <div class='avarageLine' style=\"bottom:{{= avarage }}%\"></div>\r\n            <span class='label'>{{= item.label }}</span>\r\n            <div class='bar' data-to=\"{{= item.value }}%\" title=\"{{= item.value }}%\"></div>\r\n        </div>\r\n    {{ }); }}\r\n</div>",
  "components\\plotting\\doughnut.html": "<svg viewBox=\"0 0 {{= (radius[0] + 10) * 2 + ' ' + (radius[0] + 10) * 2 }}\"  preserveAspectRatio=\"xMinYMin meet\">\r\n    <g>\r\n        <circle r=\"{{= radius[0] }}\" cx=\"{{= radius[0] + 10 }}\" cy=\"{{= radius[0] + 10 }}\" class=\"circle-back\" />\r\n        <circle r=\"{{= radius[1] }}\" cx=\"{{= radius[0] + 10 }}\" cy=\"{{= radius[0] + 10 }}\" class=\"circle-front\" />\r\n    </g>\r\n</svg>"
};
'use strict';

////////////////////////////////////////////////////////
//////// social network login manager

EMC.connect = (function () {
    "use strict";

    return;
    ////////////////////////////////////////////
    var logout = function logout(e) {
        e.preventDefault();
        // check if connected with Facebook
        // ga('send', 'event', 'connection', 'signout');
        dataLayer.push({ 'event': 'connection logout' });

        if (FB.getAccessToken()) FB.logout(logoutRedirect);else if (gapi.auth2.getAuthInstance().isSignedIn.get()) google.signOut();else logoutRedirect();

        function logoutRedirect() {
            window.location = "/auth/signout";
        }
    };

    ////////////////////////////////
    // FACEBOOK
    var facebook = (function () {
        // if( typeof appData == 'undefined' || !appData.fb_app_id ){
        //     console.warn('no appData or missing "fb_app_id"');
        //     return;
        // }
        //  Configuration
        var appID = '1069832376361647',
            deffered;

        // Load the SDK asynchronously
        (function (d, s, id) {
            var js,
                fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        })(document, 'script', 'facebook-jssdk');

        window.fbAsyncInit = function () {
            FB.init({
                appId: appID,
                cookie: true, // enable cookies to allow the server to access // the session
                xfbml: false, // parse social plugins on this page
                version: 'v2.4'
            });
            FB.getLoginStatus(FBLoginStatus);
            FB.Event.subscribe('auth.authResponseChange', FBLoginStatus);
        };

        function FBLoginStatus(response) {
            if (APP.utilities.checkSignedIn() || deffered && deffered.state() != 'resolved') return;

            // if user refused to connect
            APP.DOM.$DOC.trigger('connection', ['facebook', response]);
            // The response object is returned with a status field that lets the
            // app know the current login status of the person.
            // Full docs on the response object can be found in the documentation
            // for FB.getLoginStatus().
            if (response.status === 'connected') {
                // Logged into your app and Facebook.
                //connected(response);
                deffered = $.ajax({
                    url: '/auth/facebook',
                    type: 'POST',
                    dataType: 'json',
                    success: function success(res) {
                        APP.DOM.$DOC.trigger('login', [null, res]);
                    }
                });
            } else if (response.status === 'not_authorized') {
                // The person is logged into Facebook, but not your app.
            } else {
                    // The person is not logged into Facebook, so we're not sure if
                    // they are logged into this app or not.
                }
        };

        function checkLoginState() {
            FB.getLoginStatus(function (response) {
                FBLoginStatus(response);
            });
        }

        function connected(res) {
            console.log('FACEBOOK CONENCTED');
            /*
            FB.api('/me', function(response){
            });
            */
        }

        return {
            login: function login() {
                // fix iOS Chrome
                if (navigator.userAgent.match('CriOS')) window.open('https://www.facebook.com/dialog/oauth?client_id=' + appID + '&redirect_uri=' + document.location.href + '&scope=email,public_profile,user_friends', '', null);else FB.login(null, { scope: 'email,public_profile' });
            },
            logout: function logout() {
                FB.logout();
            }
        };
    })();

    ////////////////////////////////
    // GOOGLE

    var google = (function () {
        var auth2;

        // window.___gcfg = {
        //     parsetags: 'onload'
        //  };

        (function (w) {
            if (!(w.gapi && w.gapi._pl)) {
                var d = w.document;
                var po = d.createElement('script');po.type = 'text/javascript';po.async = true;
                po.src = 'https://apis.google.com/js/platform.js?onload=gapi_init';
                var s = d.getElementsByTagName('script')[0];s.parentNode.insertBefore(po, s);
            }
        })(window);

        window.gapi_init = function () {
            gapi.load('auth2', function () {
                // Retrieve the singleton for the GoogleAuth library and set up the client.
                auth2 = gapi.auth2.init({
                    client_id: '32120075756-ikt9bfcbm934q2tk8gu4o4etrf6690u3.apps.googleusercontent.com',
                    cookiepolicy: 'single_host_origin'
                });
            });
        };

        // Request scopes in addition to 'profile' and 'email'
        //scope      : 'additional_scope'
        function signin() {
            //GoogleAuth
            var promise = auth2.signIn().then(function () {
                console.log(arguments);
            });
        }

        function onSignIn(googleUser) {
            var profile = googleUser.getBasicProfile();
            console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
            console.log('Name: ' + profile.getName());
            console.log('Image URL: ' + profile.getImageUrl());
            console.log('Email: ' + profile.getEmail());
        }

        function signOut() {
            var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
                console.log('User signed out.');
            });
        }

        return {
            login: signin,
            logout: signOut
        };
    })();

    ////////////////////////////
    // bind connect buttons
    $('.fbConnectBtn').click(facebook.login);
    $('.googleConnectBtn').click(google.login);

    ////////////////////////////
    // public methods
    return {
        logout: logout,
        facebook: facebook,
        google: google
    };
})();
'use strict';

EMC.config = (function () {
    "use strict"

    // setup underscore template
    ;
    _.templateSettings = {
        interpolate: /\{\{\=(.+?)\}\}/g,
        escape: /\{\{\-(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g
    };

    var baseURL = '/api/';

    // if DEV enviourment, set the default AJAX to use JSONP
    if (EMC.DEV) {
        baseURL = 'http://EMC/api/';

        $.ajaxSetup({
            dataType: 'jsonp',
            crossDomain: true
        });
    }

    return {
        baseURL: baseURL,
        API: {
            locations: baseURL + 'getLocations',
            getData: baseURL + 'getData' },
        // [userId]
        // a list of valid routes
        routes: {
            //"location" : routeMatcher("location/:mainLocation/:subLocation/:extra")
        }
    };
})();
'use strict';

/////////////////////////////////////////
//////// Utility functions

EMC.utilities = {
    isOldIE: document.all && !window.atob,

    getPrefixed: function getPrefixed(prop) {
        var i,
            s = document.createElement('p').style,
            v = ['ms', 'O', 'Moz', 'Webkit'];
        if (s[prop] == '') return prop;
        prop = prop.charAt(0).toUpperCase() + prop.slice(1);
        for (i = v.length; i--;) {
            if (s[v[i] + prop] == '') return v[i] + prop;
        }
    },

    // responsive url filtering and formating
    largeImageUrlFilter: function largeImageUrlFilter(url) {
        if (window.screen.availWidth < 500) url = url.replace('/3_', '/2_');

        return url;
    },

    defaultCheckboxes: function defaultCheckboxes() {
        var allInputs = document.querySelectorAll('input');

        // loop on all checkboxes found (trick to iterate on nodeList)
        [].forEach.call(allInputs, function (input) {
            if (input.type == 'checkbox') input.checked = input.defaultChecked;else input.value = input.defaultValue;
        });
    },

    // log if any DOM elemtn wasn't cached
    checkDOMbinding: function checkDOMbinding(DOM) {
        for (var i in DOM) {
            if (!DOM[i] || !DOM[i].length) {
                console.log(i, ' - DOM reference empty');
            }
        }
    },

    // General window values on resize
    // window : (function(){
    //     var result = { scrollY : 0 },
    //         timer,
    //         getScrollY = function(){
    //             fastdom.read(function(){
    //                 result.scrollY = window.pageYOffset || document.documentElement.scrollTop;
    //                 clearTimeout(timer);
    //                 timer = setTimeout(scrollEnd, 200);
    //                 if( timer != null )
    //                     EMC.DOM.$BODY.addClass('scrolling');
    //             });
    //         };

    //     function scrollEnd(){
    //         timer = null;
    //         EMC.DOM.$BODY.removeClass('scrolling');
    //     }

    //     EMC.DOM.$WIN.on('scroll.getScrollY', getScrollY);
    //     getScrollY();

    //     return result;
    // })(),

    ///////////////////////////////////
    // parse URL
    URIparse: function URIparse(url) {
        if (!url) {
            console.warn('URL is underfined. using current one');
            url = window.location.href;
        }

        var parser = document.createElement('a'),
            searchObject = {},
            queries,
            split,
            i;

        // Let the browser do the work
        parser.href = url;

        // Convert query string to object
        queries = parser.search.replace(/^\?/, '').split('&');

        for (i = 0; i < queries.length; i++) {
            split = queries[i].split('=');
            searchObject[split[0]] = split[1];
        }
        return {
            protocol: parser.protocol,
            host: parser.host,
            hostname: parser.hostname,
            port: parser.port,
            pathname: parser.pathname,
            search: parser.search,
            searchObject: searchObject,
            hash: parser.hash
        };
    },

    // returns true if this is the first time of a user on a page (using localstorage)
    firstTimeOnPage: function firstTimeOnPage(pageName) {
        return 'localStorage' in window && window['localStorage'] !== null && !localStorage[pageName + '-first-time'];
    },

    randomString: function randomString(n) {
        var s = '';

        while (n--) {
            s += Math.random().toString(36).substring(7);
        }

        return s;
    },

    queryParams: (function () {
        var queryString = document.location.search.substr(1),
            params = {},
            queries,
            temp,
            i;

        // Split into key/value pairs
        queries = queryString.split("&");

        // Convert the array of strings into an object
        for (i = queries.length; i--;) {
            temp = queries[i].split('=');
            params[temp[0]] = decodeURIComponent(temp[1]);
        }

        return params;
    })(),

    log: function log(type, text) {
        text = !text ? type : text;
        text = typeof text == 'string' ? [text] : text;
        if (!type || !console[type]) type = 'log';
        console[type].apply(window, text);
    },

    object: {
        getTopValues: function getTopValues(obj, n) {
            // convert to an Array and sort keys by values
            var props = Object.keys(obj).map(function (key) {
                return { key: key, value: this[key] };
            }, obj);
            props.sort(function (p1, p2) {
                return p2.value - p1.value;
            });
            // convert back to Object, returning N top values
            return [props.slice(0, n), props.slice(0, n).reduce(function (obj, prop) {
                obj[prop.key] = prop.value;
                return obj;
            }, {})];
        }
    },

    template: {
        minify: function minify(html) {
            return html.replace(new RegExp("\>[\r\n ]+\<", "g"), "><");
        }
    },

    string: {
        normalizeContentEditable: function normalizeContentEditable(s) {
            if (!s) return '';

            return s.trim().replace(/<br(\s*)\/*>/ig, '\n').replace(/&nbsp;/ig, ' ').replace(/<[p|div]\s/ig, '\n$0').replace(/(<([^>]+)>)/ig, "");
        }
    },

    // get the path of the window trimmed by "/", so only the part needed is extracted
    getPathRoute: function getPathRoute() {
        var path = window.location.pathname.substr(1).split('/');

        return path;
    },

    ////////////////////////////////////////
    // isElementInViewport
    isElementInViewport: function isElementInViewport(scope, el, offset) {
        offset = offset || 0;

        var rect = el.getBoundingClientRect(),
            scopeRect = scope ? scope[0].getBoundingClientRect() : { top: 0, bottom: 0, left: 0, right: 0 },
            test = {
            top: rect.top - scopeRect.top - offset >= 0,
            left: rect.left - scopeRect.left >= 0,
            bottom: rect.bottom + offset <= (window.innerHeight || document.documentElement.clientHeight), /*or $(window).height() */
            right: rect.right - scopeRect.left <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
        };

        return test.top && test.bottom && test.left && test.right;
    },

    isMobile: $(document.documentElement).hasClass('mobile'),
    isTouch: $(document.documentElement).hasClass('touch'),

    support: {
        fullscreen: (function () {
            var docElm = document.documentElement;
            return 'requestFullscreen' in docElm || 'mozRequestFullScreen' in docElm || 'webkitRequestFullScreen' in docElm;
        })()
    },

    toggleFullScreen: function toggleFullScreen(force) {
        var docElm = document.documentElement;
        if (force || !document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            // current working methods
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.msRequestFullscreen) {
                docElm.msRequestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullscreen) {
                docElm.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
            return true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            return false;
        }
    },

    openPopup: function openPopup(url, title, w, h, callback) {
        var left = screen.width / 2 - w / 2,
            top = screen.height / 2 - h / 2,
            timer = setInterval(checkWindowClose, 1000),
            newWindow = window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

        // Puts focus on the newWindow
        if (window.focus) newWindow.focus();

        function checkWindowClose() {
            console.log('waiting for popup closing: ', newWindow);
            if (newWindow && newWindow.closed) {
                if (typeof callback == 'function') callback();
                clearInterval(timer);
            }
        }

        setTimeout(function () {
            clearInterval(timer);
        }, 4000 * 60);

        return newWindow;
    },

    matchRoute: function matchRoute(routes) {
        // functions names array
        var args = [].slice.call(arguments).splice(1),
            // get all the rest of the arguments, if exists
        initDataArr,
            fn,
            n,
            found;

        // check if rountes exist, if so, convert them into an Array
        if (routes) initDataArr = routes.split(' ');

        // execute each of the page's routes
        for (n in initDataArr) {
            executeFunctionByName.apply(this, [initDataArr[n], EMC.routes].concat(args));
        }

        function executeFunctionByName(functionName, context /*, args */) {
            var args = [].slice.call(arguments).splice(2),
                namespaces = functionName.split('.'),
                func = namespaces.pop(),
                i = 0;

            // dig inside the context
            for (; i < namespaces.length; i++) {
                context = context[namespaces[i]];
            }

            // make sure it's a function and that it exists
            if (context && typeof context[func] == 'function') {
                found = true;
                return context[func].apply(EMC.routes, args);
            }
        }

        if (!found) {
            console.warn("route wasn't found: ", routes);
        }
        return found;
    },

    checkSignedIn: function checkSignedIn(modal) {
        var signed = gs_data && gs_data.member.id;
        if (!signed && modal) EMC.components.modals.show(modal);

        return !!signed;
    },

    bodyClass: document.body.className.split(' '),

    optimizedEvent: (function () {
        var callbacks = [],
            changed = false,
            running = false;

        // fired on resize event
        function doEvent() {
            if (!running) {
                changed = true;
                loop();
            }
        }

        // resource conscious callback loop
        function loop() {
            if (!changed) {
                running = false;
            } else {
                changed = false;
                running = true;

                callbacks.forEach(function (callback) {
                    callback();
                });

                window.requestAnimationFrame(loop);
            }
        }

        // adds callback to loop
        function addCallback(callback) {
            if (callback) {
                callbacks.push(callback);
            }
        }

        return {
            // initalize resize event listener
            init: function init(event, callback) {
                if (window.requestAnimationFrame) {
                    window.addEventListener(event, doEvent);
                    addCallback(callback);
                }
            },

            // public method to add additional callback
            add: function add(callback) {
                addCallback(callback);
            }
        };
    })(),

    // get data-binded elements from the template
    // DOMscope     - under which node to look for data-binded elements
    // bindMethods  - if there is a control function associated with a data-binded element found, run it
    // DOM          - scope for the "binded" object to be assigned to
    // scope        - where to look for a controller function for a specific data-binded element
    dataBinder: function dataBinder(DOMscope, bindMethods, DOM, scope) {
        // if the "binded" object doesn't exist, create one. it will store all data-binded elements found.
        if (!DOM.binded) DOM.binded = {};

        DOMscope.find('[data-bind]').each(function () {
            var elm = $(this),
                name = elm.data('bind') || this.className.split(' ')[0];

            DOM.binded[name] = elm;
        });

        // Run all binded elements associated update callbacks
        _.each(bindMethods, function (key) {
            if (typeof key == 'function') {
                key.call(scope || window);
            }
        });
    },

    Task: (function () {
        function Task(settings) {
            if (!settings.el) return;

            this.el = settings.el;
            this.initialValue = this.el.innerHTML | 0;
            this.toValue = this.el.getAttribute('data-to') || settings.toValue;
            this.delta = this.toValue - this.initialValue;
            this.easing = settings.easingFunc || function (t) {
                return t;
            };

            // Do-in settings object
            var doinSettings = {
                step: this.step.bind(this),
                duration: settings.duration || 1,
                done: this.done.bind(this)
            };

            if (settings.fps) doinSettings.fps = settings.fps;

            // create an instance of Do-in
            this.doin = new Doin(doinSettings);
            this.doin.run();
        }

        Task.prototype.nf = new Intl.NumberFormat();

        // a step of the thing we want to do
        Task.prototype.step = function (t, elapsed) {
            // easing
            t = this.easing(t);

            // calculate new value
            var value = this.delta * t + this.initialValue;

            // limit value
            if (t > 0.999) value = this.toValue;

            // print value
            this.el.innerHTML = this.nf.format(value | 0);
        };

        // on DONE
        Task.prototype.done = function () {
            // console.log(this.el, 'done counting!');
        };

        return Task;
    })(),
    /*
        photoCollectionScope : {
            'profile_photo'  : 1,
            'profile_cover'  : 2,
            'member_gallery' : 3
        },
    */
    ajaxSubmit: function ajaxSubmit(form) {
        var generalAlert = form.querySelector('.generalAlert'),
            $form = $(form);

        // lock form submiting until request is resolved
        if ($form.data('proccesing')) return false;

        // Add loading spinner and disable the button until request was resolved
        $form.addClass('loading').find('button[type=submit]').prop('disabled', true);

        $.ajax({
            type: "POST",
            url: $form[0].action,
            dataType: 'json',
            data: $form.serialize() // serializes the form's elements.
        }).done(onDone).fail(function () {
            $form.removeClass('loading');
            onDone({ success: false, "fields": { general: "Something went wrong, please try again" } });
        }).always(always);

        // set form to "processing" state
        $form.data('proccesing', true);

        /////// response callbacks //////
        function always() {
            $form.data('proccesing', false)
            //.removeClass('loading')  // page will refresh anyway
            .find('button[type=submit]').prop('disabled', false);
        }

        function onDone(res) {
            if (res.success) {
                $form.removeClass('loading');
            } else errorsHandler(res.fields);
        }

        function errorsHandler(fields) {
            var field, errorMsg;

            // remove loading state on success "false"
            $form.removeClass('loading');

            for (field in fields) {
                if (fields.hasOwnProperty(field)) {
                    errorMsg = fields[field];

                    if (field == 'general' && generalAlert) generalAlert.innerHTML = errorMsg;else validator.mark($($form[0][field]), errorMsg);
                }
            }
        }
    },

    getObjectByPath: function getObjectByPath(data, pathArr, callback) {
        var path = '/html-gateway-api/protection/';

        function recursive(data, pathArr) {
            var result;

            for (var i = data.length; i--;) {
                if (data[i].name.toLowerCase() == pathArr[0].split('-').join(' ')) {
                    path += data[i].name.split(' ').join('-') + '/';
                    // add current URL path to the current object
                    data[i].path = path;
                    // add breadcrumb item
                    callback && callback(data[i]);
                    result = pathArr.length > 1 ? recursive(data[i].items, pathArr.slice(1, pathArr.length)) : data[i];

                    // return current object
                    return result;
                }
            }
        }

        return recursive.apply(this, arguments);
    },

    scriptsTemplates: function scriptsTemplates(scope) {
        // scan for placeholders and init them
        scope.find('script').each(function (i) {
            try {
                if (this.type == "js/template-doughnut") {
                    var scriptElm = $(this),
                        percentElm,
                        data = JSON.parse(this.innerHTML),
                        doughnut = new EMC.components.Doughnut(data);

                    scriptElm.replaceWith(doughnut.elm);

                    setTimeout(function () {
                        doughnut.setValue();

                        percentElm = doughnut.elm.next('.info').find('.percent');

                        if (percentElm.data('to')) var task = new EMC.utilities.Task({ el: percentElm[0], duration: 0.8 });
                    }, i * 120);
                }
            } catch (err) {
                console.warn('Something went wrong, probably with "Doughnut" component or SCRIPT data is invalid JSON format');
            }
        });
    }
};
"use strict";

//////// COMPONENTS //////////////////////////
//////// Popups manager

EMC.components.modals = (function () {
    "use strict";

    var state = {
        history: [], // history of all opened modals, until modal is completly closed.
        modalIsOpened: false // false OR the current modal's ID
    };

    var transitionEnd = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend';

    /////////////////////////////
    // SET UP & PREPARE MODAL
    var modalHTML = "<div id='modal'> \
                        <div class='wrap'> \
                            <div class='content'> \
                                <a class='close' title='Close'>&times;</a> \
                            </div> \
                        </div> \
                    </div>",
        closeTimeout,
        modal = $(modalHTML),
        modalTemplate = modal.clone(),
        modals = $('<div>'),
        // an empty element that will contain all the HTML from the modals ajax request
    pageClass = ''; // if exists and needed for this modal

    // inject modal's container
    EMC.DOM.$BODY.prepend(modal);

    /////////////////////////////
    // SHOW MODAL
    function show(modalName, modalData) {
        clearTimeout(closeTimeout);

        var template = EMC.templates['modals\\' + modalName];
        // check if required modal even exists in the templates
        // if( modalName != 'lastModal' )
        //     return;

        console.log('>>> modal name:', modalName, ', data:', modalData); // debugging
        dataLayer.push({ 'event': 'Modal dialog', 'action': 'open', 'label': modalName }); // anlytics

        // Don't load the same modal again if it's already on-screen
        if (!modalName || state.modalIsOpened == modalName) return;

        // is there wasn't any last modal to show from the history object
        if (modalName == 'lastModal' && state.history.length < 2) {
            close();
            return false;
        }

        // cleanup must come AFTER last DOM was saved (if that had happened)
        cleanup(true);

        if (modalName == 'lastModal') {
            modalName = restoreLastModal();
        } else if (state.modalIsOpened && existInHistory(modalName)) {
            // TODO:
            // Check if the modal which is requested is saved in the history. if so, restore it
        } else newModal(modalName, template, modalData);

        // modal[0].className = modalName + ' show ' + pageClass;
        modal.removeAttr('class').addClass('show').attr('data-view', modalName);
        modal.off(transitionEnd).on(transitionEnd, function () {
            modal.off(transitionEnd);
            modal.find('.content').css({ 'position': 'relative', 'left': 'auto' });
            modal.addClass('showContent');
        });
        EMC.DOM.$BODY.addClass('noScrollbar');

        // if the body element has changed, and the modal isn't there anymore, inject it again
        if (!$('#modal').length) EMC.DOM.$BODY.append(modal);

        state.modalIsOpened = modalName;

        // saves the modal (that was rendered) in the history
        if (modalName != 'lastModal' && state.modalIsOpened) saveModal(modalName, modalData);

        setFormFocus();

        return modal;
    }

    // Sets focus if has a form
    function setFormFocus() {
        var shouldFocus = modal.find('form:first').find('[autofocus]');
        if (shouldFocus.length) shouldFocus[0].focus();
    }

    // checks if a modal exists in the history cache and loads it
    function existInHistory(modalName) {
        return state.history.some(function (item, i) {
            var key = _.keys(item)[0];
            if (key == modalName) {
                modal.find('.content').append(item[modalName].content);
                if (item[modalName].outside) modal.find('.wrap').append(item[modalName].outside);
                return true;
            }
        });
    }

    // saves the LAST modal before loading the current one.
    // save histroy state ONLY for modals which trigger other modals, and might come back to the originated one
    // it's very important to save the state of the modal JUST before it is changing to another one
    function saveModal(modalName, modalData) {
        // save history of the current modal, just before changing to the next one.
        var obj = {
            name: modalName,
            // reference the current modal's view to memory
            content: modal.find('.content').find('> div'),
            outside: modal.find('.outside'),
            // save the current modal class name (if has one)
            extraClass: pageClass,
            modalData: $.extend({}, modalData)
        };

        state.history.push(obj);

        // limit history to 2 items
        // state.history.slice(-2);
    }

    // gets the `index` for which to store a modal from the `History` object
    function restoreLastModal() {
        var restored, modalName;

        state.history.pop();

        // load the last modal
        restored = state.history.pop();

        // append the DOM of the last modal
        // ** MUST BE CLEANED UP PRIOR TO APPENDING IT **
        modal.find('.content').append(restored.content);
        pageClass = restored.extraClass;

        // returns the page name of the restored modal
        return restored.name;
    }

    function newModal(modalName, template, modalData) {
        var wrap = modal.find('.wrap'),
            content = modal.find('.content'),
            compiledTemplate,
            renderedTemplate,
            $tmpl,
            outsideContent,
            initData;

        if (template) {
            // Compile template into text
            compiledTemplate = _.template(template, modalData || {});
            // render compiled template text into a DOM node
            renderedTemplate = $.parseHTML(compiledTemplate)[0];
            // convert it to a jQuery object
            $tmpl = $(renderedTemplate);

            // if there are things that needs to be outside of the WRAP container
            // outsideContent = $tmpl.find('.outside');
            // if( outsideContent.length )
            //     wrap.append( outsideContent );

            content.append($tmpl);
        }

        //pageClass = $tmpl[0].className || '';

        ///////////////// ROUTES ///////////////////////////////
        // call the route for this modal, if exist
        //initData = $tmpl.data('init');

        // modal.addClass('loading');
        EMC.utilities.matchRoute('modals.' + modalName, content, modalData);

        afterRoute();
    }

    function afterRoute() {
        // scan page for inputs for IE9
        if (!$.support.placeholders) modal.find('input[placeholder]').each(function () {
            $.fn.fixPlaceholders.setOriginalType.apply(this);
            $.fn.fixPlaceholders.onBlur.apply(this);
        });
    }

    /////////////////////////////
    // CLEANUP
    function cleanup(soft) {
        pageClass = '';
        // "soft" cleanup when changing modals from one to another
        if (soft) {
            modal.find('.close').siblings().detach();
            modal.find('.content').siblings().detach(); // clean "outside" injected content
        } else {
                modal.removeClass('show hide').html(modalTemplate.html());
                state.history.length = 0; // cleanup
            }

        // Call the last modal window (if exists) "destroy" method
        var modalController = EMC.routes.modals[state.modalIsOpened];

        // if this modal has a "destroy" method, to cleanup after it
        if (modalController && modalController.destroy) modalController.destroy();
    }

    function onKeyDown(e) {
        var code = e.keyCode;

        // Prevent default keyboard action (like navigating inside the page)
        if (code == 27) close();
    }

    /////////////////////////////
    // CLOSE MODAL PROCEDURE
    function close(param) {
        if (state.modalIsOpened) {
            var modalController = EMC.routes.modals[state.modalIsOpened];
            state.modalIsOpened = false;

            // if this modal has a "destroy" method, to cleanup after it
            if (modalController && modalController.destroy) modalController.destroy();

            if (!param) modal.addClass('hide');

            // if this modal has a "destroy" method, to cleanup after it
            if (modalController && modalController.destroy) modalController.destroy();

            EMC.DOM.$BODY.removeClass('noScrollbar');

            // if 'lastModal' then do not close the mocal, but only remove elements
            if (param == 'lastModal') {
                cleanup(true);
            } else if (param == 'fast') cleanup();else {
                // cleanup is delayed roughly until the modal was hidden
                closeTimeout = setTimeout(cleanup, 250);
            }

            // dataLayer.push({'event': 'Modal dialog', 'action':'close', 'label':modalName }); // anlytics
        }
    }

    // AJAX submits a form according to it's ACTION attribute
    function submitForm(e) {
        // don't submit the form normally
        e.preventDefault();

        var $form = $(this),
            $generalAlert = $form.find('.generalAlert');

        $generalAlert.empty();

        // validate before submiting to the server
        // you can put your own custom validations below

        // check all the rerquired fields
        if (!validator.checkAll(this)) return false;

        ajaxSubmit($form);
    }

    function ajaxSubmit($form) {
        var $generalAlert = $form.find('.generalAlert');

        // lock form submiting until request is resolved
        if ($form.data('proccesing')) return false;

        // Add loading spinner and disable the button until request was resolved
        $form.addClass('loading').find('button[type=submit]').prop('disabled', true);

        $.ajax({
            type: "POST",
            url: $form[0].action,
            dataType: 'json',
            data: $form.serialize() // serializes the form's elements.
        }).done(onDone).fail(function () {
            $form.removeClass('loading');
            onDone({ success: false, "fields": { general: "Something went wrong, please try again" } });
        }).always(always);

        // set form to "processing" state
        $form.data('proccesing', true);

        /////// response callbacks //////
        function always() {
            $form.data('proccesing', false)
            //.removeClass('loading')  // page will refresh anyway
            .find('button[type=submit]').prop('disabled', false);
        }

        function onDone(res) {
            if (res.success) {
                $form.removeClass('loading');

                var firstModal = state.history.length > 1 ? state.history[0].name : null;

                // save the first modal to browser's localStorage, so it could be shown after page refresh
                if (firstModal) {
                    localStorage['restoreModalData'] = JSON.stringify(state.history[0].modalData);
                }

                EMC.DOM.$DOC.trigger(state.modalIsOpened, [firstModal, res]).trigger('modalSubmit', [state.modalIsOpened, res]);
                /*
                if( $form.res('refresh') )
                   window.location.reload(false);
                */
            } else errorsHandler(res.fields);
        }

        function errorsHandler(fields) {
            var field, errorMsg;

            // remove loading state on success "false"
            $form.removeClass('loading');

            for (field in fields) {
                if (fields.hasOwnProperty(field)) {
                    errorMsg = fields[field];

                    if (field == 'general') $generalAlert.text(errorMsg);else validator.mark($($form[0][field]), errorMsg);
                }
            }
        }
    }

    /////////////////////////////
    // EVENTS CALLBACKS
    function click_close(e) {
        var target = $(e.currentTarget);

        if ((target.parents('.content').length || target.hasClass('content')) && !target.hasClass('close')) return true;

        close();
        return false;
    }

    function click_show() {
        // the triggering link might have some data on it
        var $button = $(this),
            modalName = $button.data('modal').name,
            modalData = $button.data('modal').data.toLowerCase() || {};

        show(modalName, modalData);
    }

    /////////////////////////////
    // EVENTS

    EMC.DOM.$DOC.on('click.modal', 'a[data-modal], button[data-modal]', click_show).on('keydown.closeModal', onKeyDown);

    modal
    //.on('click', click_close)
    .on('click', '.close', click_close).on('submit', 'form', submitForm);

    ///////////////////////////////////////////////////////////////////////////////////////
    // check if any modal is required to load from the from "hash" or "search" params

    (function () {
        var hashName = window.location.hash.split('#')[1],
            searchQuery = window.location.search.split('?')[1],
            lookForModal = hashName || searchQuery || null;

        if (lookForModal) {
            // direct to login modal (if needed)

            if (lookForModal == 'signin') show('login');else if (lookForModal == 'signup') show('signup');else if (lookForModal == 'submit' && localStorage['restoreModalData']) {
                var modalData = JSON.parse(localStorage['restoreModalData']);
                delete localStorage['restoreModalData'];
                show(lookForModal, modalData);
            }
            // if modal exists
            else if (EMC.templates['modals\\' + lookForModal]) {
                    // take the call outside of the time scope, to have enough time for "EMC.components.modals" to be available for the popups controllers
                    setTimeout(function () {
                        show(lookForModal);
                    }, 0);
                } else {
                    return;
                }

            // clear hash
            var yScroll = EMC.utilities.window.scrollY;

            if (hashName) window.location.hash = '';

            window.scroll(0, yScroll);
        }
    })();

    // Expose
    return {
        modal: modal,
        state: state,
        show: show,
        click_show: click_show,
        close: close
    };
})();
"use strict";

EMC.components.Breadcrumbs = function () {
    "use strict";

    this.template = EMC.tmpl("components\\breadcrumbs");
    this.itemTemplate = EMC.tmpl("components\\breadcrumbs-item");

    this.DOM = {
        scope: $(this.template())
    };

    this.DOM.back = this.DOM.scope.find('.back');

    this.init();
};

EMC.components.Breadcrumbs.prototype = {
    init: function init() {
        this.events.bind.call(this);
    },

    events: {
        bind: function bind() {
            this.DOM.scope.on('click', '.breadcrumbs__link', this.events.callbacks.itemClick.bind(this)).on('click', '.back', this.events.callbacks.back.bind(this));
        },
        callbacks: {
            itemClick: function itemClick(e) {
                // var target = e.currentTarget;
            },

            back: function back(e) {
                var href = this.DOM.scope.find('a').eq(-2).click();
                this.backButtonState();
                // Router.navigate('/html-gateway-api/protection/locations/united-states');
                return false;
            }
        }
    },

    backButtonState: function backButtonState() {
        var items = this.DOM.scope.children();
        this.DOM.back.toggleClass('disabled', items.length <= 2);
    },

    add: function add(data) {
        var HTML = this.itemTemplate(data);
        this.DOM.scope.append(HTML);
        this.backButtonState();
    },

    remove: function remove() {}
};
'use strict';

EMC.components.changeRate = function (elm, settings) {
    this.DOM = {
        scope: elm // the component placeholder
    };

    this.settings = $.extend({}, settings);

    this.init();
};

EMC.components.changeRate.prototype = {
    template: EMC.tmpl("components\\changeRate"),

    init: function init() {
        if (this.DOM.scope) this.DOM.scope.addClass('loading');

        this.promise && this.promise.abort(); // cancel the last request if there was any
        this.promise = this.getData();

        $.when(this.promise).done(this.render.bind(this)).fail(this.onGetDataFail);
    },

    getData: function getData() {
        if (this.settings.mock) return this.settings.mock;

        return $.ajax({
            type: 'GET',
            url: EMC.API.baseURL + settings.endPoint,
            data: data,
            dataType: 'jsonp',
            crossDomain: true
        });
    },

    onGetDataFail: function onGetDataFail() {
        if (this.DOM.scope) this.DOM.scope.removeClass('loading');

        // should write some error message, or at least try again a few times before showing such message
    },

    render: function render(data) {
        if (this.DOM.scope) this.DOM.scope.removeClass('loading');

        if (!data) return;

        var HTML = $(this.template(data));

        if (this.DOM.scope) this.DOM.scope.replaceWith(this.DOM.scope = HTML);else console.warn('no DOM scope found');

        this.animate();
    },

    // animate bars
    animate: function animate() {
        var percentElm = this.DOM.scope.find('.value');

        if (percentElm.data('to')) var task = new EMC.utilities.Task({ el: percentElm[0], duration: 0.8, easingFunc: function easingFunc(t) {
                return 1 + --t * t * t * t * t;
            } });
    }
};
'use strict';

EMC.components.Doughnut = function () {
    var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var template = EMC.tmpl("components\\plotting\\doughnut");
    this.settings = $.extend({}, { radius: [70, 70], value: 0 }, settings);
    this.compiledTemplate = template(this.settings);
    this.elm = $(this.compiledTemplate);

    // setTimeout( this.setValue.bind(this), 0 );
};

EMC.components.Doughnut.prototype = {
    render: function render() {},

    setValue: function setValue() {
        var value = arguments.length <= 0 || arguments[0] === undefined ? this.settings.value : arguments[0];

        if (!value || value < 0 || value > 100) {
            console.warn('no value: ', value);
            return false;
        }

        var circle = this.elm.find('.circle-front'),
            dasharray = 2 * Math.PI * this.settings.radius[1];

        circle.css('stroke-dashoffset', dasharray * (1 - value / 100) + 'px');

        return this;
    }
};
'use strict';

EMC.components.hBars = function (elm) {
    this.DOM = {
        scope: elm // the component placeholder
    };

    this.init();
};

EMC.components.hBars.prototype = {
    template: EMC.tmpl("components\\hBars"),

    init: function init() {
        if (this.DOM.scope) this.DOM.scope.addClass('loading');

        this.promise && this.promise.abort(); // cancel the last request if there was any
        this.promise = this.getData();

        $.when(this.promise).done(this.render.bind(this)).fail(this.onGetDataFail);
    },

    getData: function getData() {
        // mock data
        return {
            items: [{
                value: 103,
                name: 'Unprotected Clients',
                percentValue: 8
            }, {
                value: 103,
                name: 'Protected',
                percentValue: 50
            }, {
                value: 4322,
                name: "Objects Meeting RPO's",
                percentValue: 93
            }]
        };

        return $.ajax({
            type: 'GET',
            url: EMC.API.baseURL + settings.endPoint,
            data: data,
            dataType: 'jsonp',
            crossDomain: true
        });
    },

    onGetDataFail: function onGetDataFail() {
        if (this.DOM.scope) this.DOM.scope.removeClass('loading');

        // should write some error message, or at least try again a few times before showing such message
    },

    render: function render(data) {
        if (this.DOM.scope) this.DOM.scope.removeClass('loading');

        if (!data) return;

        var HTML = $(this.template(data)),
            DOMscopeClass = this.DOM.scope[0].className;

        // add original component placeholder classes to the template
        HTML.addClass(DOMscopeClass);

        if (this.DOM.scope) this.DOM.scope.replaceWith(this.DOM.scope = HTML);else console.warn('no DOM scope found');

        this.animate();
    },

    // animate bars
    animate: function animate() {
        this.DOM.scope.find('.hBars__bar').each(function (i) {
            var bar = this;
            setTimeout(function () {
                bar.style.width = bar.dataset.to;
            }, i * 150 + 100);
        });
    }
};
"use strict";

EMC.components.Notifications = (function () {
    "use strict";

    var Notifications = function Notifications(elm) {
        this.DOM = {
            container: elm
        };

        this.itemTemplate = _.template(EMC.templates["notification-item"]);
        this.maxItems = 2;
        this.addedIds = {}; // keep scores of which items were added, so nothing which was already rendered will be rendered again
        this.queue = [];
    };

    Notifications.prototype = {
        init: function init() {
            this.onData();
            this.events();
        },

        events: function events() {
            this.DOM.container.on('mouseenter', this.renderInterval.stop.bind(this)).on('mouseleave', this.renderInterval.start.bind(this));
        },

        renderInterval: {
            timer: null,
            start: function start() {
                if (!this.renderInterval.timer) this.renderInterval.timer = setInterval(this.renderQueue.bind(this), 1000);
            },
            stop: function stop() {
                clearInterval(this.renderInterval.timer);
                this.renderInterval.timer = null;
            }
        },

        getData: function getData() {
            // return {
            //     data : [
            //         {
            //             date  : Date.now() - 8972,
            //             image : 'https://s3.amazonaws.com/uifaces/faces/twitter/vladgeorgescu/128.jpg',
            //             name  : 'Yair even-or',
            //             text  : 'following you'
            //         },
            //         {
            //             date  : Date.now(),
            //             image : 'https://i.ytimg.com/vi/Bu0kG1rOvqE/mqdefault.jpg',
            //             name  : 'Jay martin',
            //             text  : 'liked your video'
            //         },
            //         {
            //             date  : Date.now(),
            //             image : 'https://s3.amazonaws.com/uifaces/faces/twitter/kfriedson/73.jpg',
            //             name  : 'Rebbeca willamns',
            //             text  : 'Shared something'
            //         }
            //     ]
            // };

            return $.ajax({
                type: 'GET',
                url: 'http://api.comedy.com/dashboard/recent_notifications',
                dataType: 'jsonp',
                crossDomain: true
            });
        },

        onData: function onData() {
            var that = this;

            $.when(this.getData()).done(function (data) {
                // add to queue only items who weren't previously rendered
                for (var i = data.data.length; i--;) {
                    var id = data.data[i].date;
                    if (that.addedIds[id]) {
                        // console.log('dup', data.data[i].date, that.addedIds)
                        data.data.splice(i, 1);
                    } else that.addedIds[id] = 1;
                }

                // Merge arrays
                Array.prototype.push.apply(that.queue, data.data);
                // Fetch more data periodically
                that.timer = setTimeout(that.onData.bind(that), 5000); // fetch a batch of new data from the server

                that.doOnce();
            });
        },

        // On first time fetching the data, render the maximum allowed number of items all at once
        doOnce: function doOnce() {
            var itemsToAdd = this.queue.splice(0, this.maxItems);
            this.add(itemsToAdd);
            this.doOnce = function () {};
            // start interval cycle
            this.renderInterval.start.call(this);
        },

        renderQueue: function renderQueue() {
            var itemToAdd = this.queue.pop();

            if (itemToAdd) {
                this.add([itemToAdd]);
                this.remove();
            }
        },

        remove: function remove() {
            var items = this.DOM.container.children(),
                itemToRemove = items.first();

            // remove only when total items exceeds "maxItems" allowed length
            if (items.length > this.maxItems) setTimeout(function () {
                // fade it out
                itemToRemove.addClass('hide').slideUp(150);
                // Remove from DOM
                setTimeout(function () {
                    itemToRemove.remove();
                }, 400);
            }, 100);
        },

        add: function add(data) {
            var model = { items: data },
                $item = $(EMC.utilities.template.minify(this.itemTemplate(model)));

            // if there's only one item to add
            if (data.length == 1) {
                // initially hide the item
                $item.addClass('hide').hide();
                this.DOM.container.append($item);
                $item.slideDown(150).removeClass('hide');
            }
            // for multiple items, add as bulk HTML
            else {
                    this.DOM.container.prepend($item);
                }
        }
    };

    return Notifications;
})();
'use strict';

EMC.components.protectionLevel = function (elm, data) {
    var promise; // the request's promise object

    var settings = {
        DOM: {
            elm: elm
        },
        template: EMC.tmpl("components\\protection-level"),
        endPoint: EMC.config.API.protection_level
    };

    function init(fcb) {
        fcb = fcb || onGetDataFail || function () {}; // fail callback

        if (settings.DOM.elm) settings.DOM.elm.addClass('loading');

        promise && promise.abort(); // cancel the last request if there was any
        promise = getData();

        $.when(promise).done(render).fail(fcb);
    };

    function getData() {
        // mock data
        if (data) return data;

        return $.ajax({
            type: 'GET',
            url: EMC.API.baseURL + settings.endPoint,
            data: data
        });
    };

    function onGetDataFail() {
        if (settings.DOM.elm) settings.DOM.elm.removeClass('loading');

        // should write some error message, or at least try again a few times before showing such message
    };

    function render(data) {
        if (settings.DOM.elm) settings.DOM.elm.removeClass('loading');

        if (!data) return;

        // settings.DOM.elm
        var HTML = settings.template(data);

        if (settings.DOM.elm) settings.DOM.elm.replaceWith(HTML);
    };

    ///////////////////////////////
    init();

    return {
        init: init,
        getData: getData
    };
};
'use strict';

EMC.components.SegmentsChart = function (elm) {
    var settings = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this.settings = $.extend({}, {
        colors: ['#ffc77e', '#ffdf7e', '#51a7e4', '#8888ef', '#fee08b', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
        labels: [],
        dataset: [],
        valueset: []
    }, settings);

    this.currentActiveGroupIdx = null;

    this.DOM = {
        scope: elm,
        outerCircle: $(),
        circleLine: $(),
        innerCircle: $()
    };

    this.segmentsPositions = []; // stores initial positions of each one of the segments [[x,y],[x,y],...]

    this.render();

    setTimeout(this.events.bind.bind(this), 2000);

    // setTimeout( this.setValue.bind(this), 0 );
};

EMC.components.SegmentsChart.prototype = {
    events: {
        bind: function bind() {
            this.DOM.paths = this.DOM.scope.find('path');
            this.DOM.texts = this.DOM.scope.find('.textWrap');
            this.DOM.lines = this.DOM.scope.find('polyline');

            var itemsGroup = this.DOM.paths.add(this.DOM.texts).add(this.DOM.lines);
            // .add(this.DOM.outerCircle)
            // .add(this.DOM.circleLine)
            // .add(this.DOM.innerCircle);

            itemsGroup.on('mouseenter', this.events.callbacks.hoverSegment.bind(this)).on('mouseleave', this.events.callbacks.hoverSegment.bind(this)).on('click', this.events.callbacks.toggleSegment.bind(this));

            //this.DOM.scope.on('click', itemsGroup, this.events.callbacks.toggleSegment.bind(this))
        },
        callbacks: {
            hoverSegment: function hoverSegment(e) {
                var idx = $(e.currentTarget).index(),
                    state = e.type == 'mouseenter';

                this.setGroupClass(idx, 'hover', state);

                // this.DOM.paths.eq(idx)
                //     .add(this.DOM.lines.eq(idx))
                //     .add(this.DOM.texts.eq(idx))
                //     .add(this.DOM.outerCircle.eq(idx))
                //     // .add(this.DOM.circleLine.eq(idx))
                //     // .add(this.DOM.innerCircle.eq(idx))
                //     [e.type == 'mouseenter' ? 'svgAddClass' : 'svgRemoveClass']('hover');
            },

            toggleSegment: function toggleSegment(e) {
                var idx = $(e.currentTarget).index(),
                    state;

                if (idx == this.currentActiveGroupIdx) {
                    state = false;
                    // save current index
                    this.currentActiveGroupIdx = null;
                } else {
                    state = true;
                    this.currentActiveGroupIdx = idx;
                }

                this.cleanActive();

                if (state) this.activeStyles(idx);

                var filterBy = this.DOM.texts.eq(idx).find('.lbl').text();

                // trigger a segment click event which is being listened on other components
                this.DOM.scope.trigger('segmentClick', [filterBy, state]);
            }
        }
    },

    // reset the state of the UI so nothing is selected
    cleanActive: function cleanActive() {
        // remove all other indexes "active" state
        this.DOM.paths.add(this.DOM.lines)
        //.add(this.DOM.texts)
        .add(this.DOM.outerCircle).add(this.DOM.circleLine).add(this.DOM.innerCircle).svgRemoveClass('active').css({ 'transform': 'none' });

        this.DOM.texts.each(function () {
            var $this = $(this),
                textsPos = $this.data('origPos');

            if (textsPos) $this.css({ 'transform': 'translate(' + textsPos[0] + 'px, ' + textsPos[1] + 'px)' });
        });
    },

    // set inline styles for "active" segments
    activeStyles: function activeStyles(idx) {
        var itemsGroup = this.DOM.paths.eq(idx).add(this.DOM.lines.eq(idx)).add(this.DOM.outerCircle.eq(idx)).add(this.DOM.circleLine.eq(idx)).add(this.DOM.innerCircle.eq(idx)),
            textsGroup = this.DOM.texts.eq(idx),
            textsGroupPosition = textsGroup[0].style.transform.replace('translate(', '').replace(')', '').split(',');

        this.setGroupClass(idx, 'active', true);

        textsGroupPosition[0] = parseInt(textsGroupPosition[0]);
        textsGroupPosition[1] = parseInt(textsGroupPosition[1]);

        if (!this.segmentsPositions[idx]) {
            console.warn("something was wrong, idx doesn't exist: ", this.segmentsPositions, idx);
            return false;
        }

        var delta = [this.segmentsPositions[idx][0] * 0.2, this.segmentsPositions[idx][1] * 0.2];
        textsGroup.data('origPos', textsGroupPosition);

        textsGroup.css({ 'transform': 'translate(' + (textsGroupPosition[0] + delta[0]) + 'px,' + (textsGroupPosition[1] + delta[1]) + 'px)' });
        itemsGroup.css({ 'transform': 'translate(' + delta[0] + 'px,' + delta[1] + 'px)' });
    },

    setGroupClass: function setGroupClass(idx, classname, state) {
        this.DOM.paths.eq(idx).add(this.DOM.lines.eq(idx)).add(this.DOM.texts.eq(idx)).add(this.DOM.outerCircle.eq(idx))
        // .add(this.DOM.circleLine.eq(idx))
        // .add(this.DOM.innerCircle.eq(idx))
        [state ? 'svgAddClass' : 'svgRemoveClass'](classname);
    },

    render: function render() {
        // this.settings.values

        var that = this,
            dataset = this.settings.dataset,
            valueset = this.settings.valueset,
            colors = this.settings.colors,
            labels = this.settings.labels;

        //var datasum = 0;

        // for(var i = 0; i < dataset.length; i++){
        //     datasum += dataset[i];
        // }

        // if(datasum !== 100){
        //   console.warn("the total amount is not equal to 100%");
        //   dataset = null;
        // }

        var width = this.DOM.scope[0].offsetWidth,
            height = this.DOM.scope[0].offsetHeight,
            minOfWH = Math.min(width, height) / 2,
            initialAnimDelay = 300,
            arcAnimDelay = 150,
            arcAnimDur = 2000,
            secDur = 1000,
            secIndividualdelay = 150,
            radius;

        // calculate minimum of width and height to set chart radius
        if (minOfWH > 200) {
            radius = 200;
        } else {
            radius = minOfWH;
        }

        // append svg
        var svg = d3.select(this.DOM.scope[0]).append('svg').attr({
            //  'width'  : width,
            'height': height,
            'class': 'segments-chart'
        }).append('g');

        svg.attr({ 'transform': 'translate(' + width / 2 + ',' + height / 2 + ')' });

        // for drawing slices
        var arc = d3.svg.arc().outerRadius(radius * 0.6).innerRadius(radius * 0.55);

        // for labels and polylines
        var outerArc = d3.svg.arc().innerRadius(radius * 0.85).outerRadius(radius * 0.85);

        // d3 color generator
        // var c10 = d3.scale.category10();

        var pie = d3.layout.pie().value(function (d) {
            return d;
        });

        var draw = function draw() {
            svg.append("g").attr("class", "slices");
            svg.append("g").attr("class", "circles");
            svg.append("g").attr("class", "lines");
            svg.append("g").attr("class", "labels");

            // define slice
            var slice = svg.select('.slices').datum(dataset).selectAll('path').data(pie);

            slice.enter().append('path').attr({
                'fill': function fill(d, i) {
                    // slice color
                    return colors[i];
                },
                'd': arc
            }).attr('transform', function (d, i) {
                return 'rotate(-180, 0, 0)';
            }).style('opacity', 0).transition().delay(function (d, i) {
                return i * arcAnimDelay + initialAnimDelay;
            }).duration(arcAnimDur).ease('elastic').style('opacity', 1).attr({ 'transform': 'rotate(0,0,0)' });

            slice.transition().delay(function (d, i) {
                return arcAnimDur + i * secIndividualdelay;
            }).duration(secDur);

            function midAngle(d) {
                return d.startAngle + (d.endAngle - d.startAngle) / 2;
            }

            var circle = svg.select(".circles");

            var outerCircle = circle.selectAll(".outerCircle").data(pie(dataset));

            outerCircle.enter().append('ellipse').attr({
                'cx': function cx(d, i) {
                    that.DOM.outerCircle = that.DOM.outerCircle.add($(this));
                    return arc.centroid(d)[0];
                },
                'cy': function cy(d, i) {
                    return arc.centroid(d)[1];
                },
                'rx': '10',
                'ry': '10'
            }).style("opacity", 0).style({ 'fill': function fill(d, i) {
                    return colors[i];
                },
                'stroke': function stroke(d, i) {
                    return colors[i];
                } }).transition().delay(function (d, i) {
                return arcAnimDur / 4 + i * secIndividualdelay;
            }).duration(secDur).style('opacity', 1).attr("class", "outerCircle");

            var circleLine = circle.selectAll(".circleLine").data(pie(dataset));

            circleLine.enter().append('line').attr('x1', function (d, i) {
                that.segmentsPositions.push(arc.centroid(d));
                that.DOM.circleLine = that.DOM.circleLine.add($(this));
                return arc.centroid(d)[0];
            }).attr('y1', function (d, i) {
                return arc.centroid(d)[1];
            }).attr('x2', function (d, i) {
                return outerArc.centroid(d)[0];
            }).attr('y2', function (d, i) {
                return outerArc.centroid(d)[1];
            }).style("opacity", 0).style('stroke', 'white').style('stroke-width', 8).transition().delay(function (d, i) {
                return arcAnimDur / 4 + i * secIndividualdelay;
            }).duration(secDur).style('opacity', 1).attr("class", "circleLine");

            var innerCircle = circle.selectAll(".innerCircle").data(pie(dataset));

            innerCircle.enter().append('circle').style("opacity", 0).attr('cx', function (d, i) {
                that.DOM.innerCircle = that.DOM.innerCircle.add($(this));
                return arc.centroid(d)[0];
            }).attr('cy', function (d, i) {
                return arc.centroid(d)[1];
            }).attr('r', '4').style('fill', function (d, i) {
                return colors[i];
            }).style('stroke', 'white').style('stroke-width', 3).transition().delay(function (d, i) {
                return arcAnimDur / 4 + i * secIndividualdelay;
            }).duration(secDur).style('opacity', 1).attr("class", "innerCircle");

            // define text

            var text = svg.select(".labels").selectAll("text").data(pie(dataset));

            text.enter().append("g").attr('transform', function (d) {

                // calculate outerArc centroid for 'this' slice
                var pos = outerArc.centroid(d);

                // define left and right alignment of text labels

                pos[0] = radius * (midAngle(d) < Math.PI ? 1.2 : -1.18) + "px";
                pos[1] = arc.centroid(d)[1] > 0 ? pos[1] - 35 + "px" : pos[1] + 25 + "px";

                this.style.transform = "translate(" + pos + ")";

                //return "translate(" + pos + ")";
            }).attr("class", "textWrap").append('text').attr('dy', '0.35em').style("opacity", 0).style('fill', function (d, i) {
                return colors[i];
            }).transition().delay(function (d, i) {
                return arcAnimDur / 6 + i * secIndividualdelay;
            }).duration(secDur).style('opacity', 1);

            // define inner text

            var tspan = d3.selectAll("text").data(pie(dataset));

            for (var i = 0; i < tspan[0].length; i++) {
                tspan[0][i].innerHTML += "<tspan class='tspan val'></tspan>\n <tspan class='tspan lbl'></tspan>";
            }

            var topText = d3.selectAll(".val").data(pie(dataset));

            topText.text(function (d, i) {
                return valueset[i];
            })
            // .attr('y', function(d) {
            //      return arc.centroid(d)[1] > 0 ? -12 : 20;
            //  })
            .attr('x', 0).attr('y', 0);

            var bottomText = d3.selectAll(".lbl").data(pie(dataset));

            bottomText.text(function (d, i) {
                return labels[i];
            })
            /*    .attr('y', function(d) {
                    return arc.centroid(d)[1] > 0 ? -12 : 20;
                })*/
            .attr('x', 0).attr('y', 20);

            // define lines

            var polyline = svg.select(".lines").selectAll("polyline").data(pie(dataset));

            polyline.enter().append("polyline")
            /*    .style("opacity", 0.5)*/
            .style('stroke', function (d, i) {
                return colors[i];
            }).attr('points', function (d) {
                var pos = outerArc.centroid(d);
                pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                return [arc.centroid(d), arc.centroid(d), arc.centroid(d)];
            }).transition().duration(secDur).delay(function (d, i) {
                return arcAnimDur / 4 + i * secIndividualdelay;
            }).attr('points', function (d) {
                var pos = outerArc.centroid(d);
                pos[0] = radius * 1.5 * (midAngle(d) < Math.PI ? 1 : -1);
                return [arc.centroid(d), outerArc.centroid(d), pos];
            });
        };

        draw();
    }
};
"use strict";

// data - an Array of items, representing the DOM structure of the main menu

EMC.components.sidebar = function (data) {
    "use strict"

    // DOM ELEMENTS CACHING
    ;
    var menuTmpl = EMC.tmpl("sidemenu"),
        events,
        DOM = {};

    DOM.scope = $('#sidebar');
    DOM.sidebarWrap = $('.sidebar__wrap');
    DOM.mainmenu = $('.mainmenu');
    DOM.noResults = DOM.mainmenu.find('.mainmenu__noReults');
    DOM.search = $('.sidebar__search__input');
    DOM.clearSearch = $('.sidebar__search__clear');
    DOM.datalist = $('#sidebar__search__datalist');

    var clientRect = DOM.scope[0].getBoundingClientRect();
    DOM.scope.data('startPost', clientRect.top);

    /////////////////////////////////////////
    // Events

    // events callbacks
    events = {
        bind: function bind() {
            DOM.mainmenu.on('click.menu', 'dt', events.callbacks.toggleMenuItem);

            DOM.search.on('keydown', events.callbacks.searchOnKeyDown.bind(events.callbacks)).on('input change', events.callbacks.search);

            DOM.clearSearch.on('click', events.callbacks.clearSearch);

            $(window).on('scroll', events.callbacks.onScroll);

            // http://stackoverflow.com/a/2196683/104380
            jQuery.expr[':'].Contains = function (a, i, m) {
                return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
            };
        },

        callbacks: {
            toggleMenuItem: function toggleMenuItem(e) {
                if (e.target.nodeName == 'A') return true;

                var target = $(this);
                target.parent().toggleClass('closed').find('dl').addClass('closed'); // close all inner menues, if any were open
            },

            search: function search(e) {
                var value = this.value.trim(),
                    foundItems;

                DOM.mainmenu.toggleClass('searchMode', value.length > 2);
                DOM.mainmenuItems.removeClass('show');

                // do nothing if there aren't at least 3 characters, and cleanup any residual classnames
                if (value.length < 3) {
                    toggleNoResults();
                    return;
                }

                // search all 'a' elements which contains the string
                foundItems = DOM.mainmenu.find("a:Contains(" + value + ")").parentsUntil(DOM.mainmenu).addClass('show');

                toggleNoResults(!foundItems.length);
            },

            searchOnKeyDown: function searchOnKeyDown(e) {
                if (e.keyCode == 27) {
                    this.clearSearch();
                    return false;
                }
            },

            clearSearch: function clearSearch() {
                DOM.search.val('');
                events.callbacks.search.apply(DOM.search[0]);
            },

            onScroll: function onScroll(e) {
                var scrollY = window.scrollY;

                if (scrollY < DOM.scope.data('startPost')) DOM.scope.removeClass('fixed');else if (DOM.scope[0].getBoundingClientRect().top < 0) DOM.scope.addClass('fixed');
            }
        }
    };

    function toggleNoResults() {
        var state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        DOM.noResults.toggleClass('show', state);
    }

    function setActiveMenuItem(url) {
        // remove last "active" nav item
        DOM.mainmenu.find('.active').removeClass('active');
        // find new "active" nav item
        var activeSideMenuItem = DOM.mainmenu.find('a[href="' + url + '"]');

        // set as "active"
        activeSideMenuItem.addClass('active');
    }

    var helpers = {
        riskLevel: function riskLevel(item) {
            return item["riskLevel"] ? "severityMark--" + item["riskLevel"] : "";
        }
    };

    function buildDataList() {
        var datalist_items = $();

        function recursive(lisData) {
            for (var i = lisData.length; i--;) {
                // make sure not to add already added items
                if (datalist_items.text().indexOf(lisData[i].name) == -1)
                    // create "option" elements
                    datalist_items = datalist_items.add($('<option>').html(lisData[i].name));
                if (lisData[i].items) recursive(lisData[i].items);
            }
        }

        recursive(data);

        DOM.datalist.html(datalist_items);
    }

    var navigateMenuWithKeys = (function () {
        var menuLinksIndexes = [],
            currentLink,
            curentHref,
            currentLinkIndex,
            nextLink = [],
            menuLinks,
            nextIndex,
            searchMode,
            isParentVisible,
            isFirstLink,
            isListClosed;

        function init() {
            // populate all the menu links (can only happen in the init() )
            menuLinks = DOM.mainmenu.find('a');

            menuLinks.each(function () {
                menuLinksIndexes.push(this.getAttribute('href'));
            });

            // Event binding
            DOM.scope.on('keydown', onKeyDown);
        }

        function getNextLink(inc) {
            var result;

            while (true) {
                nextIndex += inc;
                result = menuLinks.eq(nextIndex);

                isParentVisible = result.parent().hasClass('show');
                isFirstLink = result.parent('dt').length;
                isListClosed = result.closest('dl.closed').length;

                if (!result.length) break;

                if (searchMode && !isParentVisible && !isFirstLink) continue;

                if (!isListClosed || isFirstLink) break;
            }

            return result;
        }

        function navigate(pressedKey) {
            currentLink = menuLinks.filter('.active'), curentHref = currentLink.attr('href'), currentLinkIndex = menuLinksIndexes.indexOf(curentHref), nextLink = [], searchMode = DOM.mainmenu.hasClass('searchMode'), isParentVisible, isFirstLink, isListClosed;

            if (pressedKey == 'down') {
                nextIndex = currentLinkIndex;

                nextLink = getNextLink(1);

                if (!nextLink.length) nextLink = menuLinks.eq(0);
            } else if (pressedKey == 'up') {
                nextIndex = currentLinkIndex;

                nextLink = getNextLink(-1);

                if (!nextLink.length) nextLink = menuLinks.eq(menuLinks.length);
            } else if (pressedKey == "enter") Router.navigate(curentHref);else if (pressedKey == "right") {

                var linksParent = currentLink.closest('dt');

                if (linksParent.length && linksParent.closest('dl.closed').length) linksParent.closest('dl.closed').removeClass("closed");
            } else if (pressedKey == "left") {

                if (currentLink.closest('dt').length && !currentLink.closest('dt').closest('dl.closed').length) currentLink.closest('dt').closest('dl').addClass("closed");
            } else return;

            if (nextLink.length) {
                currentLink.removeClass('active');
                nextLink.addClass('active');
            }
        }

        function onKeyDown(e) {
            var pressedKey = null;

            switch (e.keyCode) {

                case 40:
                    pressedKey = 'down';
                    break;

                case 38:
                    pressedKey = 'up';
                    break;

                case 13:
                    pressedKey = 'enter';
                    break;

                case 39:
                    pressedKey = 'right';
                    break;

                case 37:
                    pressedKey = 'left';
                    break;

                default:
                    return;
            }

            navigateMenuWithKeys.navigate(pressedKey);

            e.preventDefault();
            return false;
        }

        return {
            init: init,
            navigate: navigate,
            getNextLink: getNextLink
        };
    })();

    function init() {
        var HTML = menuTmpl({ items: data, template: menuTmpl, helpers: helpers, path: '/html-gateway-api/protection/' });
        DOM.mainmenu.append(HTML);

        DOM.mainmenuItems = DOM.mainmenu.find('dt, dd, dl');
        DOM.mainmenuItemsLinks = DOM.mainmenu.find('a');
        //build(data, 0);
        //console.log(nav);
        events.bind();
        navigateMenuWithKeys.init();
        // buildDataList();
    }

    init();

    return {
        init: init,
        set: setActiveMenuItem
    };
};
"use strict";

EMC.components.summaryChildren = function (elm, settings) {
    var promise; // the request's promise object

    var defaults = {
        DOM: {
            elm: elm
        },

        templates: {
            boxes: EMC.tmpl("summary-children-box-item"),
            table: EMC.tmpl("summary-children-table")
        },

        view: 'boxes',

        endPoint: EMC.config.API.locations
    };

    // update defaults with settings
    settings = $.extend(defaults, settings);

    // controllers for the different views of Summary Children component
    var viewsController = {
        boxes: {
            init: function init() {
                settings.DOM.elm.removeAttr('style');
                viewsController.boxes.events.bind();
            },

            events: {
                bind: function bind() {
                    settings.DOM.elm.on('click', '.colItem', viewsController.boxes.events.callbacks.colItemClick);
                },

                callbacks: {
                    // Make sure when clicking on a button which is inside a link, do not trigger the link default behavior
                    colItemClick: function colItemClick(e) {
                        if (e.target.dataset && e.target.dataset.modal) {
                            EMC.components.modals.click_show.call(e.target);
                            return false;
                        }
                    }
                }
            }
        },

        table: {
            DOM: {},

            init: function init() {
                this.populateDOM();

                this.events.bind();
                console.log(settings.DOM.elm.find("table"));
                settings.DOM.elm.find("table").height(this.DOM.summaryChildrenTable.height());
                this.DOM.summaryChildrenTable.stupidtable().on('aftertablesort', function (e, data) {
                    // console.log(data);
                });
            },

            // @filterBy - value of which to filter by
            // @state    - toggle filtering (should filter or not at all)
            filterTable: function filterTable(filterBy, colIndex, state) {
                if (!filterBy || !colIndex || !(typeof colIndex == 'number')) {
                    console.warn('missing or wrong parameters');
                    return false;
                }

                this.DOM.summaryChildrenTable.find('> tbody > tr').each(function () {
                    var $tr = $(this).removeAttr('style');

                    if (state && $tr.find('td').eq(colIndex).data('sortValue') != filterBy) $tr.hide();
                });
            },

            populateDOM: function populateDOM() {
                this.DOM.summaryChildrenTable = settings.DOM.elm.find('.summaryChildren.table');

                EMC.utilities.checkDOMbinding(this.DOM);
            },

            events: {
                bind: function bind() {
                    settings.DOM.elm.on('blur', ':checkbox', this.callbacks.onBlur);
                    settings.DOM.elm.on('click', '.dropDownMenu > a', this.callbacks.dropDownMenuClick);
                },

                callbacks: {
                    onBlur: function onBlur() {
                        var that = this;
                        // set "checked" state of the input element to "false" so the dropdown menu will be hidden
                        setTimeout(function () {
                            that.checked = false;
                        }, 200);
                    },

                    dropDownMenuClick: function dropDownMenuClick() {
                        var $dropDownItem = $(this),
                            idx = $dropDownItem.closest('th').index(),
                            value = $dropDownItem.data('filterBy'),
                            state;

                        $dropDownItem.toggleClass('active').siblings().removeClass('active');
                        state = $dropDownItem.hasClass('active');

                        viewsController.table.filterTable(value, idx, state);
                        return false;
                    }
                }
            }
        }
    };

    var state = {
        data: null
    };

    function init() {
        settings.DOM.elm.addClass('loading');

        promise && promise.abort(); // cancel the last request if there was any
        promise = getData(settings.mock);

        $.when(promise).done(render).fail(onGetDataFail);
    };

    function getData(request) {
        return request || $.ajax({
            type: 'GET',
            url: '/get-children',
            data: { 'location': 'united-states' }
        });
    };

    function onGetDataFail() {
        settings.DOM.elm.removeClass('loading');
    };

    function render(data, view) {
        settings.DOM.elm.removeClass('loading');

        if (!data && !state.data) return;

        if (data) state.data = data;

        view = view || settings.view;

        // settings.DOM.elm
        var HTML = settings.templates[view]({ items: state.data });

        settings.DOM.elm.html(HTML);

        viewsController[view].init();
    };

    ///////////////////////////////
    init();

    return {
        init: init,
        getData: getData,
        render: render
    };
};
'use strict';

EMC.components.vBars = function (elm) {
    this.DOM = {
        scope: elm // the component placeholder
    };

    // mock data
    this.mock = {
        title: 'Protection history',
        avarage: 0,
        items: [{
            riskLevel: '',
            value: Math.floor(Math.random() * 100) + 1,
            label: 'jan'
        }, {
            riskLevel: '',
            value: Math.floor(Math.random() * 100) + 1,
            label: 'feb'
        }, {
            riskLevel: '',
            value: Math.floor(Math.random() * 100) + 1,
            label: 'mar'
        }, {
            riskLevel: '',
            value: Math.floor(Math.random() * 100) + 1,
            label: 'apr'
        }, {
            riskLevel: '',
            value: Math.floor(Math.random() * 100) + 1,
            label: 'may'
        }, {
            riskLevel: '',
            value: Math.floor(Math.random() * 100) + 1,
            label: 'jun'
        }, {
            riskLevel: '',
            value: Math.floor(Math.random() * 100) + 1,
            label: 'jul'
        }, {
            riskLevel: '',
            value: Math.floor(Math.random() * 100) + 1,
            label: 'aug'
        }, {
            riskLevel: '',
            value: Math.floor(Math.random() * 100) + 1,
            label: 'sep'
        }, {
            riskLevel: '',
            value: Math.floor(Math.random() * 100) + 1,
            label: 'oct'
        }, {
            riskLevel: '',
            value: Math.floor(Math.random() * 100) + 1,
            label: 'nov'
        }, {
            riskLevel: '',
            value: Math.floor(Math.random() * 100) + 1,
            label: 'dec'
        }]
    };

    var that = this;

    this.mock.items.forEach(function (item) {
        that.mock.avarage = (that.mock.avarage + item.value) / 2;

        if (item.value == 100) item.riskLevel = 'none';else if (item.value < 50) item.riskLevel = 'high';else if (item.value >= 50) item.riskLevel = 'medium';
    });

    this.init();
};

EMC.components.vBars.prototype = {
    template: EMC.tmpl("components\\vBars"),

    init: function init() {
        if (this.DOM.scope) this.DOM.scope.addClass('loading');

        this.promise && this.promise.abort(); // cancel the last request if there was any
        this.promise = this.getData(this.mock);

        $.when(this.promise).done(this.render.bind(this)).fail(this.onGetDataFail);
    },

    getData: function getData(request) {
        return request || $.ajax({
            type: 'GET',
            url: EMC.API.baseURL + settings.endPoint,
            data: data,
            dataType: 'jsonp',
            crossDomain: true
        });
    },

    onGetDataFail: function onGetDataFail() {
        if (this.DOM.scope) this.DOM.scope.removeClass('loading');

        // should write some error message, or at least try again a few times before showing such message
    },

    render: function render(data) {
        if (this.DOM.scope) this.DOM.scope.removeClass('loading');

        if (!data) return;

        var HTML = $(this.template(data));

        if (this.DOM.scope) this.DOM.scope.replaceWith(this.DOM.scope = HTML);else console.warn('no DOM scope found');

        this.animate();
    },

    // animate bars
    animate: function animate() {
        this.DOM.scope.find('.bar').each(function (i) {
            var bar = this;
            setTimeout(function () {
                bar.style.height = bar.dataset.to;
            }, i * 50 + 200);
        });
    }
};
'use strict';

////////////////////////////////////
// Main dashboard controller. A system might have several pages,
// some might be single-page apps, some are regular pages.

EMC.routes.main = function () {
    "use strict"

    ////////////////////////////////////////////////////////
    // DON Page elements' Caching

    ;
    var DOM = {};

    function populateDOM() {
        DOM.scope = $('#page');
        DOM.sidebar = $('#sidebar');
        DOM.mainmenu = DOM.sidebar.find('.mainmenu');
        DOM.pageheader = DOM.scope.find('.pageheader');

        EMC.utilities.checkDOMbinding(DOM);
    }

    ////////////////////////////////////////////////////
    // Page Events

    var events = {
        bind: function bind() {
            $(document).on('click.route', '[data-href]', events.callbacks.changeRoute);
        },

        callbacks: {
            changeRoute: function changeRoute(e) {
                // make sure the modal will still work if triggered inside the "changeRoute" callback
                if (e.target.dataset && e.target.dataset.modal) {
                    EMC.components.modals.click_show.call(e.target);
                    return false;
                }

                var url = $(this).data('href');
                if (url) Router.navigate(url);
            }
        }
    };

    function viewChange(route, routeData) {
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

    function routes() {
        // Add routes (might use another router later, this is good for now)
        Router.add(/html-gateway-api\/protection\/locations\/(.*)\/(.*)/, function () {
            viewChange('protection', _.values(Router.getFragment().split('/')));
        }).add(/html-gateway-api\/protection\/locations\/(.*)/, function () {
            viewChange('protection', _.values(Router.getFragment().split('/')));
        }).add(/html-gateway-api\/protection\/locations/, function () {
            viewChange('protection', _.values(Router.getFragment().split('/')));
        }).add(function () {
            console.log('default route');
            // temp default route:
            Router.navigate('/html-gateway-api/protection/locations/united-states');
        }).listen();

        Router.check();
    }

    // gets section data (protection, utilization,...)
    function getData() {
        // get URL fragment Array (for breadcrumbs)
        var urlFragmentArr = Router.getFragment().split('/');
        urlFragmentArr.shift();

        // default main view
        var view = urlFragmentArr[0] || 'protection';

        return $.ajax({
            type: 'GET',
            url: '/html-gateway-api/mocks/' + view + '.txt',
            dataType: 'json'
        });
    }

    var componentsLoader = {
        sidebar: {
            instance: null,
            init: function init() {
                componentsLoader.sidebar.instance = EMC.components.sidebar(EMC.state.protection);
            }
        }
    };

    ////////////////////////////////////////////////////
    // Initialize page

    function init() {
        $.when(getData()).done(function (res) {
            if (!res || !(res instanceof Object) || !res.length) {
                return;
            }

            EMC.state.protection = res;
            componentsLoader.sidebar.init();

            routes();
        }).fail();

        populateDOM();
        events.bind();
    }

    init();
};
"use strict";

// **** EVERYTHING ON THIS FILE IS TEMPORARY BECAUSE THE STRUCTURE OF THE PAGES IS STILL UNKOWN SO I CAN'T STRUCTURE THE CODE YET ***

EMC.routes.protection = function (viewPath) {
    "use strict";

    var promise,
        pageTemplate = EMC.tmpl("protection"),
        pageData,
        templateHelpers,
        componentsLoader;

    var DOM = { scope: $('#page') };

    // set loading state to the page
    DOM.scope.addClass('loading');

    ////////////////////////////////////////////////
    // Get page data from server (deprecated, this data, for all protection pages is coming in one big JSON)
    // function getData(){
    //     return $.ajax({
    //         type : 'GET',
    //         url  : '/html-gateway-api/mocks/locations.' + viewPath.join('.') + '.json'
    //     })
    // };

    // function onGetDataFail(){
    //     settings.DOM.elm.removeClass('loading');
    // };

    function render(data) {
        DOM.scope.removeClass('loading');

        if (!data) return;
        pageData = data;

        DOM.template = $(pageTemplate(data));
        populateDOM();

        // settings.DOM.elm
        DOM.scope.html(DOM.template);

        return data;
    };

    function postRender() {
        for (var i in componentsLoader) {
            if (componentsLoader.hasOwnProperty(i)) componentsLoader[i].init();
        }

        events.bind();

        // must be last:
        EMC.utilities.scriptsTemplates(DOM.scope);
    }

    /////////////////////////////////
    // DOM caching
    function populateDOM() {
        DOM.template = $(DOM.template); //jQuerify it

        DOM.dateRange = DOM.template.find('.dateRangeInput');
        DOM.summaryChildrenWrap = DOM.template.find('.summaryChildrenWrap');
        DOM.protectionLevel = DOM.template.find('.protectionLevel');
        DOM.protectionHistory = DOM.template.find('.protectionHistory');
        DOM.breadcrumbs = DOM.template.filter('.breadcrumbs');
        DOM.childrenViewBtns = DOM.template.find('.childrenViewBtns');
        DOM.protectionGaps = DOM.template.find('.protectionGaps');

        EMC.utilities.checkDOMbinding(DOM);
    };

    var events = {
        bind: function bind() {
            DOM.childrenViewBtns.on('click', 'button', events.callbacks.childrenView);

            $(window).on('scroll', events.callbacks.onScroll);
        },

        callbacks: {
            childrenView: function childrenView(e) {
                var button = $(this),
                    view = button.data('view');

                if (button.hasClass('active')) return;

                // mark current button as "active"
                button.addClass('active').siblings().removeClass('active');

                // change component view
                componentsLoader.summaryChildren.instance.render(null, view);
                EMC.utilities.scriptsTemplates(DOM.scope);
            },

            onScroll: function onScroll(e) {
                var scrollY = window.scrollY;

                if (scrollY < DOM.breadcrumbs.data('startPost')) DOM.breadcrumbs.removeClass('fixed');else if (DOM.breadcrumbs[0].getBoundingClientRect().top < 10) DOM.breadcrumbs.addClass('fixed');
            }
        }
    };

    // page components
    componentsLoader = {
        breadcrumbs: {
            instance: null,
            init: function init() {
                // add component to the DOM and re-save DOM pointer to the new replaced HTML element
                DOM.breadcrumbs.replaceWith(DOM.breadcrumbs = componentsLoader.breadcrumbs.instance.DOM.scope);

                var clientRect = DOM.breadcrumbs[0].getBoundingClientRect();

                DOM.breadcrumbs.data({
                    'startPost': DOM.breadcrumbs.offset().top - 10,
                    'height': clientRect.height
                });
            },
            add: function add(data) {
                componentsLoader.breadcrumbs.instance.add.call(componentsLoader.breadcrumbs.instance, data);
            }
        },

        rangePicker: {
            init: function init() {
                var elm = DOM.dateRange;
                elm.rangePicker({ minDate: [2, 2009], maxDate: [9, 2015], RTL: true })
                // subscribe to the "done" event after user had selected a date
                .on('datePicker.done', function (e, result) {
                    if (result instanceof Array) console.log(new Date(result[0][1], result[0][0] - 1), new Date(result[1][1], result[1][0] - 1));else console.log(result);
                });

                elm.rangePicker({ setDate: [[1, 2015], [12, 2015]], closeOnSelect: false });
            }
        },

        protectionLevel: {
            init: function init() {
                EMC.components.protectionLevel(DOM.protectionLevel, pageData);
            }
        },

        summaryChildren: {
            instance: null,
            init: function init() {
                if (pageData.items) {

                    pageData.items.forEach(function (item) {
                        item.path = pageData.path + item.name.split(' ').join('-');
                    });
                    var mock = _.sortBy(pageData.items, 'protectionLevel');

                    componentsLoader.summaryChildren.instance = EMC.components.summaryChildren(DOM.summaryChildrenWrap, { mock: mock }, pageData);
                }
            }
        },

        protectionGaps: {
            instance: null,
            init: function init() {
                if (!pageData.items) {
                    EMC.routes.protection.gaps(DOM.protectionGaps, viewPath);
                }
            }
        },

        protectionHistory: {
            instance: null,
            init: function init() {
                var elm = DOM.protectionHistory.find('.vBars');
                componentsLoader.protectionHistory.instance = new EMC.components.vBars(elm);
            }
        },

        groupItem1: {
            instance: null,
            init: function init() {
                var elm = DOM.scope.find('.groupItem1');
                componentsLoader.groupItem1.instance = new EMC.components.hBars(elm);
            }
        },

        changeRate: {
            instances: {
                jobs: null,
                client: null
            },

            init: function init() {
                DOM.changeRateJobs = DOM.scope.find('.changeRate--jobs');
                DOM.changeRateClient = DOM.scope.find('.changeRate--client');

                var instances = componentsLoader.changeRate.instances;

                var jobsMock = {
                    title: 'Jobs Success',
                    value: 95,
                    change: 'up'
                };

                var clientMock = {
                    title: 'Client Success',
                    value: 70,
                    change: 'down'
                };

                instances.jobs = new EMC.components.changeRate(DOM.changeRateJobs, { mock: jobsMock });
                instances.client = new EMC.components.changeRate(DOM.changeRateClient, { mock: clientMock });
            }
        }
    };

    function init() {
        // promise && promise.abort(); // cancel the last request if there was any
        // promise = getData();

        // $.when( promise )
        //     .then(render)
        //     .done(postRender)
        //     .fail(onGetDataFail);

        // create Breadcrumbs instance
        componentsLoader.breadcrumbs.instance = new EMC.components.Breadcrumbs();

        // get the object needed for this page (from the main system data structure) and run a callback function
        pageData = EMC.utilities.getObjectByPath(EMC.state.protection, viewPath.slice(1, viewPath.length), componentsLoader.breadcrumbs.add);

        if (!pageData) {
            console.log('pageData is wrong or undefined: ', pageData);
            return false;
        }

        render(pageData);
        postRender();
    }

    init();
};
'use strict';

EMC.routes.protection.gaps = function (elem, viewPath) {
    "use strict"

    // Define DOM object
    ;
    var DOM = {
        scope: elem
    };

    /////////////////////////////////
    // DOM caching
    function populateDOM() {
        DOM.protectionGapsTable = DOM.scope.find('.protectionGapsTable');
        DOM.segmentsChartWrap = DOM.scope.find('.segmentsChartWrap');
        DOM.protectionLevel = DOM.scope.find('.protectionLevel');

        EMC.utilities.checkDOMbinding(DOM);
    };

    //////////////////////////////////////
    // Controller's components loader
    var componentsLoader = {
        protectionLevel: {
            init: function init() {
                if (DOM.protectionLevel) {
                    // get the object needed for this page (from the main system data structure)
                    var pageData = EMC.utilities.getObjectByPath(EMC.state.protection, viewPath.slice(1, viewPath.length));
                    EMC.components.protectionLevel(DOM.protectionLevel, pageData);
                }
            }
        },

        segmentsChart: {
            instance: null,
            data: null,
            init: function init(res) {
                componentsLoader.segmentsChart.data = transformData(res);
                componentsLoader.segmentsChart.instance = new EMC.components.SegmentsChart(DOM.segmentsChartWrap, componentsLoader.segmentsChart.data);
            }
        },

        table: {
            init: function init(res) {

                var categoryFilter = transformData(res).labels,
                    typeFilter = transformData(res).types;

                // render table template
                var protectionGapsTable = $(EMC.tmpl("protection-gaps-table")({ items: res, typeFilter: typeFilter, categoryFilter: categoryFilter }));

                // add the component's classes before replacing it
                protectionGapsTable.addClass(DOM.protectionGapsTable.attr('class'));

                // replace page component with real template
                DOM.protectionGapsTable.replaceWith(protectionGapsTable);
                // re-save DOM pointer with new DOM element generated by the template
                DOM.protectionGapsTable = protectionGapsTable;

                zebra();

                DOM.tableFilters = protectionGapsTable.find('.filter');

                //DOM.protectionGapsTable.parent().height( DOM.protectionGapsTable.height() );
                // sorting
                protectionGapsTable.stupidtable().on('aftertablesort', function (e, data) {
                    zebra();
                });
            }
        }
    };

    var events = {
        bind: function bind() {
            DOM.segmentsChartWrap.on('segmentClick', this.callbacks.onSegmentClick);
            DOM.protectionGapsTable.on('blur', ':checkbox', this.callbacks.onBlur).on('click', '.dropDownMenu > a', this.callbacks.dropDownMenuClick);
        },

        callbacks: {
            onSegmentClick: function onSegmentClick(e, value, state) {
                filterTable(value, 2, state);

                var $dropDown = DOM.protectionGapsTable.find('th').eq(2).find('.dropDownMenu'),
                    $dropDownItem = $dropDown.find('a').filter(function () {
                    return $(this).data('filterBy').toLowerCase() == value.toLowerCase();
                });

                resetDropDownFilters();

                toggleDropDownItemActive($dropDown, $dropDownItem.index(), state);
            },

            onBlur: function onBlur() {
                var that = this;
                // set "checked" state of the input element to "false" so the dropdown menu will be hidden
                setTimeout(function () {
                    that.checked = false;
                }, 200);
            },

            dropDownMenuClick: function dropDownMenuClick() {
                var $dropDownItem = $(this),
                    $dropDown = $dropDownItem.closest('.dropDownMenu'),
                    idx = $dropDownItem.closest('th').index(),
                    value = $dropDownItem.data('filterBy'),
                    state = !$dropDownItem.hasClass('active'); // set state according to the item's class (state must be "true" to enable filtering)

                // toggle the state of the menu item via class
                toggleDropDownItemActive($dropDown, $dropDownItem.index(), state, true);

                filterTable(value, idx, state);

                return false;
            }
        }
    };

    // get the URL path for the MOCK JSON file from an Array representing the path of the current view
    // ['aaa','bbb','ccc'] --> 'bbb.ccc'
    var url = viewPath.join('.');

    ///////////////////////////////////
    // Get server data
    $.ajax({
        type: 'GET',
        url: '/html-gateway-api/mocks/' + url + '.protection-gaps.txt',
        dataType: 'json'
    }).success(onSuccess).fail(onFail);

    function onSuccess(res) {
        // if res is undefined or null, or not an Array, or is an array with lenth `0`, do not continue.
        if (!res || !(res instanceof Array) || !res.length) {
            return;
        }

        populateDOM();

        for (var i in componentsLoader) {
            componentsLoader[i].init(res);
        }EMC.utilities.scriptsTemplates(DOM.scope);
        events.bind();
    }

    function onFail() {
        console.warn('fail');
    }

    // Mark every second tr element in the table which is visible
    function zebra() {
        DOM.protectionGapsTable.find('tr').removeClass('zebra').addBack().find('tr:visible:odd').addClass('zebra');
    }

    ////////////////////////////////////////
    // helper function

    // @filterBy - value of which to filter by
    // @state    - toggle filtering (should filter or not at all)
    function filterTable(filterBy, colIndex, state) {
        if (!filterBy || !colIndex || !(typeof colIndex == 'number')) {
            console.warn('missing or wrong parameters');
            return false;
        }

        DOM.protectionGapsTable.find('> tbody > tr').each(function () {
            var $tr = $(this).removeAttr('style');

            if (state && $tr.find('td').eq(colIndex).text().toLowerCase() != filterBy.toLowerCase()) $tr.hide();
        });

        zebra();
    };

    function toggleDropDownItemActive(dropDown, itemIdx, state, setSegmentChart) {
        var filterName = dropDown.parent().data('name'),
            dropDownItem = dropDown.children().eq(itemIdx),
            itemValue = dropDownItem.data('filterBy').toLowerCase(),
            segmentsChartItemIdx;

        if (setSegmentChart) {
            // case-insensetive indexOf
            for (var i in componentsLoader.segmentsChart.data.labels) {
                if (componentsLoader.segmentsChart.data.labels[i].toLowerCase() == itemValue) {
                    segmentsChartItemIdx = +i;
                    break;
                }
            }

            // remove the "active" state of the segments chart component if any filter other than "category" was selected
            componentsLoader.segmentsChart.instance.cleanActive();

            if (filterName == 'category' && state && segmentsChartItemIdx != undefined) componentsLoader.segmentsChart.instance.activeStyles(segmentsChartItemIdx);
        }

        resetDropDownFilters();

        // set an "active" dropdown menu item
        dropDownItem.toggleClass('active', state).siblings().removeClass('active');
        // toggle the "active" class of the dropdown container itself
        dropDown.parent().toggleClass('active', state);
    };

    // cleanup - remove all "active" classes from all the filters' dropdown menus
    function resetDropDownFilters() {
        DOM.tableFilters.each(function () {
            $(this).removeClass('active').find('a').removeClass('active');
        });
    }

    // transforms JSON data into the segment chart data
    var transformData = (function () {
        var transformDataRes;

        return function (data) {
            if (transformDataRes) return transformDataRes;

            var categoryTypes = {},
                dataset = [],
                types = [];

            //data.map( item => item.category );
            data.forEach(function (item) {
                var itemType = item.type.toLowerCase();
                if (types.indexOf(itemType) == -1) types.push(itemType);
                if (!categoryTypes[item.category]) {
                    categoryTypes[item.category] = 1;
                    dataset.push(1); // make sure each value of the dataset is the same, so their sizes will be rendered equaliy by pushing the same value (doesn't matter which value)
                } else categoryTypes[item.category]++;
            });

            transformDataRes = {
                labels: Object.keys(categoryTypes),
                dataset: dataset,
                valueset: _.map(categoryTypes),
                types: types
            };

            return transformDataRes;
        };
    })();
};
"use strict";

EMC.routes.modals.protection.gaps = function (elem, data) {
    var DOM = {
        scope: elem
    };

    var template = EMC.tmpl("protection-gaps"),
        HTML = template({ "isModal": true, "name": parsePath(data).slice(-1) });

    /////////////////////////////////
    // DOM caching
    function populateDOM() {
        DOM.protectionGaps = DOM.scope.find('.protectionGaps');

        EMC.utilities.checkDOMbinding(DOM);
    };

    function gapsController() {
        EMC.routes.protection.gaps(DOM.protectionGaps, parsePath(data));
    }

    function parsePath(data) {
        // remove any Array item before "protection"
        var path = data.split('/');
        // remove empty Array items that might have resulted from the "split" (cleanup)
        path = path.filter(function (n) {
            return n != '';
        });

        var protectionIdx = path.indexOf('protection');
        return path.slice(protectionIdx, path.length);
    }

    // Append the template to the scope
    DOM.scope.append(HTML);
    // Populate DOM pointers
    populateDOM();
    gapsController();
};
"use strict";

EMC.init();
//# sourceMappingURL=emc.js.map
