'use strict';

const ContextIO = require('contextio');

// CONTEXTIO API
// METHOD /RESOURCE/INSTANCE_ID/SUB_RESOURCE?PARAMS
// ctxioClient.RESOURCE(INSTANCE_ID).SUB_RESOURCE().METHOD(PARAMS).then(success_handler)

const timestamp = (isoDate) => Math.floor(Date.parse(isoDate) / 1000);

function ApiWrapper(config){
  if (!(this instanceof ApiWrapper)) return new ApiWrapper(config);
  if (!config) config = {};
  this.ctxioClient = ContextIO({
    key: config.key,
    secret: config.secret,
    version: config.version
  });
};

module.exports = ApiWrapper;

ApiWrapper.prototype.getAccountId = function (mailbox, cb){
  // /2.0/accounts?email=someemail%40email.com&limit=1
  this.ctxioClient.accounts()
  .get({ email: mailbox, limit: 1 })
  .then(data => cb(null, data[0].id));
};

ApiWrapper.prototype.syncAccount = function (accountId, cb){
  // /2.0/accounts/id/sync
  this.ctxioClient.accounts(id).sync().post().then(data => {
    process.nextTick(() => cb(null, data));
  });
};

ApiWrapper.prototype.getAttachments = function (accountId, opts, cb){
  // /2.0/accounts/id/files?date_after=timestamp&file_name=filename&limit=100
  this.ctxioClient.accounts(accountId)
  .files()
  .get({ file_name: opts.filename, date_after: opts.dateAfter && timestamp(opts.dateAfter), limit: 100 })
  .then(data => cb(null, data));
};

ApiWrapper.prototype.getAttachmentContent = function (accountId, fileId, cb){
  // /2.0/accounts/id/files/file_id/content?as_link=1
  this.ctxioClient.accounts(accountId)
  .files(fileId)
  .content()
  .get({ as_link: 1 })
  .then(data => cb(null, data));
};