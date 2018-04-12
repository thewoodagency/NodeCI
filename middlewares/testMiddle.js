/**
 * Created by jay on 4/4/18
 */

module.exports = async (req, res, next) => {
    await next();
    console.log('test middleware run');

}