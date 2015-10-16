function listen() {
    var Hapi = require('hapi');
    var rootRoute = require(__main_root + 'routes/RootRoute.js');
    var userRoutes = require(__main_root + 'routes/api/v1/UserRoute.js');
    var sessionsRoute = require(__main_root + 'routes/api/v1/SessionsRoute.js');

    var server = new Hapi.Server();
    server.connection({
        host: process.env.npm_package_config_host,
        port: process.env.npm_package_config_port
    });

    server.route([rootRoute].concat(userRoutes));
    module.exports.routingTable = server.table(process.env.npm_package_config_host)[0].table;

    server.ext('onPreResponse', function (request, reply) {
        var response = request.response;
        if (response.isBoom && response.output.statusCode === 400 && response.data.name === 'SyntaxError') {
            response.output.payload = {
                "code": 400,
                "message": "400 Bad Request",
                "description": "The syntax of the request entity is incorrect"
            };
        }
        return reply.continue();
    });

    server.register(require('hapi-auth-basic'), function (error) {
        server.auth.strategy('simple', 'basic', {
            validateFunc: function (request, email, password, callback) {
                var User = require(__main_root + 'db/DB.js').models.user;
                User.findOne({where: {email: email}}).then(function (foundUser) {

                    if (!foundUser || foundUser == null) {
                        callback(null, false);
                    } else {
                        var bcrypt = require('bcrypt-nodejs');
                        var authenticated = bcrypt.compareSync(password, foundUser.password);
                        callback(null, authenticated, {email: email, auth_token: foundUser.authToken}); // will invoke the handler
                    }
                });
            }
        });
        server.route(sessionsRoute);
    });

    return server;
}
module.exports = {listen: listen};