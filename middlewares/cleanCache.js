/**
 * Created by jay on 4/4/18
 */

const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
    await next();
    console.log('running cleanCache');
    clearHash(req.user.id);
}