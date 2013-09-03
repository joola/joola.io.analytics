function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
}

function verifyEmail(sEmail) {
    var status = false;
    var emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (sEmail.search(emailRegEx) == -1) {
        //alert("Please enter a valid email address.");
    }
    else {
        //alert("Woohoo!  The email address is in the correct format and they are the same.");
        status = true;
    }
    return status;
}

function validateForm(frm) {
    console.log('v');
    var validated = true;
    var $frm = $(frm);

    $frm.find('input.required, select.required, textarea.required').each(function (index, item) {
        if ($(this).val() == '' || $(this).val() == '-1') {
            validated = false;
            $(this).addClass('error');
        }
        else if ($(this).hasClass('error')) {
            validated = false;
        }
    });

    return validated;
}

$().ready(function () {
    setupForms();
});

function validateInput(input) {
    $(input).removeClass('error');

    if ($(input).val() != '') {
        $(input).addClass('on');
    }
    else if ($(input).val() == '' && $(input).hasClass('required')) {
        $(input).addClass('error');
    }
    else
        $(input).removeClass('on');

    if ($(input).hasClass('emailfield')) {
        if (!verifyEmail($(input).val())) {
            $(input).addClass('error');
        }
        else
            $(input).removeClass('error');
    }

    if ($(input).hasClass('phonefield')) {

        var Phone = $(input).val().replace(/\D+/g, '');
        if (Phone.length < 10) {
            $(input).addClass('error');
        }
        if (!$(input).hasClass('on')) {
            $(input).removeClass('error');
        }
    }
}

function validateSelect(select) {
    $(select).removeClass('error');

    if ($(select).prop("selectedIndex") == 0 && $(select).hasClass('required')) {
        $(select).addClass('error');
    } else if ($(select).prop("selectedIndex") > 0) {
        $(select).addClass('on');
    }
    else
        $(select).removeClass('on');
}

function validateFormControls() {

    $('form.largerform input, form.managed input, form.managed textarea, form.largerform textarea').each(function (index, item) {
        item = $(item);
        if (item.val()!='')
            validateInput(item);

    });

    $('form.largerform select, formmanaged select').each(function (index, item) {
        item = $(item);
        if (item.val()!='')
            validateSelect(item);
    });
}

function setupForms() {
    $('form.inplacesubmit').submit(function (e) {
        if (!validateForm($(this)))
            return false;

        //submit details

        var $frm = $(this);
        var endpoint = $(this).attr('action');
        var callback = $(this).attr('callback');

        var params = new Object();
        $(this).find('input, select, textarea').each(function (index, item) {
            var key = $(this).attr('data-param');
            var value = $(this).val();

            params[key] = value;
        });
        var originalbuttontext = $frm.find('.btn-primary').text();
        $frm.find('.btn-primary').addClass('disabled');
        $.ajax({
            url: endpoint,
            data: params,
            success: function (e) {
                $('#submit_alert').hide();
                if (callback) {
                    eval(callback);
                    return;
                }

                if ($frm.attr('data-donemessage')) {
                    $frm.find('.btn-primary').text($frm.attr('data-donemessage'));
                }
                else {
                    $frm.find('.btn-primary').text('Thanks, we\'ll be in touch');
                }
                if ($frm.attr('data-leaveenabled')) {
                    window.setTimeout(function () { $frm.find('.btn-primary').removeClass('disabled'); $frm.find('.btn-primary').text(originalbuttontext) }, 1000);
                }
                else {
                    $frm.find('.btn-primary').off('click');

                    $frm.find('input, select, textarea').each(function (index, item) {
                        $(this).addClass('disabled uneditable-input');
                        $(this).attr('disabled', '');
                    });
                }

            },
            error: function (e, b, c) {
                var str = e.responseText;
                var re = /\<title\>(.*?)\<\/title\>/g;
                var match = re.exec(str);

                $('#submit_alert').html('<strong>Error:</strong> ' + match[1]);
                $('#submit_alert').addClass('alert-error');
                $('#submit_alert').show();

                if ($frm.attr('data-leaveenabled')) {
                    window.setTimeout(function () { $frm.find('.btn-primary').removeClass('disabled'); $frm.find('.btn-primary').text(originalbuttontext) }, 1000);
                }
            }
        });

        return false;
    });

    $('form.largerform input, form.managed input').on('keyup', function(e) {
        e.preventDefault();
        if (e.which == 13) {
            $('form.largerform').submit();
            $('form.managed').submit();
        }
    
    });
    $('form.largerform input, form.managed input, form.managed textarea, form.largerform textarea').each(function(index, item) {
        $(this).on('change', function(e) {
            validateInput($(this));
        });
    });
    $('form.largerform select, form.managed select').each(function(index, item) {
        $(this).on('change', function(e) {
            validateSelect($(this));
        });
    });
  
        validateFormControls();

    $('form.largerform input, form.managed input, form.managed textarea, form.largerform textarea').each(function(index, item) {
        if ($(this).val() != '')
            $(this).trigger('change');
    });

    $('form.largerform select, form.managed select').each(function(index, item) {
        if ($(this).val() != '')
            $(this).trigger('change');
    });

}

//forgot button
$().ready(function () {
    $('#forgotbutton').on('click', function (e) {
        window.location = '/forgot.aspx';
    });
});


//Dashboard
function listDataSources(detailed) {
    new jarvis.objects.DataSources().List(this, null, function (sender, result) {
        if (result.length == 0) {
            var $table = $('.tblDataSource');

            var $tr = $('<tr></tr>');

            var $td = $('<td colspan="3" style="padding-top:20px;padding-bottom:20px;text-align:center;">No data sources are configured, <a href="">shall we add one?</a></td>');
            $tr.append($td);

            $table.append($tr);
            return;
        }
        $(result).each(function (index, ds) {
            var id = ds.ID;
            var name = ds.Name;
            var type = ds.Type;
            var status = 'Checking...';
            var server = ds.Server;
            var databasename = ds.DatabaseName;
            var $table = $('.tblDataSource');

            var $tr = $('<tr></tr>');

            var $td = $('<td><a class="link_datasource" data-id="' + id + '">' + name + '</a></td>');

            $td.find('a').on('click', function (e) {
                new jarvis.objects.DataSources().Get(sender, { id: $(this).attr('data-id') }, function (sender, result) {
                    $('.clicktext').hide();
                    var $details = $('.detailsview');
                    $details.show();

                    $details.find('.headertext').html('Configure <span style="color:#000">\'' + result.Name + '\'</span>');

                    $details.find('#config_name').val(ds.Name);
                    $details.find('#config_host').val(ds.Server);
                    $details.find('#config_port').val(ds.Port);
                    $details.find('#config_username').val(ds.Username);
                    $details.find('#config_password').val('********');

                    listDataTables(id);
                });
            });

            $tr.append($td);
            $td = $('<td>' + type + '</td>');
            $tr.append($td);
            if (detailed) {
                $td = $('<td>' + server + '</td>');
                $tr.append($td);
                $td = $('<td>' + databasename + '</td>');
                $tr.append($td);
            }
            $td = $('<td><span class="label label-info">' + status + '</span></td>');
            $tr.append($td);

            $table.append($tr);

            new jarvis.objects.DataSources().State(sender, { id: ds.ID }, function (sender, result) {
                if (result[0].value == '1')
                    $td.html('<span class="label label-success">' + 'Online' + '</span>');
                else {
                    $td.html('<span class="label label-important" rel="popover" data-content="' + result[1].value + '" data-original-title="Data Source Error">Offline</span>');
                    $td.find('[rel="popover"]').each(function (index, item) {
                        $(this).popover({ placement: 'top', delay: 0, trigger: 'click' });
                    });
                }
            });
        });
    });
}

function listDataTables(id) {
    new jarvis.objects.DataTables().List(this, { DataSourceID: id }, function (sender, result) {
        var $table = $('.tblTablesAndViews');
        $table.empty();

        result = _.sortBy(result, function (item) {
            if (item.Schema == '') {
                return item.Name;
            }
            else {
                //noscroll(item.Schema + '.' + item.Name);
                return item.Schema + '.' + item.Name;
            }
        });

        $(result).each(function (index, item) {
            var $tr = $('<tr></tr>');
            if (item.Type == '' && $('.select_showtables').val() == 'all')
                var $td = $('<td><a data-id="' + item.Name + '" data-schema="' + item.Schema + '" data-name="' + item.Name + '">' + item.Schema + '.' + item.Name + '</a></td>');
            else if (item.Type != '')
                var $td = $('<td><a data-id="' + item.Name + '" data-schema="' + item.Schema + '" data-name="' + item.Name + '">' + item.Name + '</a><span class="label label-info" style="margin-left:5px;">configured</span></td>');

            if ($td) {
                $td.find('a').on('click', function (e) {
                    new jarvis.objects.DataTables().Get(sender, { DataSourceID: id, Schema: $(this).attr('data-schema'), TableName: $(this).attr('data-name') }, function (sender, result) {
                    });
                });


                $tr.append($td);
            }

            $table.append($tr);
        });

        $('.select_showtables').off('change');
        $('.select_showtables').on('change', function (e) {
            listDataTables(id);
        });
    });
}


function listInstances() {
    var $table = $('.tblInstances');

    var $tr = $('<tr></tr>');

    var $td = $('<td colspan="4" style="padding-top:20px;padding-bottom:20px;text-align:center;">No Instances are configured, <a href="">shall we add one?</a></td>');
    $tr.append($td);

    $table.append($tr);
    return;
}

function initDashboard() {
    listDataSources();
    listInstances();
}

function initInstances() {
    listDataSources(true);
    listInstances();


    $('.btn_adddatasource').on('click', function (e) {
        $('.modal_adddatasource').modal();
    });


}

$().ready(function() {
    try {
        $('.noscroll').mousewheel(function(e, delta) {
            var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;

            if (delta > 0 && $(this).scrollTop() <= 0)
                return false;
            if (delta < 0 && $(this).scrollTop() >= this.scrollHeight - $(this).height())
                return false;

            return true;
        });
    } catch(e) {
        //do nothing, maybe it's missing due to missing login
    }

    $(window).bind('jarvis-loaded', function(e) {
        _.withoutex = function(left, right, prop) {
            var result = [];
            if (!prop)
                prop = 'ID';
            $(left).each(function(ileft, oleft) {
                var found = _.find(right, function(item) {
                    return (item[prop] == oleft[prop]);
                });
                if (!found)
                    result.push(oleft);
            });

            return result;
        };
    });
});



function setupLeftNavEvents() {
    $('.topicheader').off('click');
    $('.topicheader').on('click', function (e) {
        var $this = $(this);
        var $container = $($this.parent().find('.subtopic'));
        if ($container.hasClass('active'))
            $container.removeClass('active');
        else
            $container.addClass('active');
    });
    $('.topicheader li').on('click', function (e) {
        e.stopPropagation();
        $('.leftnav .popup_wrapper').hide();
    });

    $('.subtopiclist').off('click');
    $('.subtopiclist').on('click', function (e) {
        var $this = $(this);
        var $container = $($this.find('.subtopiclist_container'));
        var $header = $($this.find('.subtopiclistheader'));

        if ($container.hasClass('active')) {
            $this.removeClass('active');
            $container.removeClass('active');
            $header.addClass('active');

            //$container.animate({height:0}, 200).removeClass('active').css({height:'auto'});
        }
        else {
            $this.addClass('active');
            $container.addClass('active');
            $header.removeClass('active');
            $container.css({ height: $container.data().height + 'px' });
        }
    });

    $('.subtopiclist li').on('click', function (e) {
        e.stopPropagation();
    });

    $('.navsep').off('click');
    $('.navsep').on('click', function (e) {
        if ($('.leftnav').is(':visible')) {
            $('.leftnav').hide();
            $(this).addClass('collapsed');
        }
        else {
            $('.leftnav').show();
            $(this).removeClass('collapsed');
        }
        $(jarvis).trigger('wrapper_resize');
    });

}

function collapseAll() {
    $('li.subtopiclist_wrapper ').removeClass('active');
    $('ul.subtopiclist_container ').removeClass('active');

    $('li.topic ').removeClass('active');
    $('div.topic ').removeClass('active');
    $('ul.subtopic').removeClass('active');

}

function setSelected(key) {
    collapseAll();
    $('.topiclink').removeClass('active');

    var $thetopic = $('.topiclink[data-id="' + key + '"]');
    if ($thetopic.length == 0) {
        setTimeout(function () {
            $thetopic = $('.topiclink[data-id="' + key + '"]');
            $thetopic.addClass('active');
            $thetopic.parentsUntil('div.topic').parent().addClass('active');
        }, 2500);
    }
    else {
        $thetopic.addClass('active');
        $thetopic.parentsUntil('div.topic').parent().addClass('active');
    }
}


function setCaption(caption) {
    $('.jarvis.caption').html(caption);
}


function setDescription(description) {
    $('.jarvis.description').html(description);
}

function ConfirmDialog(caption, message, yes_callback, no_callback) {
    $('<div></div>').appendTo('body')
                    .html('<div><h6>' + message + '</h6></div>')
                    .dialog({
                        dialogClass: 'confirmdialog',
                        modal: true, title: caption, zIndex: 10001, autoOpen: true,
                        width: 'auto', resizable: false,
                        buttons: {
                            Yes: function () {
                                // $(obj).removeAttr('onclick');                                
                                // $(obj).parents('.Parent').remove();
                                if (typeof (yes_callback) == 'function')
                                    yes_callback();

                                $(this).dialog("close");
                            },
                            No: function () {
                                if (typeof (no_callback) == 'function')
                                    no_callback();

                                $(this).dialog("close");
                            }
                        },
                        close: function (event, ui) {
                            $(this).remove();
                        }
                    });
    $('.ui-dialog-buttonset button').addClass('btn');
};

(function ($) {
    $.fn.formex = function(options) {
        var _this = this;

        this.options = $.extend({ 
            cssClass:'form form-horizontal',
            draw: true,
            allowsubmit:true
            }, options);


        this.validate = function() {
            if (!options.inputs) {
                throw 'Cannot create form ex with no inputs';
            }
        };

        this.highlightinput = function(input) {
            input.removeClass('error');
            if (input.val() != '') {
                input.addClass('on');
            } else {
                input.removeClass('on');
            }
        };

        this.validateform = function() {
            var result = true;

            var inputs = this.form.find('input[data-mandatory="true"]');
            $(inputs).each(function(index, input) {
                input = $(input);
                var mandatory = input.attr('data-mandatory');
                if (mandatory && mandatory=='true' && input.val() == '') {
                    input.addClass('error');
                    result = false;
                }
            });

            return result;
        };

        this.submit = function() {
            if (!this.validateform()) {
                return false;
            }

            var inputs = this.form.find('input, select');
            $(inputs).each(function(index, input) {
                input = $(input);
                var name = input.attr('data-id');
                $(_this.options.inputs).each(function(index, item) {
                    if (item.caption == name) {
                        if (input.type == 'checkbox') {
                            item._value = item.value;
                            item.value = input.prop('checked');
                        } else {
                            item._value = item.value;
                            item.value = input.val();
                        }
                        if (item._value != item.value)
                            item.dirty = true;
                        else
                            item.dirty = false;
                    }

                });

            });
            return true;
        };

        this.draw = function() {
            this.validate();

            if (this.form) {
                this.form.remove();
                }
            this.form = $('<form></form>');

            $(this.options.inputs).each(function(index, input) {
                var group = $('<div class="control-group"></div>');
                var label = $('<label class="control-label"></label>');
                label.text(input.caption);
                group.append(label);
                var controls = $('<div class="controls"></div>');
                var control = $('');
                switch (input.type) {
                case 'hidden':
                    group.hide();
                    break;
                case 'text':
                    control = $('<input type="text"/>');
                    if (input.css)
                        control.addClass(input.css);
                    else {
                        control.addClass('input-medium');
                    }
                    control.off('keyup');
                    control.on('keyup', function() {
                        _this.highlightinput($(this));
                    });
                    break;
                case 'checkbox':
                    control = $('<input type="checkbox"/>');
                    if (input.css)
                        control.addClass(input.css);
                    control.off('keyup');
                    control.on('keyup', function() {
                        _this.highlightinput($(this));
                    });
                    break;                    
                case 'select':
                    control = $('<select></select>');
                    var option = $('<option value="-1">Please select</option>');
                    control.append(option);
                    $(input.data).each(function(index, item) {
                        option = $('<option value="' + item.ID + '">' + item.Name + '</option>');
                        control.append(option);
                    });
                    break;
                case 'collection':
                    control = $('<div class="label-picker"></div>');

                    $(input.value).each(function(index, item) {
                        var picker;
                        if (item.Group)
                            picker = $('<span class="label" >' + item.Group + '-' + item.Name + '<button type="button" class="close">×</button></span>');
                        else
                            picker = $('<span class="label" >' + item.Name + '<button type="button" class="close">×</button></span>');
                        if (item.Description) {
                            picker.attr('data-toggle', 'tooltip');
                            picker.attr('data-placement', 'top');
                            picker.attr('data-title', item.Description);
                            picker.tooltip();
                        }
                        picker.find('button').off('click');
                        picker.find('button').on('click', function(e) {
                            input.remove(item.ID, picker);
                        });
                        
                        control.append(picker);
                    });
                    if (typeof (input.addnew)=='function'){
                        var picker = $('<span class=\"label addnew\">+ add '+ input.caption.toLowerCase() +'</span>');
                        control.append(picker);
                        input.addnew(picker);
                    }
                    
                    break;
                default:
                    break;
                }
                control.attr('data-id', input.caption);
                if (input.value) {
                    control.addClass('on');
                    if (input.value.ID) {
                        control.val(input.value.ID);
                    }
                    else {
                        if (input.type == 'checkbox' && input.value == true){
                            control.prop('checked', true);
                            }
                        else
                            control.val(input.value);
                    }
                }
                if (input.mandatory && input.mandatory=='true')
                    control.attr('data-mandatory', 'true');

                input.control= control;

                controls.append(control);
                
                var helptext = $('<span class="help-inline"></span>');
                helptext.text(input.helptext);
                controls.append(helptext);
                group.append(controls);

                _this.form.append(group);
            });
            var actions = $('<div class="form-actions"></div>');
            if (this.options.allowsubmit) {
                
                var btn_submit = $('');
                if (_this.options.type == 'edit') {
                    btn_submit = $('<button type="button" class="btn btn-primary">Save changes</button>');
                } else {
                    btn_submit = $('<button type="button" class="btn btn-primary">Save changes</button>');
                }
                btn_submit.off('click');
                btn_submit.on('click', function(e) {
                    e.preventDefault();
                    if (_this.submit())
                        _this.trigger('formsubmit', [_this]);
                    return false;
                });
                var btn_delete = $('');
                if (_this.options.type == 'edit')
                    btn_delete = $('<button type="button" class="btn" style="margin-left:5px;">Delete</button>');
                btn_delete.off('click');
                btn_delete.on('click', function(e) {
                    ConfirmDialog('Delete?', 'Are you sure you wish to delete \'' + _this.options.id + '\'?', function() {
                        e.preventDefault();
                        if (_this.submit())
                            _this.trigger('formdelete', [_this]);
                        return false;
                    }, null);

                });

                actions.append(btn_submit);
                actions.append(btn_delete);
                
            } else {
                var p = $('<div style="width:80%;"></div>');
                p.html('<label style="margin-bottom:20px" class="label">This is an external object which can only be edited or deleted using its proprietary system.</label>');
               // this.form.prepend(p);
                actions.append(p);
            }
            this.form.append(actions);
            this.append(this.form);

            $('div.tab[data-id="tab-'+_this.options.id+'"] #frmcaption').text(_this.options.caption);
        };

        if (this.options.draw)
            this.draw();
        
        this.attr('class', 'formex ' + this.options.cssClass);
        
               
        return this;
    };

    $.fn.tabex = function(options) {
        var _this = this;

        // merge default and user parameters
        this.options = $.extend({
            cssClass: '',
            draw: true,
            onshow:function (){}
        }, options);


        this.validate = function() {
            if (!options.data) {
                throw 'Cannot create tab ex with no data';
            }
        };

        this.addtab = function(tab) {
            var found = false;
            $(this.options.data).each(function(index, item) {
                if (item.caption.toUpperCase() == tab.caption.toUpperCase()) {
                console.log('found tab');
                    found = true;
                    item.active = true;
                    //item.onshow = tab.onshow;
                }
                else
                    item.active = false;
            });
            if (!found){
            console.log('adding tab to data');
                this.options.data.push(tab);
            }
            this.draw();
            if (typeof (tab.onshow) == 'function')
            tab.onshow();
        };

        this.deletetab = function(caption) {
            $(this.options.data).each(function(index, item) {
                if (item.caption.toUpperCase() == caption.toUpperCase()) {
                    _this.options.data.splice(index, 1);
                    if (item.active)
                        _this.options.data[(index - 1 < 0 ? 0 : index - 1)].active = true;
                }
            });

            this.draw();
        };

        this.draw = function() {
         
            this.validate();

            this.empty();
            var tabs = $('<ul class="nav nav-tabs"></ul>');

            var selected;
            $(this.options.data).each(function(index, object) {
                var tab;
                if (object.active) {
                    selected = object;
                    tab = $('<li class="active" data-id="tab-'+ object.id +'"><a href="#" data-toggle="tab">' + object.caption + '</a></li>');
                } else {
                    tab = $('<li data-id="tab-'+ object.id +'"><a href="#" data-toggle="tab">' + object.caption + '</a></li>');
                }
                if (object.type != 'fixed') {
                    tab.addClass('fixed');
                    tab.prepend('<button type="button" class="close" data-dismiss="alert">×</button>');

                    tab.find('button').off('click');
                    tab.find('button').on('click', function(e) {
                        $(_this.options.data).each(function(index, item) {
                            if (item.id==object.id){
                                _this.options.data.splice(index, 1);
                                if (item.active)
                                    _this.options.data[(index - 1 < 0 ? 0 : index - 1)].active = true;
                            }
                        });
                        _this.draw();
                    });
                }
                tabs.append(tab);
            });

            this.append(tabs);
            $('body').find('div.tab[data-id!="tab-'+selected.id+'"]').hide();
            $('body').find('div.tab[data-id="tab-'+selected.id+'"]').show();
            
            this.find('a[data-toggle="tab"]').off('shown');
            this.find('a[data-toggle="tab"]').on('shown', function(e) {
                var previous = $(e.relatedTarget).parent().attr('data-id').replace('tab-','');
                var target = $(e.target).parent().attr('data-id').replace('tab-','');

                $(_this.options.data).each(function(index, tab) {
                    if (tab.id == previous)
                        tab.active = false;
                    else if (tab.id == target)
                        tab.active = true;
                });

                _this.draw();
            });

            if (typeof (selected.onshow)=='function')
                selected.onshow();
        };
        
        if (this.options.draw){
            this.draw();
          
        }

        this.attr('class', 'tabex ' + this.options.cssClass);
        
        return this;

    };

    $.fn.tableex = function (options) {
        var _this = this;
        
        // merge default and user parameters
        this.options = $.extend({ 
            cssClass:'table table-striped table-hover sortable',
            draw:true,
            actionbar:true,
            sortable:true,
            caption:'Caption',
            maxtextlength:120,
            formatter: function(index, content) {
            try {
                if (content.length > _this.options.maxtextlength) {
                    return content.substring(0, _this.options.maxtextlength) + '...';
                } else {
                    return content;
                }
            } catch(ex) {
                return '';
            }
        }
        }, options);

        this.validate = function() {
            if (!options.data) {
                throw 'Cannot create table ex with no data';
            }
        };

        this.header = null;
        this.actionbar = null;
        
        this.search = function(e, term) {
            if ((term == '' || term.length < 1) && e.which != 13) {
                this.options.data = this.options.basedata;
            } else {
                this.options.data = _.filter(this.options.basedata, function(item) {
                    var found = false;
                    if (_this.options.columns) {
                        $(_this.options.columns).each(function(index, column) {
                            if (!found){
                                $.each(item, function(key, value) {
                                    if (!found){
                                        if (column.toUpperCase() == key.toUpperCase()) {
                                            if (value.toString().toUpperCase().indexOf(term.toUpperCase())>-1) {
                                                found = true;
                                            }
                                        }
                                    }
                                });
                            }
                        });
                        if (found)
                             return true;
                    } else {
                        $.each(object, function(key, value) {
                            if (value.toString().indexOf(term)>-1)
                                return true;
                        });
                    }
                });
            }

            this.draw();
        };

        this.addactionbar = function() {
            var tr = $('<tr class="actionbar"></tr>');
            var td = $('<div class="actionbarwrapper"></div>');

            var caption = $('<div class="caption"></div>');
            caption.text(this.options.caption);
            td.append(caption);
            
            var search = $('<div class="search input-append">'+
              '<input class="span2" id="appendedInput" type="text">'+
              '<span class="add-on"><i class="icon-search"></i></span>'+
            '</div>');

            var listsize = $('<div class="listsize btn-group">'+
              '<button type="button" class="btn active"><i class=" icon-th-list"></i></button>'+
              '<button type="button" class="btn"><i class="icon-th"></i></button>'+
            '</div>');
            td.append(listsize);
            
            td.append(search);
            //this.find('.actionbarrow').empty();
            this.find('.actionbarrow').append(td);
            
            search.find('input').keyup(function (e) {
                var term = search.find('input').val();
                _this.search(e, term);
            });

            //bthis.table.append(tr);
        };

        this.addColumn = function(column_name) {
            if (!this.header) {
                this.header = $('<tr class="tableex_header"></tr>');
                this.table.append(this.header);
            }
            var th = $('<th class="tableex_caption"></th>');
            var _column_name = '';
            console.log(column_name);
            $(column_name).each(function(index, item) {
                if (item.length > 1)
                    _column_name += ' ' + item;
                else
                    _column_name += item;
            });
            th.text($.trim(_column_name));

            th.off('click');
            th.on('click', function() {
                _this.sort(column_name);
            });

            this.header.append(th);
        };

        this.sort = function(key) {

            this.options.data = _.sortBy(this.options.data, function(item) {
                return item[key];
            });
            this.draw();
        };

        var topRow = true;
        this.draw = function() {
            this.validate();

            this.header = null;
            //this.empty();

            if (this.find('.actionbarrow').length == 0) {
                this.actionbarrow = $('<div class="actionbarrow"></div><div class="tablewrapper"><table></table></div>');
                this.append(this.actionbarrow);
            } else {
               
            }
            this.table = $(this.actionbarrow.find('table'));
            this.table.find('.tableex_row').remove();
            
            if (_this.options.actionbar && _this.find('.actionbarwrapper').length==0)
                _this.addactionbar();
            else if(!_this.options.actionbar) {
                _this.find('.actionbarrow').hide();
            }

            this.table.attr('class', 'tableex ' + this.options.cssClass);
            $(_this.options.data[0]).each(function(index, object) {
                if (topRow){
                    if (_this.options.sortable) {
                        _this.addColumn('');
                    }
                    if (_this.options.columns) {
                        $(_this.options.columns).each(function(index, column) {
                            $.each(object, function(key, value) {
                                if (column.toUpperCase() == key.toUpperCase()) {
                                    _this.addColumn(key.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1));
                                }
                            });
                        });
                    } else {
                        _this.options.columns = [];
                        $.each(object, function(key, value) {
                            _this.addColumn(key.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1));
                            _this.options.columns.push(key);
                        });
                    }
                    $('.actionbarwrapper').attr('colspan', _this.options.columns.length+1);
                }
                topRow = false;
            });
            
            $(_this.options.data).each(function(index, object) {
                var tr = $('<tr class="tableex_row"></tr>');
                if (_this.options.sortable){
                var td = $('<td></td>');
                td.html('<div class="grip invert"></div>');
                tr.append(td);
                    }
                if (_this.options.columns) {
                    $(_this.options.columns).each(function(colindex, column) {
                        $.each(object, function(key, value) {
                            if (column.toUpperCase() == key.toUpperCase()) {
                                var td = $('<td></td>');
                                td.html(_this.options.formatter(colindex, value));
                                tr.append(td);
                            }
                        });
                    });
                } else {
                    $.each(object, function(key, value) {
                        var td = $('<td></td>');
                                td.html(_this.options.formatter(-1, value));
                                tr.append(td);
                    });
                }
                tr.off('click');
                tr.on('click', function(e) {
                    e.stopPropagation();
                    if (object)
                        $(_this).trigger('select', object);
                });
                _this.table.append(tr);
            });
            
            if (_this.table.find('.tableex_row').length == 0) {
                try{
                    var td = $('<td colspan="'+_this.options.columns.length+'" style="text-align:center"></td>');
                    td.text('Nothing to show here!');
                    _this.table.append($('<tr class="tableex_row"></tr>').append(td));
                }
                catch(ex){}
            }

            if (this.options.sortable)
                $( ".sortable" ).sortable({ items:'.tableex_row', handle:'.grip',}).disableSelection();
            
            this.find('.tablewrapper').bind('mousewheel', function (e, d) {
                if ($(this).get(0).scrollHeight > $(this).height()){
                    if (d > 0 && $(this).scrollTop() == 0)
                        e.preventDefault();
                    else if (d < 0 && $(this).scrollTop() == $(this).get(0).scrollHeight - $(this).innerHeight())
                        e.preventDefault();
                }
            });
        };

        if (this.options.columns)
            this.sort(this.options.columns[0]);
        this.options.basedata = $.extend(this.options.data, true);
        
        if (this.options.draw)
            this.draw();

        // allow jQuery chaining
        return this;
    };
})(jQuery);

$('.demonoticebar.dismiss').on('click', function() {
    
}   );