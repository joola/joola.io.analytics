function buildContentMenus() {
    buildContentMenu_Realtime();
    buildContentMenu_Dashboards();
    buildContentMenu_Reports();

    jarvis.objects.Dimensions.List(null, null, function () {
    });
    jarvis.objects.Metrics.List(null, null, function () {
    });

}

function buildContentMenu_Realtime() {
    jarvis.objects.RealtimePanels.List(this, null, function (sender, data) {
        var $panellist = $('body').find('.panel-list');
        if ($panellist.length > 0) {
            var container = $panellist;
            $(container).empty();
            $(data).each(function (index, item) {

                //if (sender.panelID == -1)
                //  sender.panelID = item.ID;

                var $item = $('<li class="defaultnav"><a data-id="' + item.ID + '">' + item.Name + '</a></li>');
                $item.off('click');
                $item.on('click', function (e) {
                    $(jarvis).trigger('realtimepanelchange', item.ID);
                });
                $(container).append($item);
            });
            $(container).append('<li class="divider"></li>');
            var $item = $('<li class="add-panel defaultnav"><a>+ Add Panel</a></li>');
            $item.off('click');
            $item.on('click', function (e) {
                var matchedContainers = $('.jarvis.container.realtime');
                //sender._this.showEdit({container:matchedContainers, addNew:true, _this:sender._this});
                jarvis.getRealtimePanel().showEdit({container: matchedContainers, addNew: true, _this: jarvis.getRealtimePanel()});
            });
            $(container).append($item);

            $('.subnav').show();
            if (data.length == 0)
                $('.panels-button-realtime').hide();
        }
    });
}

function buildContentMenu_Dashboards() {
    jarvis.objects.Dashboards.List(this, null, function (sender, data) {
        var $panellist = $('body').find('.dashboard-list');
        if ($panellist.length > 0) {
            var container = $panellist;
            $(container).empty();
            $(data).each(function (index, item) {

                //if (sender.panelID == -1)
                //  sender.panelID = item.ID;

                var $item = $('<li class="defaultnav"><a data-id="' + item.ID + '">' + item.Name + '</a></li>');
                $item.off('click');
                $item.on('click', function (e) {
                    $(jarvis).trigger('dashboardchange', item.ID);
                });
                $(container).append($item);
            });
            $(container).append('<li class="divider"></li>');
            var $item = $('<li class="add-panel defaultnav"><a>+ Add Dashboard</a></li>');
            $item.off('click');
            $item.on('click', function (e) {
                var matchedContainers = $('.jarvis.container.realtime');
                //new jarvis.dashboard.visualisation.Panel().showEdit({container:matchedContainers, addNew:true, _this:new jarvis.dashboard.visualisation.Panel()});
                jarvis.getDashboard().showEdit({container: matchedContainers, addNew: true, _this: jarvis.getDashboard()});
            });
            $(container).append($item);

            $('.subnav').show();
        }
        //else
        //    $panellist.hide();
    });
}

function buildContentMenu_Reports() {
    jarvis.objects.Reports.List(this, null, function (sender, data) {
        var $panellist = $('body').find('.report-list');
        $panellist.empty();
        if ($panellist.length > 0) {
            var container = $panellist;
            $(container).empty();
            //console.log(jarvis.dataaccess.reports);
            var categories = _.groupBy(data, function (obj) {
                if (!obj.Category)
                    return '(not set)';
                return obj.Category.Name;
            });
            //console.log(categories);

            categories = _.sortBy(categories, function (obj) {
                if (!obj[0].Category)
                    return -1;
                return obj[0].Category.Ordinal;
            });

            _.each(categories, function (category, i) {
                //console.log(category[0]);
                var categoryname = '';
                if (!category[0].Category) {
                    categoryname = '(not set)';
                }
                else {
                    categoryname = category[0].Category.Name;
                }
                if (categoryname != '(not set)') {

                    var $item = $('<li class="divider"></li><li class="defaultnav disabled"><a data-id="' + categoryname + '">' + categoryname + '</a></li>');
                    $(container).append($item);
                }
                $(category).each(function (index, item) {
                    var $item = $('<li class="defaultnav"><a data-id="' + item.ID + '">' + item.Name + '</a></li>');
                    $item.off('click');

                    //console.log('register click on ' + item.ID);

                    $item.on('click', function (e) {
                        $(jarvis).trigger('reportchange', item.ID);
                    });
                    $(container).append($item);
                });
            })
            $(container).append('<li class="divider"></li>');
            var $item = $('<li class="add-report defaultnav"><a>+ Add Report</a></li>');
            $item.off('click');
            $item.on('click', function (e) {
                //var matchedContainers = $('.jarvis.container.report');
                //$(jarvis).trigger('reportchange', $(this).attr('data-id'));
                //console.log('test');
                $(jarvis).trigger('reportchange', -1);
                var matchedContainers = $('.jarvis.report.panel');
                var o = new jarvis.visualisation.report.Editor();
                o.init(o, {container: matchedContainers, reportID: -1});

                //jarvis.visualisation.setDisplay('report');
            });
            $(container).append($item);

            $('.subnav').show();
        }
    });
}


//Textbox handling
$().ready(function () {
    //console.log('test')
    $('form.required').submit(function (e) {
        //console.log('submit');
        if (!validateForm($(this))) {
            console.log('form validation failed');
            return false;
        }
    });

    $('form.largerform input, form.managed input, form.largerform textarea').each(function (index, item) {
        if ($(this).attr('type') != 'hidden') {
            $(this).on('change', function (e) {
                console.log('change', this);
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
                console.log($(this))
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
        console.log('email wrong');
    }
    else {
        //alert("Woohoo!  The email address is in the correct format and they are the same.");
        console.log('email ok');
        status = true;
    }
    return status;
}

function validateForm(frm) {
    var validated = true;
    var $frm = $(frm);

    $frm.find('input.required, select.required, textarea.required').each(function (index, item) {
        //console.log($(this), $(this).val());
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
            $(jarvis).trigger('dashboardchange', parseInt(-1));
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
    jarvis.objects.Dashboards.List(null, null, function () {
        var $dashboards = $('.nav-dashboards');
        $dashboards.empty();
        $(jarvis.objects.Dashboards).each(function (index, dashboard) {
            //console.log(dashboard);
            var $li = $('<li class="subtopicheader subtopicheader_wrapper"></li>');
            var $a = $('<a class="topiclink" title="' + dashboard.Name + '" data-id="' + dashboard.ID + '"></a>');
            var $caption = $('<div class="subtopiccaption">' + dashboard.Name + '</div>');
            $a.append($caption);
            $li.append($a);
            $li.on('click', function (e) {
                $(jarvis).trigger('dashboardchange', dashboard.ID);
            });
            $dashboards.append($li);
        });

        var $li = $('<li class="subtopicheader subtopicheader_wrapper"></li>');
        var $a = $('<a class="topiclink" title="addnew"></a>');
        var $caption = $('<div class="subtopiccaption">+ Add new dashboard</div>');
        $a.append($caption);
        $li.append($a);

        $li.off('click');
        $li.on('click', function (e) {
            var matchedContainers = $('.jarvis.container.realtime');
            //new jarvis.dashboard.visualisation.Panel().showEdit({container:matchedContainers, addNew:true, _this:new jarvis.dashboard.visualisation.Panel()});
            jarvis.getDashboard().showEdit({container: matchedContainers, addNew: true, _this: jarvis.getDashboard()});
        });

        $dashboards.append($li);
    });

    jarvis.objects.RealtimePanels.List(null, null, function () {
        var $panels = $('.nav-panels');
        $panels.empty();
        $(jarvis.objects.RealtimePanels).each(function (index, panel) {
            //console.log(dashboard);
            var $li = $('<li class="subtopicheader subtopicheader_wrapper"></li>');
            var $a = $('<a class="topiclink" title="' + panel.Name + '"></a>');
            var $caption = $('<div class="subtopiccaption">' + panel.Name + '</div>');
            $a.append($caption);
            $li.append($a);
            $li.off('click');
            $li.on('click', function (e) {
                $(jarvis).trigger('realtimepanelchange', panel.ID);
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
            var matchedContainers = $('.jarvis.container.realtime');
            //sender._this.showEdit({container:matchedContainers, addNew:true, _this:sender._this});
            $('#modal-notimplemented').modal('show');
            //jarvis.getRealtimePanel().showEdit({container:matchedContainers, addNew:true, _this:jarvis.getRealtimePanel()});
        });

        $panels.append($li);
    });

    jarvis.objects.Reports.List(null, null, function (sender, data) {
        var $reports = $('.nav-reports');
        $reports.empty();

        var categories = _.groupBy(data, function (obj) {
            if (!obj.Category)
                return '(not set)';
            return obj.Category.Name;
        });
        //console.log(categories);

        categories = _.sortBy(categories, function (obj) {
            if (!obj[0].Category)
                return -1;
            return obj[0].Category.Ordinal;
        });

        _.each(categories, function (category, i) {
            //console.log(category[0]);
            var categoryname = '';
            if (!category[0].Category) {
                categoryname = '(not set)';
            }
            else {
                categoryname = category[0].Category.Name;
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
                    var $a = $('<a class="topiclink" title="' + report.Name + '" data-id="' + report.ID + '"></a>');
                    var $caption = $('<div class="subtopiccaption">' + report.Name + '</div>');
                    $a.append($caption);
                    $li.append($a);

                    $li.on('click', function (e) {
                        $(jarvis).trigger('reportchange', report.ID);
                    });

                    $ul.append($li);
                });

                $li.append($ul);
            }
            else {
                $(category).each(function (index, report) {
                    var $li = $('<li class="subtopicheader subtopicheader_wrapper"></li>');
                    var $a = $('<a class="topiclink" title="' + report.Name + '" data-id="' + report.ID + '"></a>');
                    var $caption = $('<div class="subtopiccaption">' + report.Name + '</div>');
                    $a.append($caption);
                    $li.append($a);

                    $li.on('click', function (e) {
                        $(jarvis).trigger('reportchange', report.ID);
                    });

                    $container.append($li);
                });
            }

        });
        var $li = $('<li class="subtopicheader subtopicheader_wrapper"></li>');
        var $a = $('<a class="topiclink" title="addnew"></a>');
        var $caption = $('<div class="subtopiccaption">+ Add new report</div>');
        $a.append($caption);
        $li.append($a);

        $li.off('click');
        $li.on('click', function (e) {
            $(jarvis).trigger('reportchange', -1);
            var matchedContainers = $('.jarvis.report.panel');
            var o = new jarvis.visualisation.report.Editor();
            o.init(o, {container: matchedContainers, reportID: -1});
        });
        $reports.append($li);

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

        //console.log($container);
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
        $(jarvis).trigger('wrapper_resize');
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

$(window).bind('jarvis-loaded', function () {

    $(jarvis).bind('setreport', function (e, reportID) {
        collapseAll();
        //console.log('repo', reportID);
        $('.topiclink').removeClass('active');

        var $thetopic = $('.topiclink[data-id="' + reportID + '"]');
        if ($thetopic.length == 0) {
            setTimeout(function () {
                //console.log('d')
                $thetopic = $('.topiclink[data-id="' + reportID + '"]');
                $thetopic.addClass('active');
                $thetopic.parentsUntil('div.topic').parent().addClass('active');
            }, 2500);
        }
        else {
            $thetopic.addClass('active');
            $thetopic.parentsUntil('div.topic').parent().addClass('active');
        }

        jarvis.objects.Reports.Get(null, {id: reportID}, function (sender, data) {
            pushRecent({type: 'report', id: data.ID, data: data});
        });
    });

    $(jarvis).bind('setdashboard', function (e, dashboardID) {
        //console.log('dash', dashboardID);
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

        jarvis.objects.Dashboards.Get(null, {id: dashboardID}, function (sender, data) {
            pushRecent({type: 'dashboard', id: data.ID, data: data});
        });

    });
})


$('.helpblock .reporthelp .jarvis.caption').bind('contentchange', function () {
    var $helpblock = $($('.helpblock .resources')[0]);
    $helpblock.empty();
    var resources = [];
    if (jarvis.state.view == 'dashboard') {
        $(this).text('The ' + $(this).text() + ' dashboard');
        resources.push({title: 'About dashboards', url: 'http://'});
        resources.push({title: 'Create/edit/delete dashboards', url: 'http://'});
        resources.push({title: 'Add widgets to your dashboard', url: 'http://'});
    }
    else if (jarvis.state.view == 'report') {
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
        if (orecent.type == item.type && orecent.data.ID == item.data.ID)
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
                var $item = $('<div class="recentitem"><span class="topic">Dashboards</span><span class="seperator">›</span><span class="subtopic">' + item.data.Name + '</span></div>');

                $item.on('click', function (e) {
                    $(jarvis).trigger('dashboardchange', item.data.ID);
                    $('.leftnav .popup_wrapper').hide();
                });

                $('.leftnav .recent_wrapper').append($item);
            }
            else if (item.type == 'report') {
                var category = item.data.Category.Name;
                if (category == '(not set)')
                    category = '';
                if (category == '')
                    var $item = $('<div class="recentitem"><span class="topic">Reports</span><span class="seperator">›</span><span class="subtopic">' + item.data.Name + '</span></div>');
                else
                    var $item = $('<div class="recentitem"><span class="topic">Reports</span><span class="seperator">›</span><span class="topic">' + category + '</span><span class="seperator">›</span><span class="subtopic">' + item.data.Name + '</span></div>');
                $item.on('click', function (e) {
                    $(jarvis).trigger('reportchange', item.data.ID);
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
        console.log('search', term);
        if ((term == '' || term.length < 1 ) && e.which != 13) {
            $('.searchresultitem').remove();
        }
        else {
            $('.searchresultitem').remove();

            $(jarvis.objects.Dashboards).each(function (item, dashboard) {
                if (dashboard.Name.toLowerCase().indexOf(term.toLowerCase()) > -1) {

                    var reg = new RegExp(term, 'gi');
                    var final_dashboard_name = dashboard.Name.replace(reg, function (str) {
                        return '<b>' + str + '</b>'
                    });

                    var $item = $('<div class="searchresultitem"><span class="topic">Dashboards</span><span class="seperator">›</span><span class="subtopic">' + final_dashboard_name + '</span></div>');
                    $item.on('click', function (e) {
                        $(jarvis).trigger('dashboardchange', dashboard.ID);
                        $('.leftnav .results_wrapper').hide();
                    });

                    $('.leftnav .results_wrapper').append($item);
                }
            });

            $(jarvis.objects.Reports).each(function (item, report) {
                if (report.Name.toLowerCase().indexOf(term.toLowerCase()) > -1) {
                    var category = report.Category.Name;
                    if (category == '(not set)')
                        category = '';

                    var reg = new RegExp(term, 'gi');
                    var final_report_name = report.Name.replace(reg, function (str) {
                        return '<b>' + str + '</b>'
                    });

                    if (category == '')
                        var $item = $('<div class="searchresultitem"><span class="topic">Reports</span><span class="seperator">›</span><span class="subtopic">' + final_report_name + '</span></div>');
                    else
                        var $item = $('<div class="searchresultitem"><span class="topic">Reports</span><span class="seperator">›</span><span class="topic">' + category + '</span><span class="seperator">›</span><span class="subtopic">' + final_report_name + '</span></div>');
                    $item.on('click', function (e) {
                        $(jarvis).trigger('reportchange', report.ID);
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