var cleardb = require('./cleardb');
var user = require('./default-admin');
var commuter = require('./default-commuter');
var org = require('./default-organization');
var request = require('./supertest');

var base = '/api/commuters';

describe(base, function() {
  before(user.login);
  before(org.create);

  describe('GET /', function() {
    it('401 if not logged in', function(done) {
      request
        .get(base)
        .expect(401, done);
    });

    it('200 with list of all commuters', function(done) {
      user.agent
        .get(base)
        .expect(200, done);
    });
  });

  describe('POST /', function() {
    it('401 if not logged in', function(done) {
      request
        .post(base)
        .expect(401, done);
    });

    it('400 if invalid data', function(done) {
      user.agent
        .post(base)
        .send({})
        .expect(400, done);
    });

    it('201 if correct data', function(done) {
      commuter.info._organization = org.info._id;
      user.agent
        .post(base)
        .send(commuter.info)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          commuter.info = res.body;
          done();
        });
    });
  });

  describe('PUT /:id', function() {
    it('401 if not logged in', function(done) {
      request
        .put(base + '/' + commuter.info._id)
        .expect(401, done);
    });

    it('404 if id does not exist', function(done) {
      user.agent
        .put(base + '/52e7ecb9e023120000c33697')
        .expect(404, done);
    });

    it('200 if updated correctly', function(done) {
      user.agent
        .put(base + '/' + commuter.info._id)
        .send(commuter.info)
        .expect(200, done);
    });

    it('200 update address if coordinates change', function(done) {
      commuter.info.coordinate = {
        lng: -77.06398626875051,
        lat: 38.86583312290139
      };
      user.agent
        .put(base + '/' + commuter.info._id)
        .send(commuter.info)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.address.should.equal('1111 Army Navy Dr');
          done();
        });
    });
  });

  describe('POST /:id/send-plan', function() {
    it('401 if not logged in', function(done) {
      request
        .post(base + '/' + commuter.info._id + '/send-plan')
        .expect(401, done);
    });

    it('404 if id does not exist', function(done) {
      user.agent
        .post(base + '/52e7ecb9e023120000c33697/send-plan')
        .expect(404, done);
    });

    it('201 if sent correctly and return email object', function(done) {
      user.agent
        .post(base + '/' + commuter.info._id + '/send-plan')
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          res.body._commuter.should.eql(commuter.info._id);
          done();
        });
    });
  });

  describe('POST /:id/add-email', function() {
    var agent = request.agent();
    var anon = null;

    before(function(done) {
      agent
        .get('/api/login-anonymously')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          anon = res.body;
          done();
        });
    });

    it('400 if user already exists', function(done) {
      user.agent
        .post(base + '/' + commuter.info._id + '/add-email')
        .expect(401, done);
    });

    it('400 if email already exists', function(done) {
      agent
        .post(base + '/' + anon._id + '/add-email')
        .send({
          email: user.info.email
        })
        .expect(400, done);
    });

    it('200 and make the user no longer anonymous', function(done) {
      agent
        .post(base + '/' + anon._id + '/add-email')
        .send({
          email: 'newemai@anon.com'
        })
        .expect(204, done);
    });
  });

  describe('POST /:id/carpool-sign-up', function() {
    var agent = request.agent();
    var anon = null;

    before(function(done) {
      agent
        .get('/api/login-anonymously')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          anon = res.body;
          done();
        });
    });

    it('400 if email exists for another user', function(done) {
      agent
        .post(base + '/' + anon._id + '/carpool-sign-up')
        .send({
          email: user.info.email,
          name: {
            first: 'User',
            last: 'Name'
          }
        })
        .expect(400, done);
    });

    it('400 if email or name is not passed', function(done) {
      agent
        .post(base + '/' + anon._id + '/carpool-sign-up')
        .send({
          name: {
            first: 'User',
            last: 'Name'
          }
        })
        .expect(400, done);
    });

    it('204 if appropriate values are sent', function(done) {
      agent
        .post(base + '/' + anon._id + '/carpool-sign-up')
        .send({
          email: 'anonemail3@gmail.com',
          name: {
            first: 'User',
            last: 'Name'
          }
        })
        .expect(204, done);
    });
  });

  describe('DELETE /:id', function() {
    it('401 if not logged in', function(done) {
      request
        .del(base + '/' + commuter.info._id)
        .expect(401, done);
    });

    it('404 if id does not exist', function(done) {
      user.agent
        .del(base + '/52e7ecb9e023120000c33697')
        .expect(404, done);
    });

    it('204 if deleted correctly', function(done) {
      user.agent
        .del(base + '/' + commuter.info._id)
        .expect(204, done);
    });
  });
});
