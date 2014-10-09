var nightmare = require('./nightmare');

describe.skip('Client > Welcome Screen', function() {
  before(nightmare.ready);

  describe('Toggle Answers', function() {
    var client = nightmare('/index.html');

    it('should be able to turn on all answers', function(done) {
      client
        .run(done);
    });
  });
});
