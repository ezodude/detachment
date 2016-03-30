'use strict';

const _           = require('lodash')
    ,  h          = require('highland')
    , ContextIO   = require('contextio');

let ctxioClient;

module.exports = Detachment;

// CONTEXTIO API
// METHOD /RESOURCE/INSTANCE_ID/SUB_RESOURCE?PARAMS
// ctxioClient.RESOURCE(INSTANCE_ID).SUB_RESOURCE().METHOD(PARAMS).then(success_handler)

function Detachment (mailbox, opts) {
  if (!(this instanceof Detachment)) return new Detachment(mailbox, opts);
  if (!opts) opts = {};

  console.log('Detachment MAILBOX', mailbox);
  console.log('Detachment OPTS', opts);

  this.mailbox = mailbox;
  ctxioClient = ContextIO({
    key: opts.key,
    secret: opts.secret,
    version: opts.version
  });
}

Detachment.prototype.sync = function () {
  // /2.0/accounts?email=report1%40buffaloproject.com&limit=1
  const wrapper = (cb) => {
    ctxioClient.accounts().get({ email: this.mailbox, limit: 1 }).then(data => cb(null, data[0].id));
  };

  this.accountId = h.wrapCallback(wrapper)();
  return this;
};

Detachment.prototype.pull = function (opts, cb) {
  console.log('Detachment#pull OPTS', opts);
  this.accountId.each(data => cb(null, data));
  // cb(null, ['attachment-a', 'attachment-b']);
  return h();
};