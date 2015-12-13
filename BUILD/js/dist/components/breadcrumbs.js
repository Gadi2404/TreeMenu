EMC.components.Breadcrumbs = function(){
    "use strict";

    this.template = EMC.tmpl("components\\breadcrumbs");
    this.itemTemplate = EMC.tmpl("components\\breadcrumbs-item");

    this.DOM = {
        scope : $( this.template() )
    }

    this.DOM.back = this.DOM.scope.find('.back');

    this.init();
};

EMC.components.Breadcrumbs.prototype = {
    init : function(){
        this.events.bind.call(this);
    },

    events : {
        bind : function(){
            this.DOM.scope.on('click', '.breadcrumbs__link', this.events.callbacks.itemClick.bind(this))
                    .on('click', '.back', this.events.callbacks.back.bind(this))
        },
        callbacks : {
            itemClick : function(e){
               // var target = e.currentTarget;
            },

            back : function(e){
                var href = this.DOM.scope.find('a').eq(-2).click();
                this.backButtonState();
               // Router.navigate('/protection/locations/united-states');
                return false;
            }
        }
    },

    backButtonState : function(){
        var items = this.DOM.scope.children();
        this.DOM.back.toggleClass('disabled', items.length <= 2);
    },


    add : function(data){
        var HTML = this.itemTemplate(data);
        this.DOM.scope.append(HTML);
        this.backButtonState();
    },

    remove : function(){

    }
}