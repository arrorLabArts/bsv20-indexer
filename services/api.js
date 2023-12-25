const express = require("express");
const cors = require("cors");
const Routes = require('../routes');
const path = require("path")
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");


const swaggerOptions = {
    definition : {
        openapi : "3.0.0",
        info : {
            title : "Firesat BSV-20 indexer api",
            version : "1.0.0",
            description : "Firesat.io open BSV-20 indexer api"
        },
        ApiServers : [
            {
                url : `/`
            }
        ],
    },
    apis: ["./routes/*.js"],

}

const swaggerSpecs = swaggerJsDoc(swaggerOptions);


class ApiServer{
     constructor(){
        this.app = express();
        this.app.set('trust proxy', true);

        this.app.use("/api/docs",swaggerUi.serve,swaggerUi.setup(swaggerSpecs))

        this.app.use(express.json({ limit: '33mb' }))
        this.app.use(cors());
        this.app.use(express.static(path.join(__dirname,"../cdn/modules")))
     }

     start(){
         require("../utils/response_handler");
         var routes = new Routes(this.app);
         routes.routesConfig()

         const port = process.env.PORT || 5000;
         const host = process.env.SERVER_ADDRESS || '127.0.0.1';
          
         this.ApiServer = this.app.listen(port, host, () => {
             console.log(`${process.env.SERVER_NAME} is listening on http://${host}:${port}`); 
         });


     }
}

module.exports = new ApiServer();