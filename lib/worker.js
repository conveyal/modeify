var log = require('./log');

/**
 * If no callback is passed then this is a one & done
 */

function exit(err) {
  if (err) {
    log.error(err);
    process.exit(1);
  } else {
    log.info('completed');
    process.exit(0);
  }
}

/**
 * Expose `run`
 */

module.exports.run = function(program, done) {
  done = done || exit;
  program(function(err, batch) {
    if (err) {
      done(err);
    } else {
      log.info('processing ' + batch.fns.length);

      batch.on('progress', function(e) {
        log.info(e.complete + ' / ' + e.total);
      });

      batch.end(done);
    }
  });
};
