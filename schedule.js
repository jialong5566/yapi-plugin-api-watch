const schedule = require('node-schedule');
const planModel = require('./models/plan');
const resultModel = require('./models/result');
const yapi = require('../../server/yapi.js');
const projectModel = require('../../server/models/project.js');
const interfaceCaseModel = require('../../server/models/interfaceCase.js');

const jobMap = new Map();
const retryMap = new Map();
const executeRequest = require('./utils/executeRequest');

/**
 * 定时执行测试计划
 */
class ApiWatchSchedule {
    constructor(ctx) {
        this.ctx = ctx;
        this.caseModel = yapi.getInst(interfaceCaseModel);
        this.planModel = yapi.getInst(planModel);
        this.resultModel = yapi.getInst(resultModel);
        this.projectModel = yapi.getInst(projectModel);
        this.init()
    }

    //初始化定时任务
    async init() {
        const allPlan = await this.planModel.listAll();
        for (let i = 0, len = allPlan.length; i < len; i++) {
            let plan = allPlan[i];
            if (plan.is_plan_open) {
                this.addApiWatchJob(plan._id, plan);
            }
        }
    }

    async getProjectDataMap(col_id){
        // 通过col_id 找到 caseList
      const projectList = await this.caseModel.list(col_id, 'project_id');
        
      const projectIdSet = [...new Set(projectList.map(e => e.project_id))];
      const projectDataMap = new Map();
      // 遍历projectList 找到项目和env
      for (let i = 0; i < projectIdSet.length; i++) {
        const tmpProjectId = projectIdSet[i];
        const result = await this.projectModel.getBaseInfo(tmpProjectId);
        projectDataMap.set(tmpProjectId, result);
      }
      return projectDataMap;
    }

    async execute(plan){
        const {col_id, uid, env_id, project_id, _id: plan_id, plan_name} = plan||{};
        const valid = [col_id, uid, env_id, project_id].every(Boolean);
        if(valid){
            const caseList = (await yapi.commons.getCaseList(+col_id)).data;
            const projectDataMap = await this.getProjectDataMap(+col_id);
            const projectData = projectDataMap.get(project_id);
            const list = await executeRequest({projectData, caseList, env_id, plan_id, plan_name, col_id: +col_id });
            this.batchSaveExecuteResult([list], plan);
        }
    }

    async batchSaveExecuteResult(list, plan){
        for(let i = 0; i < list.length; i++){
            const item = list[i];
            try {
                await this.resultModel.save(item);
                console.log('batchSaveExecuteResult 方法保存成功');
                this.saveApiWatchLog(plan.plan_name, item.errmsg, plan.uid, plan.project_id);
            } catch (error) {
                console.log('batchSaveExecuteResult 方法保存报错', error);
            }
        }
    }

    /**
     * 添加一个测试计划
     * @param {测试计划id} planId 
     * @param {测试计划} plan 
     */
    async addApiWatchJob(planId, plan) {
        const handlerPlan = async (planId, plan, retry) => {
            try {
                // TODO  重点改造
                await this.execute(plan);
                
                // 截取限制的plan
                if (plan.plan_result_size >= 0) {
                    let results = await this.resultModel.findByPlan(planId);
                    let ids = results.map((val) => val._id).slice(plan.plan_result_size);
                    await this.resultModel.deleteByIds(ids);
                }
                let job = jobMap.get(planId);
                if (plan.plan_fail_retries && plan.plan_fail_retries > 0) {
                    job && job.cancel();
                    let retryDate = new Date();
                    let seconds = retryDate.getSeconds();
                    retryDate.setSeconds(seconds + 60 * (retry + 1));
                    // 延迟60 * 次数s执行重试
                    let retryItem = schedule.scheduleJob(retryDate, async () => {
                        yapi.commons.log(`项目ID为【${plan.project_id}】下测试计划【${plan.plan_name}】失败后自动重试第${retry+1}次`);
                        this.deleteRetryJob(planId); // 开始执行就取消重试的任务防止重复执行
                        await handlerPlan(planId, plan, retry + 1);
                    });
                    this.addRetryJob(planId, retryItem)
                } else if (retry > 5) {
                    // 重试过 五次 的任务不再重试就需要恢复
                    job && job.reschedule(plan.plan_cron);
                }
            } catch (e) {
                yapi.commons.log(`项目ID为【${plan.project_id}】下测试计划【${plan.plan_name}】配置有误，请检查后重新配置。`);
            }
        }

        let scheduleItem = schedule.scheduleJob(plan.plan_cron, async () => {
            handlerPlan(planId, plan, 0);
        });

        //判断是否已经存在这个任务
        let jobItem = jobMap.get(planId);
        if (jobItem) {
            jobItem.cancel();
        }
        jobMap.set(planId, scheduleItem);
    }

    /**
     * 获取测试计划
     * @param {测试计划id} planId 
     */
    getApiWatchJob(planId) {
        return jobMap.get(planId);
    }

    /**
     * 删除测试计划
     * @param {测试计划id} planId 
     */
     deleteApiWatchJob(planId) {
        let jobItem = jobMap.get(planId);
        if (jobItem) {
            jobItem.cancel();
        }
        this.deleteRetryJob(planId);
    }

    // 动态中添加测试结果
    saveApiWatchLog(plan, msg, uid, projectId) {
        yapi.commons.saveLog({
            content: `成功执行计划名为"${plan}"的自动化测试，${msg}。`,
            type: 'project',
            uid: uid,
            username: "自动化测试",
            typeid: projectId
        });
    }

    /**
     * 添加重试计划
     * @param {*} planId 
     * @param {*} retryItem 
     */
    addRetryJob(planId, retryItem) {
        let jobItem = retryMap.get(planId);
        if (jobItem) {
            jobItem.cancel();
        }
        retryMap.set(planId, retryItem)
    }

    /**
     * 删除重试计划
     * @param {测试计划id} planId 
     */
    deleteRetryJob(planId) {
        let jobItem = retryMap.get(planId);
        if (jobItem) {
            jobItem.cancel();
        }
    }
}

module.exports = ApiWatchSchedule;