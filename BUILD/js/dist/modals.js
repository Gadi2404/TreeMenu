//////// COMPONENTS //////////////////////////
//////// Popups manager

EMC.components.modals = (function(){
    "use strict";

    var state = {
        history       : [], // history of all opened modals, until modal is completly closed.
        modalIsOpened : false // false OR the current modal's ID
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
        modal         = $(modalHTML),
        modalTemplate = modal.clone(),
        modals        = $('<div>'), // an empty element that will contain all the HTML from the modals ajax request
        pageClass     = ''; // if exists and needed for this modal


    // inject modal's container
    EMC.DOM.$BODY.prepend(modal);


    /////////////////////////////
    // SHOW MODAL
    function show(modalName, modalData){
        clearTimeout(closeTimeout);

        var template = EMC.templates['modals\\'+ modalName];
        // check if required modal even exists in the templates
        // if( modalName != 'lastModal' )
        //     return;

        console.log('>>> modal name:', modalName,', data:',modalData); // debugging
        dataLayer.push({'event': 'Modal dialog', 'action':'open', 'label':modalName }); // anlytics

        // Don't load the same modal again if it's already on-screen
        if( !modalName || state.modalIsOpened == modalName )
            return;

        // is there wasn't any last modal to show from the history object
        if( modalName == 'lastModal' && state.history.length < 2 ){
            close();
            return false;
        }

        // cleanup must come AFTER last DOM was saved (if that had happened)
        cleanup(true);

        if( modalName == 'lastModal' ){
            modalName = restoreLastModal();
        }

        else if( state.modalIsOpened && existInHistory(modalName) ){
            // TODO:
            // Check if the modal which is requested is saved in the history. if so, restore it
        }

        else
            newModal(modalName, template, modalData);

       // modal[0].className = modalName + ' show ' + pageClass;
        modal.removeAttr('class').addClass('show').attr('data-view', modalName);
        modal.off(transitionEnd).on(transitionEnd, function(){
            modal.off(transitionEnd);
            modal.find('.content').css({'position':'relative', 'left':'auto'});
            modal.addClass('showContent')
        })
        EMC.DOM.$BODY.addClass('noScrollbar');

        // if the body element has changed, and the modal isn't there anymore, inject it again
        if( !$('#modal').length )
            EMC.DOM.$BODY.append(modal);

        state.modalIsOpened = modalName;

        // saves the modal (that was rendered) in the history
        if( modalName != 'lastModal' && state.modalIsOpened )
            saveModal(modalName, modalData);

        setFormFocus();

        return modal;
    }

    // Sets focus if has a form
    function setFormFocus(){
        var shouldFocus = modal.find('form:first').find('[autofocus]');
        if( shouldFocus.length )
            shouldFocus[0].focus();
    }

    // checks if a modal exists in the history cache and loads it
    function existInHistory(modalName){
        return state.history.some(function(item, i){
            var key = _.keys(item)[0];
            if( key == modalName ){
                modal.find('.content').append( item[modalName].content );
                if( item[modalName].outside )
                    modal.find('.wrap').append( item[modalName].outside );
                return true;
            }
        });
    }

    // saves the LAST modal before loading the current one.
    // save histroy state ONLY for modals which trigger other modals, and might come back to the originated one
    // it's very important to save the state of the modal JUST before it is changing to another one
    function saveModal(modalName, modalData){
         // save history of the current modal, just before changing to the next one.
        var obj = {
            name : modalName,
            // reference the current modal's view to memory
            content: modal.find('.content').find('> div'),
            outside: modal.find('.outside'),
            // save the current modal class name (if has one)
            extraClass : pageClass,
            modalData : $.extend({}, modalData)
        };


        state.history.push(obj);

        // limit history to 2 items
        // state.history.slice(-2);
    }

    // gets the `index` for which to store a modal from the `History` object
    function restoreLastModal(){
        var restored, modalName;

        state.history.pop();

        // load the last modal
        restored = state.history.pop();

        // append the DOM of the last modal
        // ** MUST BE CLEANED UP PRIOR TO APPENDING IT **
        modal.find('.content').append( restored.content );
        pageClass = restored.extraClass;

        // returns the page name of the restored modal
        return restored.name;
    }

    function newModal(modalName, template, modalData){
        var wrap      = modal.find('.wrap'),
            content   = modal.find('.content'),
            compiledTemplate,
            renderedTemplate,
            $tmpl,
            outsideContent,
            initData;

        if( template ){
            // Compile template into text
            compiledTemplate = _.template( template, modalData || {} );
            // render compiled template text into a DOM node
            renderedTemplate = $.parseHTML(compiledTemplate)[0];
            // convert it to a jQuery object
            $tmpl = $(renderedTemplate);

            // if there are things that needs to be outside of the WRAP container
            // outsideContent = $tmpl.find('.outside');
            // if( outsideContent.length )
            //     wrap.append( outsideContent );

            content.append( $tmpl );
        }

        //pageClass = $tmpl[0].className || '';


        ///////////////// ROUTES ///////////////////////////////
        // call the route for this modal, if exist
        //initData = $tmpl.data('init');

        // modal.addClass('loading');
        EMC.utilities.matchRoute( 'modals.' + modalName, content, modalData );

        afterRoute();
    }

    function afterRoute(){
        // scan page for inputs for IE9
        if( !$.support.placeholders )
            modal.find('input[placeholder]').each(function(){
                $.fn.fixPlaceholders.setOriginalType.apply(this);
                $.fn.fixPlaceholders.onBlur.apply(this);
            })
    }

    /////////////////////////////
    // CLEANUP
    function cleanup(soft){
        pageClass = '';
        // "soft" cleanup when changing modals from one to another
        if( soft ){
            modal.find('.close').siblings().detach();
            modal.find('.content').siblings().detach(); // clean "outside" injected content
        }
        else{
            modal.removeClass('show hide').html( modalTemplate.html() );
            state.history.length = 0; // cleanup
        }

        // Call the last modal window (if exists) "destroy" method
        var modalController = EMC.routes.modals[state.modalIsOpened];

        // if this modal has a "destroy" method, to cleanup after it
        if( modalController && modalController.destroy )
            modalController.destroy();
    }

    function onKeyDown(e){
        var code = e.keyCode;

        // Prevent default keyboard action (like navigating inside the page)
        if( code == 27 )
            close();
    }

    /////////////////////////////
    // CLOSE MODAL PROCEDURE
    function close( param ){
        if( state.modalIsOpened ){
            var modalController = EMC.routes.modals[state.modalIsOpened];
            state.modalIsOpened = false;

            // if this modal has a "destroy" method, to cleanup after it
            if( modalController && modalController.destroy )
                modalController.destroy();

            if( !param )
                modal.addClass('hide');

            // if this modal has a "destroy" method, to cleanup after it
            if( modalController && modalController.destroy )
                modalController.destroy();

            EMC.DOM.$BODY.removeClass('noScrollbar');

            // if 'lastModal' then do not close the mocal, but only remove elements
            if( param == 'lastModal' ){
                cleanup(true);
            }
            else if( param == 'fast' )
                cleanup();
            else{
                // cleanup is delayed roughly until the modal was hidden
                closeTimeout = setTimeout(cleanup ,250);
            }

            // dataLayer.push({'event': 'Modal dialog', 'action':'close', 'label':modalName }); // anlytics
        }
    }

    // AJAX submits a form according to it's ACTION attribute
    function submitForm(e){
        // don't submit the form normally
        e.preventDefault();

        var $form = $(this),
            $generalAlert = $form.find('.generalAlert');

        $generalAlert.empty();

        // validate before submiting to the server
        // you can put your own custom validations below

        // check all the rerquired fields
        if( !validator.checkAll( this ) )
            return false;

        ajaxSubmit( $form );
    }

    function ajaxSubmit($form){
        var $generalAlert = $form.find('.generalAlert');

        // lock form submiting until request is resolved
        if( $form.data('proccesing') )
            return false;

        // Add loading spinner and disable the button until request was resolved
        $form
            .addClass('loading')
            .find('button[type=submit]').prop('disabled', true);

        $.ajax({
            type     : "POST",
            url      : $form[0].action,
            dataType : 'json',
            data     : $form.serialize() // serializes the form's elements.
        })
        .done(onDone)
        .fail(function(){
            $form.removeClass('loading');
            onDone({ success:false, "fields":{ general:"Something went wrong, please try again" } });
        })
        .always(always);

        // set form to "processing" state
        $form.data('proccesing', true);

        /////// response callbacks //////
        function always(){
            $form
                .data('proccesing', false)
                //.removeClass('loading')  // page will refresh anyway
                .find('button[type=submit]').prop('disabled', false);
        }

        function onDone(res){
            if( res.success ){
                $form.removeClass('loading')

                var firstModal = state.history.length > 1 ? state.history[0].name: null;

                // save the first modal to browser's localStorage, so it could be shown after page refresh
                if(firstModal){
                    localStorage['restoreModalData'] = JSON.stringify( state.history[0].modalData );
                }

                EMC.DOM.$DOC
                    .trigger(state.modalIsOpened, [firstModal, res] )
                    .trigger('modalSubmit', [state.modalIsOpened, res] );
                /*
                if( $form.res('refresh') )
                   window.location.reload(false);
                */
            }
            else
                errorsHandler(res.fields);
        }

        function errorsHandler(fields){
            var field, errorMsg;

            // remove loading state on success "false"
            $form.removeClass('loading');

            for( field in fields ){
                if (fields.hasOwnProperty(field)){
                    errorMsg = fields[field];

                    if( field == 'general')
                        $generalAlert.text(errorMsg);

                    else
                        validator.mark( $( $form[0][field] ) , errorMsg );
                }
            }
        }
    }


    /////////////////////////////
    // EVENTS CALLBACKS
	function click_close(e){
        var target = $(e.currentTarget);

        if( (target.parents('.content').length || target.hasClass('content')) && !target.hasClass('close') )
            return true;

        close();
        return false;
    }

	function click_show(){
        // the triggering link might have some data on it
        var $button   = $(this),
            modalName = $button.data('modal').name,
            modalData = $button.data('modal').data.toLowerCase() || {};

        show( modalName, modalData );
    }

    /////////////////////////////
    // EVENTS

    EMC.DOM.$DOC
        .on('click.modal', 'a[data-modal], button[data-modal]', click_show)
        .on('keydown.closeModal', onKeyDown);

    modal
        //.on('click', click_close)
        .on('click', '.close', click_close)
        .on('submit', 'form', submitForm);




///////////////////////////////////////////////////////////////////////////////////////
// check if any modal is required to load from the from "hash" or "search" params

    (function(){
        var hashName     = window.location.hash.split('#')[1],
            searchQuery  = window.location.search.split('?')[1],
            lookForModal = hashName || searchQuery || null;

        if( lookForModal ){
            // direct to login modal (if needed)

            if( lookForModal == 'signin' )
                show('login');

            else if( lookForModal == 'signup' )
                show('signup');

            else if( lookForModal == 'submit' && localStorage['restoreModalData'] ){
                var modalData = JSON.parse( localStorage['restoreModalData'] );
                delete localStorage['restoreModalData'];
                show(lookForModal, modalData);
            }
            // if modal exists
            else if( EMC.templates['modals\\'+ lookForModal] ){
                // take the call outside of the time scope, to have enough time for "EMC.components.modals" to be available for the popups controllers
                setTimeout(function(){
                    show(lookForModal);
                },0);
            }
            else{
                return;
            }

            // clear hash
            var yScroll = EMC.utilities.window.scrollY;

            if( hashName )
                window.location.hash = '';

            window.scroll(0, yScroll);
        }
    })()


    // Expose
    return {
        modal      : modal,
        state      : state,
        show       : show,
        click_show : click_show,
        close      : close
    }
})();