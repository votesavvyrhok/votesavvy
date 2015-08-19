module.exports = function (app) {
    app.get('/', function (req, res) {
       console.log("receive a get request" + JSON.stringify(req.headers));
       console.log("the memory: before " + JSON.stringify(process.memoryUsage()));

       res.render('app/index.html', {screen_name: null});

        console.log("the memory: after " + JSON.stringify(process.memoryUsage()));
    });
};