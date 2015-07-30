
// parse BlueMix  configuration from environment variables, if present
var services = process.env.VCAP_SERVICES,
 request = require('request'),
 debug = require('debug')('datacache'),
 credentials = null;
 
// load BlueMix credentials from session
if(typeof services != 'undefined') {
  services = JSON.parse(services);
  credentials = services['DataCache-1.0'][0].credentials;
} 

// formulate the options object to be passed to request
var getOptions = function(method, key, value) {
  var options = {
    uri: credentials.restResource + "/" + credentials.gridName + ".LUT.O/" + encodeURIComponent(key),
    method: method,
    auth: {
      user: credentials.username,
      pass: credentials.password
    },
    json: (typeof value == 'object')?value:true
  };
  debug(method, options);
  return options;
}

// put a new key/value pair in cache. 'value' is a JS object
var put = function(key, value, callback) {
  if (credentials == null) {
    return callback(true,null);
  }
  request(getOptions('POST', key, value), function(err, req, body) {
    callback(err, body);
  });
};

var get = function(key, callback) {
  if (credentials == null) {
    return callback(true,null);
  }
  request(getOptions('GET', key), function(err, req, body) {
    try {
      //var retval = JSON.parse(body);
      var retval;

      if (typeof body == 'object')
           retval=body;
      else
           throw "error";

      callback(err, retval);
    } catch(e) {
      console.log("Parse exception", body);
      callback(true, null);
    }
  });
};

var remove = function(key, callback) {
  if (credentials == null) {
    return callback(true,null);
  }
  request(getOptions('DELETE', key), function(err, req, body) {
    callback(err, body);
  });
};

/*put("test",{a:1,b:"bob",c:true}, function(err,data) {
  console.log("POST",err,data);
  get("test", function(err, data) {
    console.log("GET",err,data);
    remove("test", function(err, data) {
      console.log("REMOVE",err,data);
    })
  })
});
*/

module.exports =  {
  get: get,
  put: put,
  remove: remove
};


