var menuHTML = '<li class="subtopicheader subtopicheader_wrapper">' +
  '<a id="dashboard-overview" class="topiclink subtopiccaption" title="Overview">Overview</a>'
  '</li>';

$.get('/feeds/dashboards', function(data) {
  data.forEach(function(d) {
    $('#dashboardFeed').append('<li class="subtopicheader subtopicheader_wrapper"><a id="dashboard-overview" class="topiclink subtopiccaption" title="Overview">' + d.name + '</a></li>');
  })
});

$.get('/feeds/reports', function(data) {
  data.forEach(function(d) {
    $('#reportFeed').append('<li class="subtopicheader subtopicheader_wrapper"><a id="dashboard-overview" class="topiclink subtopiccaption" title="Overview">' + d.name + '</a></li>');
  })
});

$.get('/feeds/realtime', function(data) {
  data.forEach(function(d) {
    $('#realtimeFeed').append('<li class="subtopicheader subtopicheader_wrapper"><a id="dashboard-overview" class="topiclink subtopiccaption" title="Overview">' + d.name + '</a></li>');
  })
});


$('.topicheader').on('click', function () {
  $(this).parent().find('ul').slideToggle();
});
if (location.pathname == '/manage/dashboard/index') {
  $('.topic-dashboards').addClass('active');
  $('#dashboard-overview').addClass('active');
}
if (location.pathname == '/manage/dashboard/nodes') {
  $('.topic-dashboards').addClass('active');
  $('#nodes').addClass('active');
}
if (location.pathname == '/manage/dashboard/dispatch') {
  $('.topic-dashboards').addClass('active');
  $('#dispatch').addClass('active');
}

if (location.pathname == '/manage/users/index') {
  $('.topic-usermanagement').addClass('active');
  $('#users').addClass('active');
}
if (location.pathname == '/manage/users/roles') {
  $('.topic-usermanagement').addClass('active');
  $('#roles').addClass('active');
}
if (location.pathname == '/manage/users/organizations') {
  $('.topic-usermanagement').addClass('active');
  $('#orgs').addClass('active');
}

if (location.pathname == '/manage/settings/index') {
  $('.topic-settings').addClass('active');
}

if (location.pathname == '/manage/users/index') {
  usersOpen = true;
  users_users = true;
}
if (location.pathname == '/manage/users/roles') {
  usersOpen = true;
  users_roles = true;
}
if (location.pathname == '/manage/users/organizations') {
  usersOpen = true;
  users_orgs = true;
}