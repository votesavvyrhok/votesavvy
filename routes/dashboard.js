module.exports = function (app) {

    var logger = app.locals.log4js.getLogger('dashboard');

    app.get('/dashboard', function (req, res, next) {

        //        logger.info("receive a get request" + JSON.stringify(req.headers));
        //        logger.info("the memory: before " + JSON.stringify(process.memoryUsage()));

        //add session management here:
        //currently the session id is the user's user_token
        //session id and user token will be separated eventually

        if (!req.session.session_token || !app.locals.admin || app.locals.admin.indexOf(req.session.screen_name) == -1)
        {
            var err = new Error('You are not allowed to access the dashboard');
            err.status = 403;
            return next(err);
        }
        else {
            logger.info("user " + req.session.session_token + " " + req.session.screen_name
                + " has accessed the dashboard");

            res.render('app/dashboard.html', {
                screen_name: req.session.screen_name
            });
        }
    });
};