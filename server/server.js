var Hapi = require("hapi");
var data = require("../test/fixtures/data");

function listen(port) {
    var server = new Hapi.Server();
    server.connection({
        host: 'localhost',
        port: port
    });
    var healthCheck = {
        path: "/", method: "GET", handler: function (request, reply) {
            reply("hello world");
        }
    };
    var getData = {
        path: "/data/{index}", method: "GET", handler: function (request, reply) {
            var index = parseInt(request.params.index);
            var isValidKey = typeof data[index] !== "undefined";
            if (isValidKey) {
                reply(data[index]);
            } else {
                reply("Not Found").code(404);
            }
        }
    };
    server.route([healthCheck, getData]);
    return server;
}
module.exports = {listen: listen};