// Stupid jQuery table plugin.

;(function($) {
  $.fn.stupidtable = function(sortFns) {
    return this.each(function() {
      var $table = $(this),
          tableSortData = $table.data('tableSortData');

      sortFns = sortFns || {};
      sortFns = $.extend({}, $.fn.stupidtable.default_sort_fns, sortFns);

      if( !tableSortData ){
        var tableSortData = {};
        tableSortData.id = new Array(8).join((Math.random().toString(36)+'00000000000000000').slice(2, 18)).slice(0, 7);
        tableSortData.className = 'tableSort' + tableSortData.id;
        tableSortData.styleTag = createStylesheet();
      }

      $table.data({ 'sortFns':sortFns, 'tableSortData':tableSortData });
      $table.addClass('tableSort' + tableSortData.id);

      $table.on("click.stupidtable", ".sortBtn", function() {
          $(this).stupidsort();
      });
    });
  };

  function createSelector(className, col, thIndex){
    var selector = '.' + className + ' td:nth-child('+ ++col +'){ background:rgba(0,0,0,.02); }';
    //selector += '.' + className + ' th:nth-child('+ ++thIndex +'){ background:#F9F9F9; }';
    return selector;
  }

  function createStylesheet(selector){
      selector = selector || '';
      var style = $('<style type="text/css" rel="stupidtable">'+ selector +'</style>');
      return style.appendTo('head')[0];
  }


  // Expects $("#mytable").stupidtable() to have already been called.
  // Call on a table header.
  $.fn.stupidsort = function(force_direction){
    var $sortBtn = $(this),
        th_index = 0, // we'll increment this soon
        dir      = $.fn.stupidtable.dir,
        $this_th = $sortBtn.closest('th'),
        $table   = $this_th.closest("table"),
        datatype = $sortBtn.data("sort") || null,
        sort_col = $sortBtn.data("col"),
        sort_dir;

    // No datatype? Nothing to do.
    if (datatype === null) {
      return;
    }

    // Account for colspans
    $this_th.closest("tr").find("th").slice(0, $this_th.index()).each(function() {
      var cols = $this_th.attr("colspan") || 1;
      th_index += parseInt(cols,10);
    });

    if(arguments.length == 1){
        sort_dir = force_direction;
    }
    else{
        sort_dir = force_direction || $this_th.data("sort-default") || dir.ASC;
        if ($this_th.data("sort-dir"))
           sort_dir = $this_th.data("sort-dir") === dir.ASC ? dir.DESC : dir.ASC;
    }


    $table.trigger("beforetablesort", {column:sort_col, direction:sort_dir});

    // More reliable method of forcing a redraw
    //$table.css("display");
    this.scrollTop;

    // Run sorting asynchronously on a timout to force browser redraw after
    // `beforetablesort` callback. Also avoids locking up the browser too much.
    setTimeout(runSort, 10);

    function runSort(){
      // Gather the elements for this column
      var column        = [],
          sortFns       = $table.data('sortFns'),
          sortMethod    = sortFns[datatype],
          trs           = $table.find("tbody").find("tr"),
          tableSortData = $table.data('tableSortData');

     // tableSortData.styleTag.innerHTML = createSelector(tableSortData.className, sort_col, $this_th.index());

      // Extract the data for the column that needs to be sorted and pair it up
      // with the TR itself into a tuple. This way sorting the values will
      // incidentally sort the trs.
      trs.each(function(index,tr) {
        var $e = $(tr).children().eq(sort_col);
        var sort_val = $e.data("sort-value");

        // Store and read from the .data cache for display text only sorts
        // instead of looking through the DOM every time
        if(typeof(sort_val) === "undefined"){
          var txt = $e.text();
          $e.data('sort-value', txt);
          sort_val = txt;
        }
        column.push([sort_val, tr]);
      });

      // Sort by the data-order-by value
      column.sort(function(a, b) { return sortMethod(a[0], b[0]); });
      if (sort_dir != dir.ASC)
        column.reverse();

      // Replace the content of tbody with the sorted rows. Strangely
      // enough, .append accomplishes this for us. (it's not strange at all! learn basic DOM...)
      trs = $.map(column, function(kv) { return kv[1]; });
      $table.children("tbody").append(trs);

      // Reset siblings
      $table.find("th").data("sort-dir", null).removeClass("sorting-desc sorting-asc");
      $this_th.data("sort-dir", sort_dir).addClass("sorting-"+sort_dir);

      $table.trigger("aftertablesort", {column: th_index, direction: sort_dir});
      $table.css("display");
    }

    return $this_th;
  };

  // Call on a sortable td to update its value in the sort. This should be the
  // only mechanism used to update a cell's sort value. If your display value is
  // different from your sort value, use jQuery's .text() or .html() to update
  // the td contents, Assumes stupidtable has already been called for the table.
  $.fn.updateSortVal = function(new_sort_val){
  var $this_td = $(this);
    if($this_td.is('[data-sort-value]')){
      // For visual consistency with the .data cache
      $this_td.attr('data-sort-value', new_sort_val);
    }
    $this_td.data("sort-value", new_sort_val);
    return $this_td;
  };

  // ------------------------------------------------------------------
  // Default settings
  // ------------------------------------------------------------------
  $.fn.stupidtable.dir = {ASC: "asc", DESC: "desc"};
  $.fn.stupidtable.default_sort_fns = {
    "int": function(a, b) {
      return parseInt(a, 10) - parseInt(b, 10);
    },
    "float": function(a, b) {
      return parseFloat(a) - parseFloat(b);
    },
    "string": function(a, b) {
      return a.localeCompare(b);
    },
    "string-ins": function(a, b) {
      a = a.toLocaleLowerCase();
      b = b.toLocaleLowerCase();
      return a.localeCompare(b);
    }
  };
})(jQuery);
