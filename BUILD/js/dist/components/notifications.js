EMC.components.Notifications = (function(){
    "use strict";

    var Notifications = function(elm){
        this.DOM = {
            container : elm
        };

        this.itemTemplate = _.template(EMC.templates["notification-item"]);
        this.maxItems     = 2;
        this.addedIds     = {}; // keep scores of which items were added, so nothing which was already rendered will be rendered again
        this.queue        = [];
    };

    Notifications.prototype = {
        init : function(){
            this.onData();
            this.events();
        },

        events : function(){
            this.DOM.container.on('mouseenter', this.renderInterval.stop.bind(this))
                              .on('mouseleave', this.renderInterval.start.bind(this))
        },

        renderInterval : {
            timer : null,
            start : function(){
                if( !this.renderInterval.timer )
                    this.renderInterval.timer = setInterval(this.renderQueue.bind(this), 1000);
            },
            stop : function(){
                clearInterval(this.renderInterval.timer);
                this.renderInterval.timer = null;
            }
        },

        getData : function(){
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
                type        : 'GET',
                url         : 'http://api.comedy.com/dashboard/recent_notifications',
                dataType    : 'jsonp',
                crossDomain : true
            })
        },

        onData : function(){
            var that = this;

            $.when( this.getData() )
                .done(function(data){
                    // add to queue only items who weren't previously rendered
                    for( var i = data.data.length; i--; ){
                        var id = data.data[i].date;
                        if( that.addedIds[id] ){
                            // console.log('dup', data.data[i].date, that.addedIds)
                            data.data.splice(i, 1);
                        }
                        else
                            that.addedIds[id] = 1;
                    }

                    // Merge arrays
                    Array.prototype.push.apply(that.queue, data.data);
                    // Fetch more data periodically
                    that.timer = setTimeout(that.onData.bind(that), 5000); // fetch a batch of new data from the server

                    that.doOnce();
                })


        },

        // On first time fetching the data, render the maximum allowed number of items all at once
        doOnce : function(){
            var itemsToAdd = this.queue.splice(0, this.maxItems);
            this.add(itemsToAdd);
            this.doOnce = function(){};
            // start interval cycle
            this.renderInterval.start.call(this);
        },

        renderQueue : function(){
            var itemToAdd = this.queue.pop();

            if( itemToAdd ){
                this.add( [itemToAdd] );
                this.remove();
            }
        },

        remove : function(){
            var items = this.DOM.container.children(),
                itemToRemove = items.first();

            // remove only when total items exceeds "maxItems" allowed length
            if( items.length > this.maxItems )
                setTimeout(function(){
                    // fade it out
                    itemToRemove.addClass('hide').slideUp(150);
                    // Remove from DOM
                    setTimeout(function(){
                        itemToRemove.remove();
                    }, 400);
                },100);
        },

        add : function(data){
            var model = { items: data },
                $item = $( EMC.utilities.template.minify( this.itemTemplate(model) ) );

            // if there's only one item to add
            if( data.length == 1 ){
                // initially hide the item
                $item.addClass('hide').hide();
                this.DOM.container.append($item);
                $item.slideDown(150).removeClass('hide');
            }
            // for multiple items, add as bulk HTML
            else{
                this.DOM.container.prepend($item);
            }
        }
    }

    return Notifications;
})();