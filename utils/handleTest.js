const {
  handleParams,
  crossRequest
} = require('../../../common/postmanLib.js');
const createContext = require('../../../common/createContext');

const { json_parse } = require('../../../common/utils.js');
const handleValue = require('./handleValue.js');
const handleScriptTest = require('./handleScriptTest');


module.exports = async ({interfaceData, userId, projectId, col_id, records}) => { 
  let requestParams = {};
  let options = handleParams(interfaceData, handleValue.bind(null, records), requestParams);

  let result = {
    code: 400,
    msg: '数据异常',
    validRes: []
  };

  // await plugin.emitHook('before_col_request', Object.assign({}, options, {
  //   type: 'col',
  //   caseId: options.caseId,
  //   projectId: interfaceData.project_id,
  //   interfaceId: interfaceData.interface_id
  // }));

  try {
    let data = await crossRequest(options, interfaceData.pre_script, interfaceData.after_script, createContext(
      userId,
      projectId,
      interfaceData.interface_id
    ));
    options.taskId = userId;
    let res = (data.res.body = json_parse(data.res.body));
    result = {
      ...options,
      ...result,
      res_header: data.res.header,
      res_body: res,
      status: data.res.status,
      statusText: data.res.statusText
    };

    // await plugin.emitHook('after_col_request', result, {
    //   type: 'col',
    //   caseId: options.caseId,
    //   projectId: interfaceData.project_id,
    //   interfaceId: interfaceData.interface_id
    // });

    if (options.data && typeof options.data === 'object') {
      requestParams = {
        ...requestParams,
        ...options.data
      };
    }

    let validRes = [];

    let responseData = Object.assign(
      {},
      {
        status: data.res.status,
        body: res,
        header: data.res.header,
        statusText: data.res.statusText
      }
    );

    // 断言测试
    await handleScriptTest(interfaceData, responseData, validRes, requestParams, {col_id, records});

    if (validRes.length === 0) {
      result.code = 0;
      result.validRes = [
        {
          message: '验证通过'
        }
      ];
    } else if (validRes.length > 0) {
      result.code = 1;
      result.validRes = validRes;
    }
  } catch (data) {
    result = {
      ...options,
      ...result,
      res_header: data.header,
      res_body: data.body || data.message,
      status: 0,
      statusText: data.message,
      code: 400,
      validRes: [
        {
          message: data.message
        }
      ]
    };
  }

  result.params = requestParams;
  return result;
};