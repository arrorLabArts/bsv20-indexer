
class Routes {
    constructor(app) {
        this.app = app;
    }

    appRoutes() {
         this.app.use('/api/bsv20', require('./bsv20'));
         this.app.use('/api/indexer', require('./indexer'));
    }

    routesConfig() {
        this.appRoutes();
    }
}

module.exports = Routes;