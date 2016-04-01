'use strict';

const fs          = require('fs')
    , _           = require('lodash')
    ,  h          = require('highland')
    , ContextIO   = require('contextio')
    , request     = require('superagent');

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

const getAttachmentContent = (accountId, fileId, cb) => {
  // /2.0/accounts/id/files?date_after=timestamp&file_name=filename&limit=100
  ctxioClient.accounts(accountId)
  .files(fileId)
  .content()
  .get({ as_link: 1 })
  .then(data => cb(null, data));
};

function Detachment (mailbox, opts) {
  if (!(this instanceof Detachment)) return new Detachment(mailbox, opts);
  if (!opts) opts = {};

  this.mailbox = mailbox;
  ctxioClient = ContextIO({
    key: opts.key,
    secret: opts.secret,
    version: opts.version
  });
}

Detachment.prototype.pull = function (opts, cb) {
  const outputDirectory = opts.outputDirectory + '/'

  this._getAccountId(this.mailbox)
  .flatMap(accountId => this._getAttachments(accountId, opts))
  .flatten()
  .doto(attachment => {
    console.log('Attachment:', outputDirectory + attachment.file_name)
  })
  .flatMap(attachment => {
    const accountId = attachment.resource_url.split('/')[5];
    return this._getAttachmentContent(accountId, attachment.file_id);
  })
  .each(data => {
    const match = /^https\:\/\/.*\/.*\/.*\/.*\/(.*)\?.*$/i.exec(data);
    const outPath = outputDirectory + match[1];
    request.get(data).pipe(fs.createWriteStream(outPath));
  });

  return this;
};

Detachment.prototype._getAccountId = function (mailbox) {
  return h.wrapCallback(getAccountId)(mailbox);
};

Detachment.prototype._getAttachments = function (accountId, opts) {
  return h.wrapCallback(getAttachments)(accountId, opts);
};

Detachment.prototype._getAttachmentContent = function (accountId, fileId) {
  return h.wrapCallback(getAttachmentContent)(accountId, fileId);
};