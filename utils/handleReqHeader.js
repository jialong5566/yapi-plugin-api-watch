const {
  handleCurrDomain,
  checkNameIsExistInArray
} = require('../../../common/postmanLib.js');

module.exports = (project_id, req_header, case_env, {envList}) => {
  const envItem = envList.find(item => item._id === project_id);
  const currDomain = handleCurrDomain(envItem && envItem.env, case_env);
  let header = currDomain.header;
  header.forEach(item => {
    if (!checkNameIsExistInArray(item.name, req_header)) {
      // item.abled = true;
      item = {
        ...item,
        abled: true
      };
      req_header.push(item);
    }
  });
  return req_header;
};