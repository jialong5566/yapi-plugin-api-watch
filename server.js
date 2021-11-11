
const yapi =require('../../server/yapi.js');

const plan = require('./controllers/plan');
const result = require('./controllers/result');

const schedule = require('./schedule');
const Config = require('./utils/config');


module.exports = function(options){
  Config.instance = options;

  yapi.getInst(schedule);

  this.bindHook('add_router', function(addRouter){
    // 测试计划
    addRouter({
      controller: plan,
      method: 'get',
      path: `getApiWatchPlans`,
      action: 'getApiWatchPlans'
    })
    addRouter({
      controller: plan,
      method: 'post',
      path: `saveApiWatchPlan`,
      action: `saveApiWatchPlan`
    })
    addRouter({
      controller: plan,
      method: 'put',
      path: `updateApiWatchPlan`,
      action: `updateApiWatchPlan`
    })
    addRouter({
      controller: plan,
      method: 'delete',
      path: `delApiWatchPlan`,
      action: `delApiWatchPlan`
    })
    addRouter({
      controller: result,
      method: 'get',
      path: 'getApiWatchResults',
      action: 'getApiWatchResults'
    })
    addRouter({
      controller: result,
      method: 'delete',
      path: 'delApiWatchResults',
      action: 'delApiWatchResults'
    })
    addRouter({
      controller: result,
      method: 'get',
      path: 'getApiWatchResult',
      action: 'getApiWatchResult'
    })
  })
}
