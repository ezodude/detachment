'use strict';

const fs        = require('fs')
    , _         = require('lodash')
    , h         = require('highland')
    , contextio = require('./lib/api')
    , request   = require('superagent');

module.exports = Detachment;

const SIXTY_SECS_RATE_LIMIT = 1000 * 60;

function Detachment (mailbox, opts) {
  if (!(this instanceof Detachment)) return new Detachment(mailbox, opts);
  if (!opts) opts = {};
  this.mailbox = mailbox;
  this.contextio = contextio(opts);
}

Detachment.prototype.sync = function () {
  this.account =
    this._getAccountId(this.mailbox)
    .doto(id => this._syncAccount(id));
};

Detachment.prototype.pull = function (opts, cb) {
  if(!this.account) { throw 'Please sync account before pulling down attachments.'; }

  const outputDirectory = opts.outputDirectory + '/'

  this.account
  .flatMap(account => this._getAttachments(account, opts))
  .flatten()
  .ratelimit(10, SIXTY_SECS_RATE_LIMIT)
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
  return h.wrapCallback(this.contextio.getAccountId).bind(this.contextio)(mailbox);
};

Detachment.prototype._syncAccount = function (accountId) {
  return h.wrapCallback(this.contextio.syncAccount).bind(this.contextio)(accountId);
};

Detachment.prototype._getAttachments = function (accountId, opts) {
  return h.wrapCallback(this.contextio.getAttachments).bind(this.contextio)(accountId, opts);
};

Detachment.prototype._getAttachmentContent = function (accountId, fileId) {
  return h.wrapCallback(this.contextio.getAttachmentContent).bind(this.contextio)(accountId, fileId);
};