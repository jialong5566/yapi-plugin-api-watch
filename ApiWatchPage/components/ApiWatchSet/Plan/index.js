import React, { Component } from "react";
import PropTypes from "prop-types";
import { formatTime } from "../../../../../../client/common.js";
import { Form, Switch, Button, Input, Icon, Tooltip, Checkbox, InputNumber, Select } from "antd";
const FormItem = Form.Item;

import "./index.scss"

// layout
const formItemLayout = {
  labelCol: {
    lg: { span: 5 },
    xs: { span: 24 },
    sm: { span: 10 }
  },
  wrapperCol: {
    lg: { span: 16 },
    xs: { span: 24 },
    sm: { span: 12 }
  },
  className: "form-item"
};
const tailFormItemLayout = {
  wrapperCol: {
    sm: {
      span: 16,
      offset: 11
    }
  }
};


const triggerOptions = [
  { label: "执行结束", value: "any" },
  { label: "不发送", value: "never" },
  { label: "全部通过", value: "success" },
  { label: "全部失败", value: "fail" },
  { label: "部分失败", value: "part" }
];


@Form.create()
export default class Add extends Component {
  static propTypes = {
    col_id: PropTypes.number,
    form: PropTypes.object,
    planMsg: PropTypes.object,
    onSubmit: PropTypes.func,
    handleNameInput: PropTypes.func,
    handleEnvSelect: PropTypes.func,
    planNames: PropTypes.array,
    envList: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.state = {
      auto_test_data: props.planMsg,
      notifier_url: props.planMsg.notifier && props.planMsg.notifier.url
    };
  }

  // 获取兼容后的触发器
  getCompatibleTrigger = plan => {
    if (!plan.notice_triggers && plan.notice_trigger) {
      return [plan.notice_trigger];
    }
    return plan.notice_triggers || ["never"];
  }

  handleSubmit = async () => {
    const { form, planMsg, onSubmit, col_id } = this.props;
    let params = {
      id: planMsg._id,
      col_id,
      project_id: planMsg.project_id,
      is_plan_open: this.state.auto_test_data.is_plan_open,
      notifier_url: this.state.notifier_url
    };
    form.validateFields(async (err, values) => {
      if (!err) {
        let assignValue = Object.assign(params, values);
        onSubmit(assignValue);
      }
    });
  };

  componentWillMount() {
    //默认每小时随机数分钟同步一次
    this.setState({
      random_corn: "1 " + Math.round(Math.random() * 60) + " * * * *"
    });
  }

  // 是否开启
  onChange = v => {
    let auto_test_data = this.state.auto_test_data;
    auto_test_data.is_plan_open = v;
    this.setState({
      auto_test_data: auto_test_data
    });
  }

  onTriggerChange = v => {
    let auto_test_data = this.state.auto_test_data;
    auto_test_data.notice_triggers = v;
    this.setState({
      auto_test_data: auto_test_data
    });
  }


  render() {
    const { planNames, planMsg } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { envList, handleEnvSelect } = this.props;
    const { env = [] } = envList && envList[0] || {};
    const envOptions = env.map(e => ({label: `${e.name}: ${e.domain}`, value: e._id}));
    return (
      <div className="m-panel">
        <Form>
          <FormItem
            label="是否执行测试计划"
            {...formItemLayout}
          >
            <Switch
              checked={this.state.auto_test_data.is_plan_open}
              onChange={this.onChange}
              checkedChildren="开"
              unCheckedChildren="关"
            />

            {this.state.auto_test_data.last_test_time != null ?
              (<div>上次执行时间: <span className="testtime">{formatTime(this.state.auto_test_data.last_test_time)}</span></div>) : null}
          </FormItem>

          <div>
            <FormItem {...formItemLayout} label="监测计划名称">
              {getFieldDecorator("plan_name", {
                rules: [
                  {
                    required: true,
                    message: "请输入监测计划名称"
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (value) {
                        if (planNames.includes(value)) {
                          callback("计划名称重复");
                        } else if (!/\S/.test(value)) {
                          callback("请输入计划名称");
                        } else {
                          callback();
                        }
                      } else {
                        callback("请输入计划名称");
                      }
                    }
                  }
                ],
                validateTrigger: "onBlur",
                initialValue: this.state.auto_test_data._id === 0 ? "" : this.state.auto_test_data.plan_name
              })(<Input onChange={e => this.props.handleNameInput(e.target.value)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="测试环境">
              {getFieldDecorator("env_id", {
                rules: [
                  {
                    required: true,
                    message: "请选择测试环境"
                  }
                ],
                validateTrigger: "onBlur",
                initialValue: this.state.auto_test_data.env_id
              })(
                <Select
                  options={envOptions}
                  onChange={handleEnvSelect}
                >
                  {
                    envOptions.map(op =>(
                      <Select.Option key={op.value} value={op.value}>
                        {op.label}
                      </Select.Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>

            <FormItem {...formItemLayout} label={<span>类cron风格表达式&nbsp;<a href="https://github.com/node-schedule/node-schedule">GitHub</a></span>}>
              {getFieldDecorator("plan_cron", {
                rules: [
                  {
                    required: true,
                    message: "请输入node-schedule的类cron表达式!"
                  }
                ],
                initialValue: this.state.auto_test_data.plan_cron ? this.state.auto_test_data.plan_cron : this.state.random_corn
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label={
              <span>
                保留测试结果数，-1为不限&nbsp;
                <Tooltip title="配置影响每个测试计划保留的测试结果数，设置为-1表示不限，下次执行生效">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            }>
              {getFieldDecorator("plan_result_size", {
                rules: [
                  {
                    required: true,
                    message: "请输入保留次数"
                  }, {
                    validator: (rule, value, callback) => {
                      if (value !== "") {
                        if (!/^\d+$/.test(value) && value != -1) {
                          callback("请输入非负整数或-1");
                        } else {
                          callback();
                        }
                      } else {
                        callback("请输入保留次数");
                      }
                    }
                  }
                ],
                validateTrigger: "onBlur",
                initialValue: this.state.auto_test_data.plan_result_size
              })(<InputNumber min={-1} />)}
            </FormItem>
          </div>
          <FormItem {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit" icon="save" size="large" onClick={this.handleSubmit}>
              保存
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
