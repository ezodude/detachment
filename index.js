'use strict';

const _           = require('lodash')
    ,  h          = require('highland')
    , ContextIO   = require('contextio');

let ctxioClient;

module.exports = Detachment;

// CONTEXTIO API
// METHOD /RESOURCE/INSTANCE_ID/SUB_RESOURCE?PARAMS
// ctxioClient.RESOURCE(INSTANCE_ID).SUB_RESOURCE().METHOD(PARAMS).then(success_handler)

const getAccountId = (mailbox, cb) => {
  // /2.0/accounts?email=someemail%40email.com&limit=1
  ctxioClient.accounts().get({ email: mailbox, limit: 1 }).then(data => cb(null, data[0].id));
};

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
  this.accountId = h.wrapCallback(getAccountId)(this.mailbox);
  return this;
};

Detachment.prototype.pull = function (opts, cb) {
  console.log('Detachment#pull OPTS', opts);
  this.accountId.each(data => cb(null, data));
  return h();
};