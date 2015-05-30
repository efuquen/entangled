'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
var config = require('config');
var toml = require('toml');
var express = require('express');
var _ = require('lodash');
var render = require('mithril-node-render');
var util = require('util');
var readFile = require('fs-readfile-promise');
var bodyParser = require('body-parser');

var EventEmitter = require('events').EventEmitter;

require('toml-require').install();

var init = function init(opts) {
  initConfig(opts);

  var Entangled = (function () {
    function Entangled() {
      _classCallCheck(this, Entangled);

      this.cfg = config.get('entangled');
      this.app = initExpress(this.cfg.express, opts);
    }

    _createClass(Entangled, [{
      key: 'start',
      value: function start(cb) {
        var hasPort = this.cfg.express && this.cfg.express.port;
        var port = hasPort ? this.cfg.express.port : 3000;
        return this.app.listen(port, cb);
      }
    }]);

    return Entangled;
  })();

  return new Entangled();
};

function initConfig(opts) {
  var defaultCfgs = require('../config/default.toml').entangled;
  config.util.extendDeep(defaultCfgs, opts);
  config.util.setModuleDefaults('entangled', defaultCfgs);
}

function initExpress(cfg, opts) {
  var app = express();

  //setup compression
  if (cfg.compression && cfg.compression.enable) {
    var options = cfg.compression.options || {};
    app.use(require('compression')(options));
  }

  //setup static directories
  if (cfg['static'] && cfg['static'].dirs) {
    (function () {
      var globalOptions = cfg['static'].options;
      cfg['static'].dirs.forEach(function (dir, index) {
        var indexOptions = cfg['static'][index] && cfg['static'][index].options || {};
        var options = _.merge({}, globalOptions, indexOptions);
        app.use(express['static'](dir, options));
      });
    })();
  }

  if (cfg.body) {
    console.log('body parser');
    if (cfg.body.json && !cfg.body.json.disable) {
      console.log('enable json parser');
      app.use(bodyParser.json());
    }

    if (cfg.body.form && !cfg.body.form.disable) {
      app.use(bodyParser.urlencoded());
    }
  }

  return app;
}

module.exports = init;
//# sourceMappingURL=entangled.js.map