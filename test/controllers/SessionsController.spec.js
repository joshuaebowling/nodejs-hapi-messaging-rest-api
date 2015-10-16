var expect = require('../test_helper').expect;

/* istanbul ignore next */
describe('sessions controller', function () {
    this.timeout(5000);

    var server, User;
    before(function (done) {
        var db = require(__main_root + 'db/DB.js');
        db.instance.sync().then(function () {
            server = require(__main_root + 'server/Server').listen();
            server.start(function () {
                User = require(__main_root + 'db/DB.js').models.user;
                done();
            });
        });
    });

    afterEach(function (done) {
        User.destroy({truncate: true, force: true}).then(function () {
            done();
        });
    });

    after(function (done) {
        User.sync({force: true}).then(function () {
            done();
        });
    });

    describe('authenticateUserWithBasic', function () {

        var email = "something@yahoo.com";
        var password = "987654321";

        beforeEach(function (done) {
            var options = {
                method: "POST",
                url: "/api/v1/users",
                headers: {
                    "content-type": "application/json"
                },
                payload: {
                    "user": {"email": email, "password": password, "name": "alex-wow"}
                }
            };
            server.inject(options, function (response) {
                expect(response.statusCode).to.equal(201);
                done();
            });
        });


        it("should authenticate user when Basic header is set", function (done) {
            var get_options = {
                method: "GET",
                url: "/api/v1/sessions",
                headers: {
                    authorization: 'Basic ' + (new Buffer(email + ':' + password, 'utf8')).toString('base64')
                }
            };
            server.inject(get_options, function (response) {
                expect(response.statusCode).to.equal(200);
                var payload = JSON.parse(response.payload);

                expect(payload.auth_token).to.have.length.of.at.least(32);
                expect(payload.email).to.equal(email);
                done();
            });
        });
    });
});