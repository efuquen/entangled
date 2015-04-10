process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
const config  = require('config');
const toml    = require('toml');
const express = require('express');
const _       = require('lodash');
const render  = require('mithril-node-render');
const util    = require('util');
const readFile = require('fs-readfile-promise');

const EventEmitter = require('events').EventEmitter;

require('toml-require').install();

var init = function(opts) {
  initConfig(opts);

  class Entangle {
    constructor() {
      this.cfg = config.get('entangle');
      this.app = initExpress(this.cfg.express, opts);
    }

    start(cb) {
      const hasPort = this.cfg.express && this.cfg.express.port;
      const port = hasPort ? this.cfg.express.port : 3000;
      return this.app.listen(port, cb);
    }
  }

  return new Entangle();
}

function initConfig(opts) {
  const defaultCfgs = require('../config/default.toml').entangle;
  config.util.extendDeep(defaultCfgs, opts);
  config.util.setModuleDefaults('entangle', defaultCfgs);
}

function initExpress(cfg, opts) {
  const app = express();

  //setup compression
  if (cfg.compression && cfg.compression.enable) {
    const options = cfg.compression.options || {};
    app.use((require('compression'))(options));
  }

  //setup static directories
  if (cfg.static && cfg.static.dirs) {
    const globalOptions = cfg.static.options;
    cfg.static.dirs.forEach((dir, index) => {
      const indexOptions = cfg.static[index] && cfg.static[index].options || {};
      const options = _.merge({}, globalOptions, indexOptions);
      app.use(express.static(dir, options));
    });
  }

  return app;
}

module.exports = init;
