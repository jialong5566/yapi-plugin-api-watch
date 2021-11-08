
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
      path: `api_watch/plan`,
      action: 'getApiWatchPlans'
    })
    addRouter({
      controller: plan,
      method: 'post',
      path: `api_watch/plan/add`,
      action: `saveApiWatchPlan`
    })
    addRouter({
      controller: plan,
      method: 'put',
      path: `api_watch/plan/update`,
      action: `updateApiWatchPlan`
    })
    addRouter({
      controller: plan,
      method: 'delete',
      path: `api_watch/plan/del`,
      action: `delApiWatchPlan`
    })

    // 测试结果
    addRouter({
      controller: result,
      prefix: "/open",
      method: 'get',
      path: 'api_watch/run',
      action: 'runAutoApiWatch'
    })
    addRouter({
      controller: result,
      method: 'get',
      path: 'api_watch/results',
      action: 'getApiWatchResults'
    })
    addRouter({
      controller: result,
      method: 'delete',
      path: 'api_watch/results/del',
      action: 'delApiWatchResults'
    })
    addRouter({
      controller: result,
      prefix: "/open",
      method: 'get',
      path: 'api_watch/result',
      action: 'getApiWatchResult'
    })
  })
}