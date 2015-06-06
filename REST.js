/**
 * Created by a on 6/6/2015.
 */

function REST_ROUTER(router,connection) {
    var self = this;
    self.handleRoutes(router,connection);
}

REST_ROUTER.prototype.handleRoutes= function(router,connection) {
    router.get("/",function(req,res){
        res.json({"Message" : "Hello World !"});
    })
}

module.exports = REST_ROUTER;