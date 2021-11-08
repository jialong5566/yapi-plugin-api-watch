const yapi = require('../../../server/yapi.js');
const baseModel = require('../../../server/models/base.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

class ApiWatchResultModel extends baseModel {
  getName() {
    return 'api_watch_result';
  }

  getSchema() {
    return {
      uid: Number,
      project_id: {
        type: Number,
        required: true
      },
      col_id: {
        type: Number,
        required: true
      },
      // 通过测试计划执行才有，没有则为-1
      plan_id: {
        type: Number,
        default: -1
      },
      data: Schema.Types.Mixed,
      add_time: {
        type: Number,
        required: true
      }
    };
  }

  get(id) {
    return this.model.findOne({
      _id: id
    });
  }

  save(data) {
    data.add_time = yapi.commons.time();
    let log = new this.model(data);
    return log.save();
  }

  findByProject(id) {
    return this.model
      .find({
        project_id: id
      })
      .exec();
  }

  findByPlan(id) {
    return this.model
      .find({
        plan_id: id
      })
      .sort({ _id: -1 })
      .exec();
  }

  del(id) {
    return this.model.remove({
      _id: id
    });
  }

  deleteByIds(ids) {
    return this.model.remove({ _id: { $in: ids } });
  }

  deleteAll(plan_id) {
    return this.model.remove({ plan_id: plan_id });
  }
}

module.exports = ApiWatchResultModel;