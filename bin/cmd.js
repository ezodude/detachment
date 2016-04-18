#! /usr/bin/env node

'use strict';

// dtch -k some-key -s some-secret -d '2016-03-01' -f 'Daily_Report*' -o 'attachments_2016-03-30' 'user@email-address.com'

const program     = require('commander')
    , mkdirp      = require('mkdirp')
    , detachment  = require('../');

program
.usage('[options] <mailbox>')
.arguments('<mailbox>')
.option('-k, --key <context.io key>', 'Your context.io oauth consumer key.')
.option('-s, --secret <context.io secret>', 'Your context.io oauth consumer secret.')
.option('-d, --date-after <ISO timestamp>', 'Only include files attached to messages sent after a given timestamp.')
.option('-o, --out <directory-path>', 'Optional output directory (defaults to \'dump\').')
.option('-f, --filename <attachment-filename>', 'Optional, can include shell wildcards such as *, ? and [].')
.action(function(mailbox) {
  const opts = {
    key: program.key,
    secret: program.secret,
    version: '2.0'
  };
  const pullOpts = { dateAfter: program.dateAfter, outputDirectory: program.out || 'dump',  filename: program.filename };

  mkdirp.sync(pullOpts.outputDirectory);

  try{
    const det = detachment(mailbox, opts);
    det.sync();
    det.pull(pullOpts, (err, data) => console.log(data));
  }catch(e){
    console.log(e);
  }

})
.parse(process.argv);