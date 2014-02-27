
/*
 * GET home page.
 */

exports.index = function(req, res){
  if (!req.session.jtoken)
    res.redirect('/login');
  
  res.render('index', { title: 'Express', jtoken: req.session.jtoken });
};