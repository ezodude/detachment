'use strict';

const _           = require('lodash')
    ,  h          = require('highland');

module.exports = Detachment;

function Detachment (mailbox, opts) {
  if (!(this instanceof Detachment)) return new Detachment(mailbox, opts);
  if (!opts) opts = {};

  console.log('Detachment MAILBOX', mailbox);
  console.log('Detachment OPTS', opts);
}

Detachment.prototype.pull = function (opts, cb) {
  console.log('Detachment#pull OPTS', opts);
  cb(null, ['attachment-a', 'attachment-b']);
  return h();
};