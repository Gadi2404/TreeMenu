////////////////////////////////////////
// Scroll To / jQuery plugin (this plugin is written poorly)
//
// @author Yair Even Or
// @version 1.0.0 (April 3, 2013)
//
(function($){
    "use strict";

    var topOffset  = 0,
        root       = $('html, body');

    // jumpIn - in which container to scroll
    $.fn.scrollToPos = function(jumpIn, duration, offset, cb, startAfter){
        var that = this;

        topOffset  = offset != undefined ? offset : 0;
        jumpIn     = jumpIn || root;
        startAfter = startAfter || 0;

        if( duration < 100 )
            duration = 0;
        if( typeof duration != 'number' )
            duration = null;

        setTimeout(function(){
            scrollToPos.call(that, null, that, jumpIn, duration, cb);
        }, startAfter);

        return this;
    }

    function scrollToPos(e, jumpTo, jumpIn, duration, cb){
        cb = cb || function(){}; // callback

        //if( root.is(':animated') )
        //  return false;

        var distance = 0,
            scrollTarget = $( jumpTo || $(this).data('scrollto') || $(this).attr('href') ),
            jumpInScrollTop = scrollTarget.scrollTop();

        if( scrollTarget[0] == window ){
            scrollTarget = $(document.documentElement);
        }

        // scrollTarget can be either an element selector or a number (number support not implemeted yet)
        if( scrollTarget.length )
            // calculate where
            distance = scrollTarget.offset().top - jumpInScrollTop;

        if( duration === null )
            duration = Math.log( Math.ceil((jumpInScrollTop - distance)/2000) + 0.5 ) * 1000;

        jumpIn.stop().animate({ scrollTop:(distance + topOffset)}, duration, 'easeOutQuint', cb);

        return this;
  };


  // initialize the plugin
  //$(document).on('click.scrollTop', 'a[data-scrollTo]', scrollToPos);
  $(document).on('click.scrollTo', 'a[data-scrollTo]', scrollToPos);

  $.easing.jswing = $.easing.swing;
  $.extend($.easing, {
    easeOutCubic: function (x, t, b, c, d) {
        return c*((t=t/d-1)*t*t + 1) + b;
    },
    easeInQuint: function (e, f, a, h, g) {
      return h * (f /= g) * f * f * f * f + a;
    },
    easeOutQuint: function (e, f, a, h, g) {
      return h * ((f = f / g - 1) * f * f * f * f + 1) + a;
    },
    easeInOutQuart: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
        return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },
    easeInOutCirc: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
        return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
    }
  });

})(jQuery);