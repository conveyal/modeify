var nightmare = require('./nightmare');

describe.skip('Client > Welcome Screen', function() {
  describe('Toggle Answers', function() {
    var client = nightmare();

    it('should be able to turn on all answers', function(done) {
      client
        .screenshot('screenshot.png')
        .click('.welcome-page .answers .icon-train')
        .evaluate(function() {
          return document.querySelector('.welcome-page .answers .icon-train').classList;
        }, function(el) {
          console.log(el);
        })
        .run(done);
    });
  });
});
