const handleReqHeader = require('./handleReqHeader.js');
const  produce = require('immer') ;

module.exports  = (rows, currColEnvObj = {}) => {
  let newRows = []
  try {
    newRows = produce(rows, draftRows => {
      draftRows.map(item => {
        item.id = item._id;
        item._test_status = item.test_status;
        if(currColEnvObj[item.project_id]){
          item.case_env =currColEnvObj[item.project_id];
        }
        item.req_headers = handleReqHeader(item.project_id, item.req_headers, item.case_env);
        return item;
      });
    });
  } catch (error) {
    console.error('handleColdata -- error', error);
  }
  return newRows;
};