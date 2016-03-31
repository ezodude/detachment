'use strict';

const _           = require('lodash')
    ,  h          = require('highland')
    , ContextIO   = require('contextio');

let ctxioClient;

module.exports = Detachment;

// CONTEXTIO API
// METHOD /RESOURCE/INSTANCE_ID/SUB_RESOURCE?PARAMS
// ctxioClient.RESOURCE(INSTANCE_ID).SUB_RESOURCE().METHOD(PARAMS).then(success_handler)

const timestamp = (isoDate) => Math.floor(Date.parse(isoDate) / 1000);

const getAccountId = (mailbox, cb) => {
  // /2.0/accounts?email=someemail%40email.com&limit=1
  ctxioClient.accounts().get({ email: mailbox, limit: 1 }).then(data => cb(null, data[0].id));
};

const getAttachments = (accountId, opts, cb) => {
  // /2.0/accounts/id/files?date_after=timestamp&file_name=filename&limit=100
  ctxioClient.accounts(accountId)
  .files()
  .get({ file_name: opts.filename, date_after: opts.dateAfter && timestamp(opts.dateAfter), limit: 100 })
  .then(data => cb(null, data));
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

Detachment.prototype.getAccountId = function () {
  this.accountId = h.wrapCallback(getAccountId)(this.mailbox);
  return this;
};

Detachment.prototype.getAttachments = function () {
  this.attachments = h.partial(h.wrapCallback(getAttachments));
  return this;
};

Detachment.prototype.prep = function () {
  this.getAccountId();
  this.getAttachments();
  return this;
};

Detachment.prototype.pull = function (opts, cb) {
  console.log('Detachment#pull OPTS', opts);
  this.prep();

  this.accountId
  .flatMap(accountId => this.attachments(accountId, opts))
  .each(data => cb(null, data));

  return this;
};