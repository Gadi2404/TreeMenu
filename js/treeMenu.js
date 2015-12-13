//By Gadi
function TreeMenu(settings){
    this.settings = settings || {};
    this.treeElm = $('<ul>');
    this.buildTree(settings.data, this.treeElm);
    this.events.binding.call(this);
}

TreeMenu.prototype = {
    buildTree : function(data, elm){
        if( !data ) return;

        var ul = $('<ul></ul>');

        for( var i = 0; i < data.length; i++ ){
            var li = $('<li class="list-item"><label><input hidden class="checkbox" type="checkbox"><div class="cu-checkbox"></div><span>' + data[i].name + '</span></label></li>');

            elm.append(li);

            if(data[i].items){
                li.addClass('parent');
                li.prepend('<i class="openCloseBranch"></i>');
                this.buildTree(data[i].items, li);
            }
            
            if( li.siblings('label').length ){
                ul.append(li);
                elm.append(ul);
            }
            else
                elm.append(li);
        } 

        return ul;
    },

    events : {
        binding : function(){
            this.treeElm.on('change', ':checkbox', this.events.callbacks.onChange.bind(this));
            this.treeElm.on('click', '.parent', this.events.callbacks.openCloseBranch );
        },

        callbacks : {
            onChange : function(e){
                var branch = this.getBranch(e.target)
                var CS     = this.checkedParentChildrenState(branch.closestParent);
             
                this.selectAllChildren( branch.current, e.target.checked );

                this.setParentsState(branch.parents, CS.state);
                this.hasChecked.setParents( branch.parents, !CS.state && !!CS.arr[0]);

                // custom onChange callback
                this.settings.onChange && this.settings.onChange(e.target, branch, CS.state);
            },

            openCloseBranch : function(e){
                if( e.target.className == 'list-item' )
                    return false;

                if( !$(e.target).closest('label').length ){
                    $(this)
                        .find('> ul').slideToggle(300)
                        .addBack().find('.openCloseBranch').toggleClass('close');
                        return false;
                }
                
            }
        }
    },

    getBranch : function(elm){
        var current       = $(elm).closest('li'),
            parents       = current.parents('.parent'),
            closestParent = current.parentsUntil('.parent').parent('.parent');

        return {
            current,
            parents,
            closestParent
        }
    },

    // mark current parent item as checked only if all children items were checked
    setParentsState : function(parents, state){
        var that = this;
        return parents.each(function(i){
            var currentParent = $(this);

            if( i > 0 ){
                var CS = that.checkedParentChildrenState(currentParent);
                state = CS.state;
            }

            currentParent.find('> label > input').prop( "checked", state );
        });
    },

    // toggle "has checked" only if at least one was checked but not all
    hasChecked : {
        setParents : function(parents, state){
            return parents.each(function(i){
                if( i > 0 ){
                    state = !!$(this).find(':checked').length;
                }

                $(this).find('> label > .cu-checkbox').toggleClass('has-checked', state);  
            });
        },

        unset : function(elm){
            elm.find('.has-checked:first').removeClass('has-checked');
        }
    },

    // select all the children if has any
    selectAllChildren : function(parent, state){
        if( !state )
            this.hasChecked.unset(parent);

        return parent.find('input').prop("checked", state);
    },

    checkedParentChildrenState : function(closest){
        var allInputs = closest.find('> ul > li').find('> label input'),
            checkedInputs = allInputs.filter(':checked');

        return {
            arr   : [checkedInputs.length, allInputs.length],
            state : checkedInputs.length == allInputs.length
        };
    }
}

