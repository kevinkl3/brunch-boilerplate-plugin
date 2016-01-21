'use strict';
var fs = require('fs');

function ClearCachePlugin(config) {
  this.config = config && config.plugins && config.plugins.cacheclear;
}

// Required for all Brunch plugins.
ClearCachePlugin.prototype.brunchPlugin = true;

ClearCachePlugin.prototype.onCompile = function(params, callback){
  
  if(this.config && this.config.main){
    var data = fs.readFileSync(this.config.main).toString().split("\n");
    var injectedFunction = function(){
      cache = {};
      if(require._cache){
        Object.keys(require._cache).forEach(function(k){
          require._cache[ k ] = null;
        });
        delete require._cache;
        require._cache = cache;
      }
    };

    var injectedCode = "\trequire.clear = " + injectedFunction.toString() + ";";

    var i = 0;
    var line;
    var lineNumber = -1;
    for(;i < data.length; i++){
      line = data[i];
      if(line.indexOf('require.brunch') >= 0){
        lineNumber = i + 1;
        break;
      }
    }

    if(lineNumber == -1)return;

    data.splice(lineNumber, 0,  injectedCode );
    var text = data.join("\n");

    fs.writeFile(this.config.main, text, function (err) {
      if (err) return console.log(err);
    });
  }

}

module.exports = ClearCachePlugin;
