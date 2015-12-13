// data - an Array of items, representing the DOM structure of the main menu

EMC.components.sidebar = function(data){
    "use strict";

    // DOM ELEMENTS CACHING
    var menuTmpl = EMC.tmpl("sidemenu"),
        events,
        DOM = {};

    DOM.scope       = $('#sidebar');
    DOM.sidebarWrap = $('.sidebar__wrap');
    DOM.mainmenu    = $('.mainmenu');
    DOM.noResults   = DOM.mainmenu.find('.mainmenu__noReults');
    DOM.search      = $('.sidebar__search__input');
    DOM.clearSearch = $('.sidebar__search__clear');
    DOM.datalist    = $('#sidebar__search__datalist');


    var clientRect = DOM.scope[0].getBoundingClientRect();
    DOM.scope.data('startPost', clientRect.top);

    /////////////////////////////////////////
    // Events

    // events callbacks
    events = {
        bind : function(){
            DOM.mainmenu.on('click.menu', 'dt', events.callbacks.toggleMenuItem);
            
            DOM.search.on('keydown', events.callbacks.searchOnKeyDown.bind(events.callbacks))
                      .on('input change', events.callbacks.search);

            DOM.clearSearch.on('click', events.callbacks.clearSearch);

            $(window).on('scroll', events.callbacks.onScroll);

            // http://stackoverflow.com/a/2196683/104380
            jQuery.expr[':'].Contains = function(a, i, m) {
                return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
            };
        },

        callbacks : {
            toggleMenuItem : function(e){
                if( e.target.nodeName == 'A' )
                    return true;

                var target = $(this);
                target.parent().toggleClass('closed').find('dl').addClass('closed'); // close all inner menues, if any were open
            },

            search : function(e){
                var value = this.value.trim(),
                    foundItems;

                DOM.mainmenu.toggleClass('searchMode', value.length > 2);
                DOM.mainmenuItems.removeClass('show');

                // do nothing if there aren't at least 3 characters, and cleanup any residual classnames
                if( value.length < 3 ){
                    toggleNoResults();
                    return;
                }

                // search all 'a' elements which contains the string
                foundItems = DOM.mainmenu.find("a:Contains(" + value + ")").parentsUntil(DOM.mainmenu).addClass('show');

                toggleNoResults(!foundItems.length);
                
            },

            searchOnKeyDown : function(e){
                if( e.keyCode == 27 ){
                    this.clearSearch();
                    return false;
                }
            },

            clearSearch : function(){
                DOM.search.val('');
                events.callbacks.search.apply( DOM.search[0] );
            },

            onScroll : function(e){
                var scrollY = window.scrollY;

                if( scrollY < DOM.scope.data('startPost') )
                    DOM.scope.removeClass('fixed');
                else if( DOM.scope[0].getBoundingClientRect().top < 0 )
                   DOM.scope.addClass('fixed');
            }
        }
    }

    function toggleNoResults(state = false){
        DOM.noResults.toggleClass('show', state);
    }

    function setActiveMenuItem(url){
        // remove last "active" nav item
        DOM.mainmenu.find('.active').removeClass('active');
        // find new "active" nav item
        var activeSideMenuItem = DOM.mainmenu.find('a[href="'+ url +'"]');

        // set as "active"
        activeSideMenuItem.addClass('active');
    }

    var helpers = {
        riskLevel : function(item){
            return item["riskLevel"] ? "severityMark--" + item["riskLevel"] : "";
        }
    }

    function buildDataList(){
        var datalist_items = $();

        function recursive(lisData){
            for(var i=lisData.length; i--; ){
                // make sure not to add already added items
                if( datalist_items.text().indexOf(lisData[i].name) == -1 )
                    // create "option" elements
                    datalist_items = datalist_items.add( $('<option>').html(lisData[i].name) );
                if( lisData[i].items )
                    recursive( lisData[i].items );
            }
        }

        recursive(data);

        DOM.datalist.html( datalist_items );
    }

    var navigateMenuWithKeys = (function(){
        var menuLinksIndexes = [],
            currentLink,
            curentHref,
            currentLinkIndex,
            nextLink = [],
            menuLinks,
            nextIndex,
            searchMode,
            isParentVisible, isFirstLink, isListClosed;

        function init(){
            // populate all the menu links (can only happen in the init() )
            menuLinks = DOM.mainmenu.find('a');

            menuLinks.each(function() {
               menuLinksIndexes.push(this.getAttribute('href'));
            });

            // Event binding
            DOM.scope.on('keydown', onKeyDown);
        }

        function getNextLink(inc){
            var result;

            while(true){
                nextIndex += inc;
                result = menuLinks.eq(nextIndex);

                isParentVisible = result.parent().hasClass('show');
                isFirstLink     = result.parent('dt').length; 
                isListClosed    = result.closest('dl.closed').length;

                if(!result.length)
                    break;
                
                if( searchMode && !isParentVisible && !isFirstLink )
                    continue; 

                if( !isListClosed || isFirstLink )
                    break;
            }

            return result;
        }

        function navigate(pressedKey){
            currentLink      = menuLinks.filter('.active'),
            curentHref       = currentLink.attr('href'),
            currentLinkIndex = menuLinksIndexes.indexOf(curentHref),
            nextLink         = [],
            searchMode       = DOM.mainmenu.hasClass('searchMode'),

            isParentVisible, isFirstLink, isListClosed;


            if( pressedKey == 'down' ){
                nextIndex = currentLinkIndex;
                    
                nextLink = getNextLink(1);

                if( !nextLink.length )
                    nextLink = menuLinks.eq(0);
            }

            else if( pressedKey == 'up' ){
                nextIndex = currentLinkIndex;

                nextLink = getNextLink(-1);

                if( !nextLink.length )
                    nextLink = menuLinks.eq(menuLinks.length);
            }

            else if( pressedKey == "enter")
                    Router.navigate(curentHref);

            else if( pressedKey == "right"){

                var linksParent = currentLink.closest('dt');

                    if(linksParent.length && linksParent.closest('dl.closed').length)
                        linksParent.closest('dl.closed').removeClass("closed");
            }

            else if( pressedKey == "left"){

                    if(currentLink.closest('dt').length && !currentLink.closest('dt').closest('dl.closed').length)
                        currentLink.closest('dt').closest('dl').addClass("closed");
            }
                    

            else return;


            if( nextLink.length ){
                currentLink.removeClass('active');
                nextLink.addClass('active');
            }
        }

        function onKeyDown(e){
            var pressedKey = null; 

            switch(e.keyCode){

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
            init        : init,
            navigate    : navigate,
            getNextLink : getNextLink
        }
    })();

    function init(){
        var HTML = menuTmpl({ items:data, template:menuTmpl, helpers:helpers, path:'/protection/' });
        DOM.mainmenu.append(HTML);

        DOM.mainmenuItems      = DOM.mainmenu.find('dt, dd, dl');
        DOM.mainmenuItemsLinks = DOM.mainmenu.find('a');
        //build(data, 0);
        //console.log(nav);
        events.bind();
        navigateMenuWithKeys.init();
        // buildDataList();
    }

    init();

    return {
        init : init,
        set  : setActiveMenuItem
    }
};