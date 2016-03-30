#! /usr/bin/env node

'use strict';

// dtch -k some-key -s some-secret -d '2016-03-01' -f 'Daily_Report*' -o 2016-03-30'user@email-address.com'

const program     = require('commander')
    , detachment = require('../');

program
.usage('[options] <mailbox>')
.arguments('<mailbox>')
.option('-k, --key <context.io key>', 'Your context.io oauth consumer key.')
.option('-s, --secret <context.io secret>', 'Your context.io oauth consumer secret.')
.option('-d, --startdate', 'Startdate for downloading attachments.')
.option('-o, --out <directory-path>', 'Optional output directory (defaults to \'dump\').')
.option('-f, --filename', 'Optional attachment filename. Can include shell wildcards such as *, ? and [].')
.action(function(mailbox) {
  console.log('Hello mailbox');
})
.parse(process.argv);