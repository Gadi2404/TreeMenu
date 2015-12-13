EMC.components.SegmentsChart = function(elm, settings = {}){
    this.settings = $.extend({}, {
        colors   : ['#ffc77e', '#ffdf7e', '#51a7e4', '#8888ef', '#fee08b', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
        labels   : [],
        dataset  : [],
        valueset : []
    }, settings);

    this.currentActiveGroupIdx = null;

    this.DOM = {
        scope : elm,
        outerCircle : $(),
        circleLine  : $(),
        innerCircle : $()
    }

    this.segmentsPositions = []; // stores initial positions of each one of the segments [[x,y],[x,y],...]

    this.render();

    setTimeout(this.events.bind.bind(this), 2000);

    // setTimeout( this.setValue.bind(this), 0 );
};

EMC.components.SegmentsChart.prototype = {
    events : {
        bind : function(){
            this.DOM.paths = this.DOM.scope.find('path');
            this.DOM.texts = this.DOM.scope.find('.textWrap');
            this.DOM.lines = this.DOM.scope.find('polyline');


            var itemsGroup = this.DOM.paths.add(this.DOM.texts)
                                           .add(this.DOM.lines);
                                           // .add(this.DOM.outerCircle)
                                           // .add(this.DOM.circleLine)
                                           // .add(this.DOM.innerCircle);

            itemsGroup.on('mouseenter', this.events.callbacks.hoverSegment.bind(this))
                      .on('mouseleave', this.events.callbacks.hoverSegment.bind(this))
                      .on('click', this.events.callbacks.toggleSegment.bind(this))

            //this.DOM.scope.on('click', itemsGroup, this.events.callbacks.toggleSegment.bind(this))
        },
        callbacks : {
            hoverSegment : function(e){
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

            toggleSegment : function(e){
                var idx = $(e.currentTarget).index(),
                    state;

                if( idx == this.currentActiveGroupIdx ){
                    state = false;
                    // save current index
                    this.currentActiveGroupIdx = null;
                }
                else{
                    state = true;
                    this.currentActiveGroupIdx = idx;
                }

                this.cleanActive();

                if( state )
                    this.activeStyles(idx);

                var filterBy = this.DOM.texts.eq(idx).find('.lbl').text();

                // trigger a segment click event which is being listened on other components
                this.DOM.scope.trigger('segmentClick', [filterBy, state]);
            }
        }
    },

    // reset the state of the UI so nothing is selected
    cleanActive : function(){
        // remove all other indexes "active" state
        this.DOM.paths.add(this.DOM.lines)
                      //.add(this.DOM.texts)
                      .add(this.DOM.outerCircle)
                      .add(this.DOM.circleLine)
                      .add(this.DOM.innerCircle)
                      .svgRemoveClass('active')
                      .css({ 'transform':'none' });


        this.DOM.texts.each(function(){
            var $this = $(this),
                textsPos = $this.data('origPos');

            if( textsPos )
                $this.css({ 'transform':'translate(' + textsPos[0]+'px, ' + textsPos[1] + 'px)' });
        });
    },

    // set inline styles for "active" segments
    activeStyles : function(idx){
        var itemsGroup = this.DOM.paths.eq(idx)
                                       .add(this.DOM.lines.eq(idx))
                                       .add(this.DOM.outerCircle.eq(idx))
                                       .add(this.DOM.circleLine.eq(idx))
                                       .add(this.DOM.innerCircle.eq(idx)),

            textsGroup = this.DOM.texts.eq(idx),
            textsGroupPosition = textsGroup[0].style.transform.replace('translate(','').replace(')', '').split(',');

        this.setGroupClass(idx, 'active', true);

        textsGroupPosition[0] = parseInt(textsGroupPosition[0]);
        textsGroupPosition[1] = parseInt(textsGroupPosition[1]);

        if( !this.segmentsPositions[idx] ){
            console.warn("something was wrong, idx doesn't exist: ", this.segmentsPositions, idx);
            return false;
        }

        var delta = [this.segmentsPositions[idx][0] * 0.2, this.segmentsPositions[idx][1] * 0.2];
        textsGroup.data('origPos', textsGroupPosition);

        textsGroup.css({ 'transform':'translate('+ (textsGroupPosition[0] + delta[0]) +'px,'+ (textsGroupPosition[1] + delta[1]) +'px)' })
        itemsGroup.css({ 'transform':'translate('+ delta[0] +'px,'+ delta[1] +'px)' })
    },

    setGroupClass : function(idx, classname, state){
        this.DOM.paths.eq(idx)
                        .add(this.DOM.lines.eq(idx))
                        .add(this.DOM.texts.eq(idx))
                        .add(this.DOM.outerCircle.eq(idx))
                        // .add(this.DOM.circleLine.eq(idx))
                        // .add(this.DOM.innerCircle.eq(idx))
                        [state ? 'svgAddClass' : 'svgRemoveClass'](classname);
    },

    render : function(){
        // this.settings.values

        var that     = this,
            dataset  = this.settings.dataset,
            valueset = this.settings.valueset,
            colors   = this.settings.colors,
            labels   = this.settings.labels;

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
            initialAnimDelay   = 300,
            arcAnimDelay       = 150,
            arcAnimDur         = 2000,
            secDur             = 1000,
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
                                                                    'height' : height,
                                                                    'class'  : 'segments-chart'
                                                                  })
                                                                  .append('g');

        svg.attr({ 'transform': 'translate(' + width / 2 + ',' + height / 2 + ')' });

        // for drawing slices
        var arc = d3.svg.arc().outerRadius(radius * 0.6).innerRadius(radius * 0.55);

        // for labels and polylines
        var outerArc = d3.svg.arc().innerRadius(radius * 0.85).outerRadius(radius * 0.85);

        // d3 color generator
        // var c10 = d3.scale.category10();

        var pie = d3.layout.pie().value(function(d){
            return d;
        });

        var draw = function() {
          svg.append("g").attr("class", "slices");
          svg.append("g").attr("class", "circles");
          svg.append("g").attr("class", "lines");
          svg.append("g").attr("class", "labels");

          // define slice
          var slice = svg.select('.slices').datum(dataset)
                                           .selectAll('path')
                                           .data(pie);

          slice
            .enter().append('path')
            .attr({
                'fill': function(d, i) {
                    // slice color
                    return colors[i];
                },
                'd': arc
            })
            .attr('transform', function(d, i) {
                return 'rotate(-180, 0, 0)';
            })
            .style('opacity', 0)
            .transition()
            .delay(function(d, i) {
                return (i * arcAnimDelay) + initialAnimDelay;
            })
            .duration(arcAnimDur)
            .ease('elastic')
            .style('opacity', 1)
            .attr({'transform': 'rotate(0,0,0)'});

          slice.transition()
            .delay(function(d, i) {
                return arcAnimDur + (i * secIndividualdelay);
            })
            .duration(secDur);

        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }


        var circle = svg.select(".circles");

        var outerCircle = circle.selectAll(".outerCircle").data(pie(dataset));

        outerCircle.enter()
            .append('ellipse')
            .attr({
              'cx': function(d, i) {
                that.DOM.outerCircle = that.DOM.outerCircle.add( $(this) );
                return arc.centroid(d)[0];
              },
              'cy': function(d, i) {
                return arc.centroid(d)[1];
              },
              'rx': '10',
              'ry': '10'
            })
            .style("opacity", 0)
            .style({'fill': function(d, i) {
                        return colors[i];
                    },
                    'stroke' : function(d, i) {
                        return colors[i];
                    }})
        .transition()
        .delay(function(d, i) {
            return (arcAnimDur /4) + (i * secIndividualdelay);
        })
        .duration(secDur)
        .style('opacity', 1)
        .attr("class", "outerCircle");


        var circleLine = circle.selectAll(".circleLine").data(pie(dataset));

        circleLine.enter()
            .append('line')
            .attr('x1', function(d, i) {
                that.segmentsPositions.push(arc.centroid(d));
                that.DOM.circleLine = that.DOM.circleLine.add( $(this) );
              return arc.centroid(d)[0];
            })
            .attr('y1', function(d, i) {
              return arc.centroid(d)[1];
            })
            .attr('x2', function(d, i) {
              return outerArc.centroid(d)[0];
            })
            .attr('y2', function(d, i) {
              return outerArc.centroid(d)[1];
            })
            .style("opacity", 0)
            .style('stroke', 'white')
            .style('stroke-width', 8)
            .transition()
            .delay(function(d, i) {
            return (arcAnimDur /4) + (i * secIndividualdelay);
          })
            .duration(secDur)
            .style('opacity', 1)
            .attr("class", "circleLine");


          var innerCircle = circle.selectAll(".innerCircle").data(pie(dataset));

          innerCircle.enter()
            .append('circle')
            .style("opacity", 0)
            .attr('cx', function(d, i) {
                that.DOM.innerCircle = that.DOM.innerCircle.add( $(this) );
              return arc.centroid(d)[0];
            })
            .attr('cy', function(d, i) {
              return arc.centroid(d)[1];
            })
            .attr('r', '4')
            .style('fill', function(d, i) {
            return colors[i];
          })
            .style('stroke', 'white')
            .style('stroke-width', 3)
            .transition()
            .delay(function(d, i) {
            return (arcAnimDur /4) + (i * secIndividualdelay);
          })
            .duration(secDur)
            .style('opacity', 1)
            .attr("class", "innerCircle");


            // define text

          var text = svg.select(".labels").selectAll("text").data(pie(dataset));

          text.enter()
            .append("g")
            .attr('transform', function(d) {

              // calculate outerArc centroid for 'this' slice
              var pos = outerArc.centroid(d);

              // define left and right alignment of text labels

              pos[0] = radius * (midAngle(d) < Math.PI ? 1.2 : -1.18) + "px";
              pos[1] = arc.centroid(d)[1] > 0 ? (pos[1] - 35) + "px" : (pos[1] + 25) + "px";

              this.style.transform = "translate(" + pos + ")";

              //return "translate(" + pos + ")";
            })
            .attr("class", "textWrap")
            .append('text')
            .attr('dy', '0.35em')
            .style("opacity", 0)
            .style('fill', function(d, i) {
              return colors[i];
            })

            .transition()
            .delay(function(d, i) {
              return (arcAnimDur /6) + (i * secIndividualdelay);
            })
            .duration(secDur)
            .style('opacity', 1);



            // define inner text

            var tspan = d3.selectAll("text").data(pie(dataset));

            for(var i = 0; i < tspan[0].length; i++){
                tspan[0][i].innerHTML += "<tspan class='tspan val'></tspan>\n <tspan class='tspan lbl'></tspan>";
            }

            var topText = d3.selectAll(".val").data(pie(dataset));

            topText.text(function(d, i){
                return valueset[i];
            })
            // .attr('y', function(d) {
            //      return arc.centroid(d)[1] > 0 ? -12 : 20;
            //  })
            .attr('x', 0)
            .attr('y', 0);



            var bottomText = d3.selectAll(".lbl").data(pie(dataset));


            bottomText.text(function(d, i) {
                return labels[i];
            })
        /*    .attr('y', function(d) {

              return arc.centroid(d)[1] > 0 ? -12 : 20;
            })*/
          .attr('x', 0)
          .attr('y', 20);


          // define lines

          var polyline = svg.select(".lines").selectAll("polyline").data(pie(dataset));

          polyline.enter()
            .append("polyline")
            /*    .style("opacity", 0.5)*/
                  .style('stroke', function(d, i) {
                  return colors[i];
            })
            .attr('points', function(d) {
                var pos = outerArc.centroid(d);
                pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                return [arc.centroid(d), arc.centroid(d), arc.centroid(d)];
            })
            .transition()
            .duration(secDur)
            .delay(function(d, i) {
                return (arcAnimDur /4) + (i * secIndividualdelay);
            })
            .attr('points', function(d) {
                var pos = outerArc.centroid(d);
                pos[0] = radius * 1.5 * (midAngle(d) < Math.PI ? 1 : -1);
                return [arc.centroid(d), outerArc.centroid(d), pos];
            })
        };

        draw();
    }
};
