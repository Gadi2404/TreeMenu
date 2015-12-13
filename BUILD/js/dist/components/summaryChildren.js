EMC.components.summaryChildren = function(elm, settings){
    var promise;  // the request's promise object

    var defaults = {
        DOM      : {
            elm : elm
        },

        templates : {
            boxes : EMC.tmpl("summary-children-box-item"),
            table : EMC.tmpl("summary-children-table"),
        },

        view : 'boxes',

        endPoint : EMC.config.API.locations
    };

    // update defaults with settings
    settings = $.extend(defaults, settings);

    // controllers for the different views of Summary Children component
    var viewsController = {
        boxes : {
            init : function(){
                settings.DOM.elm.removeAttr('style');
                viewsController.boxes.events.bind();
            },

            events : {
                bind : function(){
                    settings.DOM.elm.on('click', '.colItem', viewsController.boxes.events.callbacks.colItemClick);
                },

                callbacks : {
                    // Make sure when clicking on a button which is inside a link, do not trigger the link default behavior
                    colItemClick : function(e){
                        if( e.target.dataset && e.target.dataset.modal ){
                           EMC.components.modals.click_show.call(e.target);
                           return false;
                        }
                    }
                }
            }
        },

        table : {
            DOM : {},

            init : function(){
                this.populateDOM();

                this.events.bind();
                console.log(settings.DOM.elm.find("table"));
                settings.DOM.elm.find("table").height( this.DOM.summaryChildrenTable.height() );
                this.DOM.summaryChildrenTable.stupidtable().on('aftertablesort', function(e, data) {
                   // console.log(data);
                });
            },

            // @filterBy - value of which to filter by
            // @state    - toggle filtering (should filter or not at all)
            filterTable : function(filterBy, colIndex, state){
                if( !filterBy || !colIndex || !(typeof colIndex == 'number') ){
                    console.warn('missing or wrong parameters');
                    return false;
                }

                this.DOM.summaryChildrenTable.find('> tbody > tr').each(function(){
                    var $tr = $(this).removeAttr('style');

                    if( state && $tr.find('td').eq(colIndex).data('sortValue') != filterBy )
                        $tr.hide();
                })
            },

            populateDOM : function(){
                this.DOM.summaryChildrenTable = settings.DOM.elm.find('.summaryChildren.table');

                EMC.utilities.checkDOMbinding(this.DOM);
            },

            events : {
                bind : function(){
                    settings.DOM.elm.on('blur', ':checkbox', this.callbacks.onBlur );
                    settings.DOM.elm.on('click', '.dropDownMenu > a', this.callbacks.dropDownMenuClick );
                },

                callbacks : {
                    onBlur : function(){
                        var that = this;
                        // set "checked" state of the input element to "false" so the dropdown menu will be hidden
                        setTimeout(function(){
                            that.checked = false;
                        }, 200);
                    },

                    dropDownMenuClick : function(){
                        var $dropDownItem = $(this),
                            idx   = $dropDownItem.closest('th').index(),
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
    }


    var state = {
        data : null
    };

    function init(){
        settings.DOM.elm.addClass('loading');

        promise && promise.abort(); // cancel the last request if there was any
        promise = getData(settings.mock);

        $.when( promise )
            .done( render )
            .fail(onGetDataFail)
    };

    function getData(request){
        return request || $.ajax({
            type : 'GET',
            url  : '/get-children',
            data : {'location':'united-states'}
        })
    };

    function onGetDataFail(){
        settings.DOM.elm.removeClass('loading');
    };

    function render(data, view){
        settings.DOM.elm.removeClass('loading');

        if( !data && !state.data ) return;

        if( data )
            state.data = data;

        view = view || settings.view;

        // settings.DOM.elm
        var HTML = settings.templates[view]({items:state.data});

        settings.DOM.elm.html(HTML);

        viewsController[view].init();
    };

    ///////////////////////////////
    init();

    return {
        init    : init,
        getData : getData,
        render  : render
    }
};