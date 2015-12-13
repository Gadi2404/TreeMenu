EMC.routes.modals.protection.gaps = function(elem, data){
    var DOM = {
        scope : elem
    }

    var template = EMC.tmpl("protection-gaps"),
        HTML     = template({ "isModal":true, "name": parsePath(data).slice(-1) });

    /////////////////////////////////
    // DOM caching
    function populateDOM(){
        DOM.protectionGaps = DOM.scope.find('.protectionGaps');

        EMC.utilities.checkDOMbinding(DOM);
    };

    function gapsController(){
        EMC.routes.protection.gaps(DOM.protectionGaps, parsePath(data));
    }


    function parsePath(data){
        // remove any Array item before "protection"
        var path = data.split('/');
        // remove empty Array items that might have resulted from the "split" (cleanup)
        path = path.filter(n => n != '');

        var protectionIdx = path.indexOf('protection');
        return path.slice(protectionIdx, path.length);
    }

    // Append the template to the scope
    DOM.scope.append(HTML);
    // Populate DOM pointers
    populateDOM();
    gapsController();

}