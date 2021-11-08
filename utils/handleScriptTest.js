const axios = require('axios');


module.exports = async (interfaceData, response, validRes, requestParams, {col_id, records}) => {
  // 是否启动断言
  try {
    let test = await axios.post('/api/col/run_script', {
      response: response,
      records,
      script: interfaceData.test_script,
      params: requestParams,
      col_id,
      interface_id: interfaceData.interface_id
    });
    if (test.data.errcode !== 0) {
      test.data.data.logs.forEach(item => {
        validRes.push({ message: item });
      });
    }
  } catch (err) {
    validRes.push({
      message: 'Error: ' + err.message
    });
  }
};