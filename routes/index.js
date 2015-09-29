module.exports = function (app) {

    var logger= app.locals.log4js.getLogger('index');

    app.get('/', function (req, res) {

       logger.info("receive a get request" + JSON.stringify(req.headers));
       logger.info("the memory: before " + JSON.stringify(process.memoryUsage()));

       if (!req.session || !req.session.session_token)
           res.render('app/index.html', {screen_name: null});
       else
           res.render('app/index.html', {screen_name: req.session.screen_name});

    });
};