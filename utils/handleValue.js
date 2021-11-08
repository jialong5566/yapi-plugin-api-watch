const { handleParamsValue, ArrayToObject } = require('../../../common/utils.js');


module.exports = (records, val, global) => {
  const globalValue = ArrayToObject(global);
  const context = Object.assign({}, { global: globalValue }, records);
  return handleParamsValue(val, context);
}