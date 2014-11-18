var utils = require('..');

utils.log('user', 'seems like %s is a real %s', 'wryk', 'person');
utils.warn('addiction', 'take care about loving %s', 'component');
utils.error('simple %s stuff', 'useless');
utils.fatal(new Error('error message from error.message without stack :O'));