module.exports = function (app) {
    app.get('/', function (req, res) {

        var screen_name = req.session.screen_name;

        console.log("screen_name is " + screen_name);

        res.render('index.html', {screen_name:screen_name});

    });
};