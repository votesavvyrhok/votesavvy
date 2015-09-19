module.exports = function (app) {

    var logger = app.locals.log4js.getLogger('dashboard');

    app.get('/dashboard', function (req, res) {

        //        logger.info("receive a get request" + JSON.stringify(req.headers));
        //        logger.info("the memory: before " + JSON.stringify(process.memoryUsage()));

        res.render('app/dashboard.html', {
            screen_name: null
        });
    });
};