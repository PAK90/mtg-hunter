var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  proxy: {
    //'/src/script/magicvector.py': {
      '/py/comparecards' : {
      target: 'https://www.google.ie',
      secure: false,
      bypass: function(req, res, proxyOptions) {
        var spawn = require('child_process').spawnSync;
        var process = spawn('cmd.exe', ['/c', 'py\\comparecards.bat', req.query.card1, req.query.card2, req.query.slider]);
        return '/py/results.txt';
        /*var spawn = require('child_process').spawn;
        var process = spawn('py', ['/src/script/magicvector.py', "copper myr", "dread warlock"]);
        process.stdout.on('data', function(data) {
          return data;
        });*/
      }
    }
  }
}).listen(3333, 'localhost', function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at localhost:3333');
});
