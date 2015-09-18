/**
 * Created by a on 9/18/2015.
 */

module.exports=function(app){

    app.get('/dashboard', function(req,res){
       res.render('../dashboardtmp.html');
    });


}
