var data = require(__main_root + 'db/fixtures/data');

function DataController() {
};

DataController.prototype = {
    findByID: function findByID(request, reply) {
        var id = parseInt(request.params.id);
        var isValidKey = typeof data[id] !== 'undefined';
        if (isValidKey) {
            reply(data[id]);
        } else {
            reply('Not Found').code(404);
        }
    }
};

var dataController = new DataController();
module.exports = dataController;