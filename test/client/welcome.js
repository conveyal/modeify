var nightmare = require('./nightmare');

describe.skip('Client > Welcome Screen', function() {
  before(nightmare.ready);

  describe('Toggle Answers', function() {
    it('should be able to turn on all answers', function(done) {
      nightmare('/welcome')
        .screenshot('screenshot.png')
        .run(function(err, res) {
          console.log(err, res);
          done(err);
        });
    });
  });
});
