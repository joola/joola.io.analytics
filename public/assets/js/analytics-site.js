function buildContentMenus() {
    buildContentMenu_Realtime();
    buildContentMenu_Dashboards();
    buildContentMenu_Reports();

    /*
     joolaio.objects.Dimensions.List(null, null, function () {
     });
     joolaio.objects.Metrics.List(null, null, function () {
     });*/
}

function buildContentMenu_Realtime() {
    joolaio.objects.RealtimePanels.List(this, null, function (sender, data) {
        var $panellist = $('body').find('.panel-list');
        if ($panellist.length > 0) {
            var container = $panellist;
            $(container).empty();
            $(data).each(function (index, item) {

                //if (sender.panelID == -1)
                //  sender.panelID = item.ID;

                var $item = $('<li class="defaultnav"><a data-id="' + item.id + '">' + item.name + '</a></li>');
                $item.off('click');
                $item.on('click', function (e) {
                    $(joolaio).trigger('realtimepanelchange', item.id);
                });
                $(container).append($item);
            });
            $(container).append('<li class="divider"></li>');
            var $item = $('<li class="add-panel defaultnav"><a>+ Add Panel</a></li>');
            $item.off('click');
            $item.on('click', function (e) {
                var matchedContainers = $('.joolaio.container.realtime');
                //sender._this.showEdit({container:matchedContainers, addNew:true, _this:sender._this});
                joolaio.getRealtimePanel().showEdit({container: matchedContainers, addNew: true, _this: joolaio.getRealtimePanel()});
            });
            $(container).append($item);

            $('.subnav').show();
            if (data.length == 0)
                $('.panels-button-realtime').hide();
        }
    });
}

function buildContentMenu_Dashboards() {
    joolaio.objects.Dashboards.List(this, null, function (sender, data) {
        var $panellist = $('body').find('.dashboard-list');
        if ($panellist.length > 0) {
            var container = $panellist;
            $(container).empty();
            $(data).each(function (index, item) {

                //if (sender.panelID == -1)
                //  sender.panelID = item.ID;

                var $item = $('<li class="defaultnav"><a data-id="' + item.id + '">' + item.name + '</a></li>');
                $item.off('click');
                $item.on('click', function (e) {
                    $(joolaio).trigger('dashboardchange', item.id);
                });
                $(container).append($item);
            });
            $(container).append('<li class="divider"></li>');
            var $item = $('<li class="add-panel defaultnav"><a>+ Add Dashboard</a></li>');
            $item.off('click');
            $item.on('click', function (e) {
                var matchedContainers = $('.joolaio.container.realtime');
                //new joolaio.dashboard.visualisation.Panel().showEdit({container:matchedContainers, addNew:true, _this:new joolaio.dashboard.visualisation.Panel()});
                joolaio.getDashboard().showEdit({container: matchedContainers, addNew: true, _this: joolaio.getDashboard()});
            });
            $(container).append($item);

            $('.subnav').show();
        }
        //else
        //    $panellist.hide();
    });
}

function buildContentMenu_Reports() {
    joolaio.objects.Reports.List(this, null, function (sender, data) {
        var $panellist = $('body').find('.report-list');
        $panellist.empty();
        if ($panellist.length > 0) {
            var container = $panellist;
            $(container).empty();

            var categories = _.groupBy(data, function (obj) {
                if (!obj.Category)
                    return '(not set)';
                return obj.Category.name;
            });


            categories = _.sortBy(categories, function (obj) {
                if (!obj[0].Category)
                    return -1;
                return obj[0].Category.Ordinal;
            });

            _.each(categories, function (category, i) {

                var categoryname = '';
                if (!category[0].Category) {
                    categoryname = '(not set)';
                }
                else {
                    categoryname = category[0].Category.name;
                }
                if (categoryname != '(not set)') {

                    var $item = $('<li class="divider"></li><li class="defaultnav disabled"><a data-id="' + categoryname + '">' + categoryname + '</a></li>');
                    $(container).append($item);
                }
                $(category).each(function (index, item) {
                    var $item = $('<li class="defaultnav"><a data-id="' + item.id + '">' + item.name + '</a></li>');
                    $item.off('click');


                    $item.on('click', function (e) {

                        $(joolaio).trigger('reportchange', item.id);
                    });
                    $(container).append($item);
                });
            })
            $(container).append('<li class="divider"></li>');
            var $item = $('<li class="add-report defaultnav"><a>+ Add Report</a></li>');
            $item.off('click');
            $item.on('click', function (e) {
                //var matchedContainers = $('.joolaio.container.report');
                //$(joolaio).trigger('reportchange', $(this).attr('data-id'));

                $(joolaio).trigger('reportchange', -1);
                var matchedContainers = $('.joolaio.report.panel');
                var o = new joolaio.visualisation.report.Editor();
                o.init(o, {container: matchedContainers, reportID: -1});

                //joolaio.visualisation.setDisplay('report');
            });
            $(container).append($item);

            $('.subnav').show();
        }
    });
}


//Textbox handling
$().ready(function () {

    $('form.required').submit(function (e) {

        if (!validateForm($(this))) {
            console.log('form validation failed');
            return false;
        }
    });

    $('form.largerform input, form.managed input, form.largerform textarea').each(function (index, item) {
        if ($(this).attr('type') != 'hidden') {
            $(this).on('change', function (e) {

                $(this).removeClass('error');

                if ($(this).val() != '')
                    $(this).addClass('on');
                else
                    $(this).removeClass('on');

                if ($(this).hasClass('emailfield')) {
                    if (!verifyEmail($(this).val())) {
                        $(this).addClass('error');
                    }
                    else
                        $(this).removeClass('error');
                }

                if ($(this).hasClass('phonefield')) {

                    var Phone = $(this).val().replace(/\D+/g, '');
                    if (Phone.length < 10) {
                        $(this).addClass('error');
                    }
                    if (!$(this).hasClass('on')) {
                        $(this).removeClass('error');
                    }
                }
            });
        }

        $('form.largerform input, form.managed input, form.largerform textarea').each(function (index, item) {
            if ($(this).attr('type') != 'hidden') {

                if ($(this).val() != '')
                    $(this).trigger('change');
            }
        });
    });
});


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
function registerLaunchHook() {
    try {
        $('.launchlink').on('click', function () {
            $(joolaio).trigger('dashboardchange', parseInt(-1));
        });

    }
    catch (e) {
    }
}

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function setupLeftNavContents() {
    joolaio.objects.Dashboards.List(null, null, function () {
        var $dashboards = $('.nav-dashboards');
        $dashboards.empty();
        $(joolaio.objects.Dashboards).each(function (index, dashboard) {

            var $li = $('<li class="subtopicheader subtopicheader_wrapper"></li>');
            var $a = $('<a class="topiclink" title="' + dashboard.name + '" data-id="' + dashboard.id + '"></a>');
            var $caption = $('<div class="subtopiccaption">' + dashboard.name + '</div>');
            $a.append($caption);
            $li.append($a);
            $li.on('click', function (e) {
                $(joolaio).trigger('dashboardchange', dashboard.id);
            });
            $dashboards.append($li);
        });

        /* Hiding add new dashboard li */
        /*
         var $li = $('<li class="subtopicheader subtopicheader_wrapper"></li>');
         var $a = $('<a class="topiclink" title="addnew"></a>');
         var $caption = $('<div class="subtopiccaption">+ Add new dashboard</div>');
         $a.append($caption);
         $li.append($a);

         $li.off('click');
         $li.on('click', function (e) {
         var matchedContainers = $('.joolaio.container.realtime');
         //new joolaio.dashboard.visualisation.Panel().showEdit({container:matchedContainers, addNew:true, _this:new joolaio.dashboard.visualisation.Panel()});
         joolaio.getDashboard().showEdit({container: matchedContainers, addNew: true, _this: joolaio.getDashboard()});
         });

         $dashboards.append($li);
         */
    });

    joolaio.objects.RealtimePanels.List(null, null, function () {
        var $panels = $('.nav-panels');
        $panels.empty();
        $(joolaio.objects.RealtimePanels).each(function (index, panel) {

            var $li = $('<li class="subtopicheader subtopicheader_wrapper"></li>');
            var $a = $('<a class="topiclink" title="' + panel.name + '"></a>');
            var $caption = $('<div class="subtopiccaption">' + panel.name + '</div>');
            $a.append($caption);
            $li.append($a);
            $li.off('click');
            $li.on('click', function (e) {
                $(joolaio).trigger('realtimepanelchange', panel.id);
            });
            $panels.append($li);
        });


        var $li = $('<li class="subtopicheader subtopicheader_wrapper"></li>');
        var $a = $('<a class="topiclink" title="addnew"></a>');
        var $caption = $('<div class="subtopiccaption">+ Add new panel</div>');
        $a.append($caption);
        $li.append($a);

        $li.off('click');
        $li.on('click', function (e) {
            var matchedContainers = $('.joolaio.container.realtime');
            //sender._this.showEdit({container:matchedContainers, addNew:true, _this:sender._this});
            $('#modal-notimplemented').modal('show');
            //joolaio.getRealtimePanel().showEdit({container:matchedContainers, addNew:true, _this:joolaio.getRealtimePanel()});
        });

        $panels.append($li);
    });

    joolaio.objects.Reports.List(null, null, function (sender, data) {
        var $reports = $('.nav-reports');
        $reports.empty();

        var categories = _.groupBy(data, function (obj) {
            if (!obj.Category)
                return '(not set)';
            return obj.Category.name;
        });


        categories = _.sortBy(categories, function (obj) {
            if (!obj[0].Category)
                return -1;
            return obj[0].Category.Ordinal;
        });

        _.each(categories, function (category, i) {

            var categoryname = '';
            if (!category[0].Category) {
                categoryname = '(not set)';
            }
            else {
                categoryname = category[0].Category.name;
            }


            var $container = $reports;
            if (categoryname != '(not set)') {
                var $li = $('<li class="subtopiclist subtopiclist_wrapper"></li>');
                var $header = $('<div class="subtopiclistheader topiclink"></div>');
                var $icon = $('<div class="subtopicicon"></div>');
                var $caption = $('<div class="subtopiccaption">' + categoryname + '</div>');
                $header.append($icon);
                $header.append($caption);
                $li.append($header);
                $($reports).append($li);

                var $ul = $('<ul class="subtopiclist_container"></ul>');

                $(category).each(function (index, report) {
                    var $li = $('<li class="Mn subtopiclist_topics">');
                    var $a = $('<a class="topiclink" title="' + report.name + '" data-id="' + report.id + '"></a>');
                    var $caption = $('<div class="subtopiccaption">' + report.name + '</div>');
                    $a.append($caption);
                    $li.append($a);

                    $li.on('click', function (e) {

                        $(joolaio).trigger('reportchange', report.id);
                    });

                    $ul.append($li);
                });

                $li.append($ul);
            }
            else {
                $(category).each(function (index, report) {
                    var $li = $('<li class="subtopicheader subtopicheader_wrapper"></li>');
                    var $a = $('<a class="topiclink" title="' + report.name + '" data-id="' + report.id + '"></a>');
                    var $caption = $('<div class="subtopiccaption">' + report.name + '</div>');
                    $a.append($caption);
                    $li.append($a);

                    $li.on('click', function (e) {

                        $(joolaio).trigger('reportchange', report.id);
                    });

                    $container.append($li);
                });
            }

        });
        /* Hiding add new report li */
        /*
         var $li = $('<li class="subtopicheader subtopicheader_wrapper"></li>');
         var $a = $('<a class="topiclink" title="addnew"></a>');
         var $caption = $('<div class="subtopiccaption">+ Add new report</div>');
         $a.append($caption);
         $li.append($a);

         $li.off('click');
         $li.on('click', function (e) {
         $(joolaio).trigger('reportchange', -1);
         var matchedContainers = $('.joolaio.report.panel');
         var o = new joolaio.visualisation.report.Editor();
         o.init(o, {container: matchedContainers, reportID: -1});
         });
         $reports.append($li);
         */
        setupLeftNavEvents();
    });
}

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
            $container.css({height: $container.data().height + 'px'});
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
        $(joolaio).trigger('wrapper_resize');
    });

    setupRecent();
}

function collapseAll() {
    $('li.subtopiclist_wrapper ').removeClass('active');
    $('ul.subtopiclist_container ').removeClass('active');

    $('li.topic ').removeClass('active');
    $('div.topic ').removeClass('active');
    $('ul.subtopic').removeClass('active');

}
$(window).bind('joolaio-initialized', function () {

    $(joolaio).bind('setreport', function (e, reportID) {

        collapseAll();

        $('.topiclink').removeClass('active');

        var $thetopic = $('.topiclink[data-id="' + reportID + '"]');
        if ($thetopic.length == 0) {
            setTimeout(function () {

                $thetopic = $('.topiclink[data-id="' + reportID + '"]');
                $thetopic.addClass('active');
                $thetopic.parentsUntil('div.topic').parent().addClass('active');
            }, 2500);
        }
        else {
            $thetopic.addClass('active');
            $thetopic.parentsUntil('div.topic').parent().addClass('active');
        }

        joolaio.objects.Reports.Get(null, {id: reportID}, function (sender, data) {
            pushRecent({type: 'report', id: data.id, data: data});
        });
    });

    $(joolaio).bind('setdashboard', function (e, dashboardID) {


        collapseAll();
        $('.topiclink').removeClass('active');

        var $thetopic = $('.topiclink[data-id="' + dashboardID + '"]');
        if ($thetopic.length == 0) {
            setTimeout(function () {
                $thetopic = $('.topiclink[data-id="' + dashboardID + '"]');
                $thetopic.addClass('active');
                $thetopic.parentsUntil('div.topic').parent().addClass('active');
            }, 2500);
        } else {
            $thetopic.addClass('active');
            $thetopic.parentsUntil('div.topic').parent().addClass('active');
        }

        joolaio.objects.Dashboards.Get(null, {id: dashboardID}, function (sender, data) {
            pushRecent({type: 'dashboard', id: data.id, data: data});
        });

    });
})


$('.helpblock .reporthelp .joolaio.caption').bind('contentchange', function () {
    var $helpblock = $($('.helpblock .resources')[0]);
    $helpblock.empty();
    var resources = [];
    if (joolaio.state.view == 'dashboard') {
        $(this).text('The ' + $(this).text() + ' dashboard');
        resources.push({title: 'About dashboards', url: 'http://'});
        resources.push({title: 'Create/edit/delete dashboards', url: 'http://'});
        resources.push({title: 'Add widgets to your dashboard', url: 'http://'});
    }
    else if (joolaio.state.view == 'report') {
        $(this).text('The ' + $(this).text() + ' report');
        var resource = {title: 'Test', url: 'http://'};
        resources.push({title: 'About reports', url: 'http://'});
        resources.push({title: 'Create/edit/delete reports', url: 'http://'});
        resources.push({title: 'Viewing metrics', url: 'http://'});
        resources.push({title: 'Changing dimensions', url: 'http://'});
    }
    else {
    }

    $(resources).each(function (index, resource) {
        var $resource = $('<div class="resourcewrapper"><a class="resource">' + resource.title + '</a></div>');
        $helpblock.append($resource);
    });

    $('.resourcewrapper .resource').off('click');
    $('.resourcewrapper .resource').on('click', function (e) {
        $('#modal-notimplemented').modal('show');
    });
});


function supportsLocalStorage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

//var recent = [];

function pushRecent(item) {
    recent = listRecent();
    $(recent).each(function (index, orecent) {
        if (orecent.type == item.type && orecent.data.id == item.data.id)
            recent.splice(index, 1);
    });
    recent.push(item);
    if (recent.length > 5) {
        recent.splice(0, 1);
    }
    localStorage['recent'] = JSON.stringify(recent);
}

function listRecent() {
    recent = localStorage['recent'];
    if (!recent || typeof (recent) == 'undefined') {
        recent = JSON.stringify([]);
    }
    return JSON.parse(recent);
}

function setupRecent() {
    $('.searchmore_text').off('focus');
    $('.searchmore_text').on('click', function () {
        $('.recentitem').remove();
        $('.leftnav .popup_wrapper').show();

        var recent = listRecent();
        recent.reverse();
        $(recent).each(function (index, item) {
            if (item.type == 'dashboard') {
                var $item = $('<div class="recentitem"><span class="topic">Dashboards</span><span class="seperator">›</span><span class="subtopic">' + item.data.name + '</span></div>');

                $item.on('click', function (e) {
                    $(joolaio).trigger('dashboardchange', item.data.id);
                    $('.leftnav .popup_wrapper').hide();
                });

                $('.leftnav .recent_wrapper').append($item);
            }
            else if (item.type == 'report') {
                var category = item.data.Category.name;
                if (category == '(not set)')
                    category = '';
                if (category == '')
                    var $item = $('<div class="recentitem"><span class="topic">Reports</span><span class="seperator">›</span><span class="subtopic">' + item.data.name + '</span></div>');
                else
                    var $item = $('<div class="recentitem"><span class="topic">Reports</span><span class="seperator">›</span><span class="topic">' + category + '</span><span class="seperator">›</span><span class="subtopic">' + item.data.name + '</span></div>');
                $item.on('click', function (e) {
                    $(joolaio).trigger('reportchange', item.data.id);
                    $('.leftnav .popup_wrapper').hide();
                });

                $('.leftnav .recent_wrapper').append($item);
            }
        })
    });

    $('.searchmore_text').on('click', function (e) {
        e.stopPropagation();
    });
    $('.leftnav .recent_wrapper').on('click', function (e) {
        e.stopPropagation();
    });

    $('body').click(function () {
        $('.leftnav .popup_wrapper').hide();
    });


    var search = function (e, term) {

        if ((term == '' || term.length < 1 ) && e.which != 13) {
            $('.searchresultitem').remove();
        }
        else {
            $('.searchresultitem').remove();

            $(joolaio.objects.Dashboards).each(function (item, dashboard) {
                if (dashboard.name.toLowerCase().indexOf(term.toLowerCase()) > -1) {

                    var reg = new RegExp(term, 'gi');
                    var final_dashboard_name = dashboard.name.replace(reg, function (str) {
                        return '<b>' + str + '</b>'
                    });

                    var $item = $('<div class="searchresultitem"><span class="topic">Dashboards</span><span class="seperator">›</span><span class="subtopic">' + final_dashboard_name + '</span></div>');
                    $item.on('click', function (e) {
                        $(joolaio).trigger('dashboardchange', dashboard.id);
                        $('.leftnav .results_wrapper').hide();
                    });

                    $('.leftnav .results_wrapper').append($item);
                }
            });

            $(joolaio.objects.Reports).each(function (item, report) {
                if (report.name.toLowerCase().indexOf(term.toLowerCase()) > -1) {
                    var category = report.Category.name;
                    if (category == '(not set)')
                        category = '';

                    var reg = new RegExp(term, 'gi');
                    var final_report_name = report.name.replace(reg, function (str) {
                        return '<b>' + str + '</b>'
                    });

                    if (category == '')
                        var $item = $('<div class="searchresultitem"><span class="topic">Reports</span><span class="seperator">›</span><span class="subtopic">' + final_report_name + '</span></div>');
                    else
                        var $item = $('<div class="searchresultitem"><span class="topic">Reports</span><span class="seperator">›</span><span class="topic">' + category + '</span><span class="seperator">›</span><span class="subtopic">' + final_report_name + '</span></div>');
                    $item.on('click', function (e) {
                        $(joolaio).trigger('reportchange', report.id);
                        $('.leftnav .results_wrapper').hide();
                    });

                    $('.leftnav .results_wrapper').append($item);
                }
            });

            $('.leftnav .popup_wrapper').show();
        }
    }
    $('.searchmore_text').keyup(function (e) {
        var term = $('.searchmore_text').val();
        search(e, term);
    });
}

$(window).bind('joolaio-initialized', function () {
    $(joolaio).bind('joolaio-session-timeout', function () {
        location.href = '/login';
    })
});