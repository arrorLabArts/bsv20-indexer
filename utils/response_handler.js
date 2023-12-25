global._handleResponse = function (res,statusCode, response) {
    if(statusCode){
           res.sendStatus(statusCode);
    }else{
           res.json(response);
    }
};