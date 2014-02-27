/*
 * GET users listing.
 */

exports.reports = function (req, res) {
  var reports = [
    {
      id: 1,
      name: 'Report1',
      help: 'This is the help text of the report, it can include HTML'
    },
    {
      id: 2,
      name: 'Report2',
      help: 'This is the help text of the report, it can include HTML'
    }
  ];
  res.json(reports);
};

exports.dashboards = function (req, res) {
  var dashboards = [
    {
      id: 1,
      name: 'Dashboard1',
      help: 'This is the help text of the report, it can include HTML'
    },
    {
      id: 2,
      name: 'Dashboard2',
      help: 'This is the help text of the report, it can include HTML'
    }
  ];
  res.json(dashboards);
};

exports.realtime = function (req, res) {
  var realtime = [
    {
      id: 1,
      name: 'Realtime1',
      help: 'This is the help text of the report, it can include HTML'
    },
    {
      id: 2,
      name: 'Realtime2',
      help: 'This is the help text of the report, it can include HTML'
    }
  ];
  res.json(realtime);
};