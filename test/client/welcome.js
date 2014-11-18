var nightmare = require('./nightmare');

describe.skip('Client > Welcome Screen', function() {
  before(nightmare.ready);

  describe('Toggle Answers', function() {
    it('should be able to turn on all answers', function(done) {
      nightmare('/welcome')
        .screenshot('screenshot.png')
        .run(function(err, res) {
          if (err) console.error(err.stack);
          done(err);
        });
    });
  });
});
