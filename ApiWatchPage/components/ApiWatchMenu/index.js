import React, { PureComponent as Component, Fragment } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';

import { Button } from 'antd';
import _ from 'underscore'


@withRouter
export default class ApiWatchMenu extends Component {
  static propTypes = {
    match: PropTypes.object,
    currColId: PropTypes.number,
    interfaceColList: PropTypes.array,
    fetchInterfaceColList: PropTypes.func,
    fetchInterfaceCaseList: PropTypes.func,
    fetchCaseList: PropTypes.func,
    fetchCaseData: PropTypes.func,
    setColData: PropTypes.func,
    currCaseId: PropTypes.number,
    history: PropTypes.object,
    isRander: PropTypes.bool,
    router: PropTypes.object,
    currCase: PropTypes.object,
    fetchProjectList: PropTypes.func,
    fetchCaseEnvList: PropTypes.func,
    currCaseList: PropTypes.array
  };

  state = {
    list: []
  }

  async getList() {
    const r = await this.props.fetchInterfaceColList(this.props.match.params.id);
    const list = r.payload.data.data;
    this.setState({
      list
    });
    if(list.length > 1){
      this.onColClick(list[1]._id);
    } else if(list.length > 0){
      this.onColClick(list[0]._id);
    }
    return r;
  }

  componentDidMount(){
    this.getList();
  }

  onColClick = async col_id => {
    const tmpEnvList = (await this.props.fetchCaseEnvList(col_id).payload).data.data;
    this.props.setColData({
      currColId: +col_id,
      envList: tmpEnvList
    });
    await this.props.fetchCaseList(col_id);
  }

  onClick = _.debounce(async col_id => {
    await this.onColClick(col_id);
  }, 500);

  onCaseClick = (c) => {
    const { project_id, _id} = c;
    this.props.history.push(`/project/${project_id}/interface/case/${_id}`);
  }


  render(){
    const { list } = this.state;
    const id = this.props.currColId;
    const { currCaseList } = this.props;
    return (
      <div style={{padding: 10, boxSizing: 'border-box', display: 'flex', flexDirection: 'column'}}>
        {
          list.map(ele => (
            <Fragment key={ele._id} >
              <Button
                {...(ele._id === Number(id) ? {type: 'primary'}:{})}
                onClick={()=>this.onClick(ele._id)}
                style={{marginBottom: 10}}
              >
                {ele.name}
              </Button>
              <div>
                {
                  (ele._id === Number(id) && currCaseList.length> 0 ) && (
                    currCaseList.map(ele => (
                      <div
                      key={ele.casename}
                      style={{marginBottom: 10}}
                      onClick={() =>this.onCaseClick(ele)}
                      >
                        {ele.casename}
                      </div>
                    ))
                  )
                }
              </div>
            </Fragment>
          ))
        }
      </div>
    );
  }
}
