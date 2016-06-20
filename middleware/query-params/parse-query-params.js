/**
 * Created by denman on 10/31/2015.
 */



module.exports = function parseQueryParams(req,res,next){

    req.query = parseQueryObj(req.query);
    next();

};


function parseQueryObj(obj) {
    var result = {};
    var key;
    for (key in obj) {
        if(obj.hasOwnProperty(key)){
            if (obj[key] === 'false') {
                result[key] = false;
            }
            else if (obj[key] === 'true') {
                result[key] = true;
            }
            else if (obj[key] === 'null') {
                result[key] = null;
            }
            else if (obj[key] === 'undefined') {
                result[key] = undefined;
            }
            //else if(typeof Number(obj[key]) ==='number' && Number(obj[key]) != Number.NaN){
            //    result[key] = Number(obj[key]);
            //}
            else {
                result[key] = obj[key];
            }
        }
    }
    return result;
}