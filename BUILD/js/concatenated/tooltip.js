/*
 * Tooltips using Tether
 *
*/
var ttip = (function(){
    var Tooltip = function(target){
        this.target = target;
        // some tooltips targets might share the same tooltip
        this.group             = this.target.data('tooltipGroup');
        this.attachment        = this.target.data('tooltipAttachment')       || 'top center';
        this.targetAttachment  = this.target.data('tooltipTargetAttachment') || 'bottom center';
        this.targetOffset      = this.target.data('tooltipOffset')           || '0 0';
        // look if the tooltip with this group is already on the page
        this.elm = $('.ttip').filter('.' + this.group);

        if( this.targetAttachment == 'bottom center' && !this.target.data('tooltipOffset') )
            this.targetOffset = '5px 0';

        if( !this.elm[0] )
            this.elm = this.generate().prependTo(document.body);

        if( !this.elm )
            return;

        this.tether = new Tether({
            element          : this.elm,
            target           : this.target,
            attachment       : this.attachment,
            targetAttachment : this.targetAttachment,
            targetOffset     : this.targetOffset,
            constraints      : [{
                to         : 'scrollParent',
                attachment : 'both',
            //    pin: true
            }],
            classes: {
                element: [this.target.data('tooltipClass') || '', this.group].join(' ')
            }
        });
    }

    Tooltip.prototype = {
        generate : function(){
            var content = this.target[0].title || this.target.data('tooltipContent') || this.target[0].getAttribute('data-tooltipContent');

            if( !content ){
                return false;
                console.warn('no tooltip content');
            }

            if( this.target[0].title )
                this.target.prop('title','');

            return $('<div>').addClass('ttip').html( content );
        },

        // show tooltip
        show : function(){
           this.elm.prependTo(document.body);
           this.elm[0].scrollTop;
           this.tether.enable();
           setTimeout(this.tether.position, 0);
           clearTimeout(this.removeElmTimer);
        },

        // hide tooltip
        hide : function(){
            var tether = this.tether,
                that = this;

            this.tether.disable();
            this.removeElmTimer = setTimeout(function(){
               // tether.element.style.left = '-999px';
               that.elm.detach();
            }, 250);
        }
    }


    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////

    $(document)
        .on('mouseenter.tooltip mouseleave.tooltip' , '.hasTtip'     , function(e){ event.call(this, e, ['mouseenter','mouseleave']) })
        .on('focus.tooltip blur.tooltip'            , '.hasTipFocus' , function(e){ event.call(this, e, ['focusin','focusout']) });

    function initTooltip(elm){
        var tooltip;

        if( elm.data('tooltip') )
            tooltip = elm.data('tooltip');
        else{
            tooltip = new Tooltip(elm);
            elm.data('tooltip', tooltip);
        }

        return tooltip;
    }


    function event(e, eventsArr){
        var eventType = e.type,
            tooltip   = initTooltip( $(this) );

        if( eventType == eventsArr[0] )
            tooltip.show();
        else if( eventType == eventsArr[1] ){
            tooltip.hide();
        }
    }


    return {
        init : initTooltip
    }

})();