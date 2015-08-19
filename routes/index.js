module.exports = function (app) {
    app.get('/', function (req, res) {

       app.locals.logger.info("receive a get request" + JSON.stringify(req.headers));
       app.locals.logger.info("the memory: before " + JSON.stringify(process.memoryUsage()));

       res.render('app/index.html', {screen_name: null});

    });
};