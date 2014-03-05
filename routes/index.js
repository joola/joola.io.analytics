
/*
 * GET home page.
 */

exports.index = function(req, res){
  if (!req.session.jtoken)
    res.redirect('/login');
  
  res.render('index', { jtoken: req.session.jtoken, displayName: req.session.displayName });
};