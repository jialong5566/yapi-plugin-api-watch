const handleTest = require('./handleTest.js');

module.exports = async ({caseList, projectData, env_id, plan_id, col_id}) => {
  const envList = projectData.env;
  const l = caseList.length;
  const executeResultList = [];
  for (let i = 0; i < l; i++) {
    const caseItem = caseList[i];
    // const reports = {};
    const records = {};
    const envItem = envList.find(item => String(item._id) === String(env_id));
    let curitem = Object.assign(
      {},
      caseItem,
      {
        req_headers: [...(Array.isArray(envItem && envItem.header)? (envItem && envItem.header) : [])],
      },
      {
        env: envList,
        pre_script: projectData.pre_script,
        after_script: projectData.after_script
      }
    );

    let status = 'error', result;
    try {
      const testArg = {
        interfaceData: curitem,
        userId: caseItem.uid,
        projectId: caseItem.project_id,
        col_id: caseItem.col_id,
        records
      };
      result = await handleTest(testArg);

      if (result.code === 400) {
        status = 'error';
      } else if (result.code === 0) {
        status = 'ok';
      } else if (result.code === 1) {
        status = 'invalid';
      }
    } catch (e) {
      console.error(e);
      status = 'error';
      result = e;
    }

    // reports[curitem._id] = result;
    // records[curitem._id] = {
    //   status: result.status,
    //   params: result.params,
    //   body: result.res_body
    // };
    curitem = Object.assign({}, caseItem, { test_status: status });

    const saveItem = {
      // 环境id
      env_id,
      // 入库时间
      add_time: result.add_time,
      // 测试结果状态
      status: result.status,
      // 请求体
      data: result.data,

      // 请求路径
      path: curitem.path,
      // 验证结果
      validRes: result.validRes,
      // 请求头
      headers: result.headers,
      // 请求 url
      url: result.url,
      // 响应头
      res_header: (result.res_header),
      // 响应体
      res_body: (result.res_body),
      // 400|0|1
      code: result.code,
      // 测试结果名称
      name: caseItem.casename
    };


    executeResultList.push(saveItem);

  }
  return  {
    // 项目id
    project_id: projectData._id,
    // 集合id
    col_id,
    // 计划id
    plan_id,

    add_time: Date.now(),

    data: executeResultList
  };
}
