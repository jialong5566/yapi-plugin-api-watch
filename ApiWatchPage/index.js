import React, { PureComponent as Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Layout } from 'antd';
import ApiWatchMenu from './components/ApiWatchMenu';
import ApiWatchSet from './components/ApiWatchSet';

import {
  fetchInterfaceColList,
  fetchInterfaceCaseList,
  setColData,
  fetchCaseList,
  fetchCaseData,
  fetchCaseEnvList
} from '../../../client/reducer/modules/interfaceCol';
import { fetchProjectList, getToken } from '../../../client/reducer/modules/project';
import { withRouter } from 'react-router';



const { Content, Sider } = Layout;


@connect(
  state => {
    return {
      token: state.project.token,
      currProject: state.project.currProject,
      curProjectRole: state.project.currProject.role,
      interfaceColList: state.interfaceCol.interfaceColList,
      envList: state.interfaceCol.envList,
      currColId: state.interfaceCol.currColId,
      currCaseList: state.interfaceCol.currCaseList,
      currCase: state.interfaceCol.currCase,
      isRander: state.interfaceCol.isRander,
      currCaseId: state.interfaceCol.currCaseId,
      curUid: state.user.uid
    };
  },
  {
    getToken,
    fetchInterfaceColList,
    fetchInterfaceCaseList,
    fetchCaseData,
    fetchCaseList,
    setColData,
    fetchProjectList,
    fetchCaseEnvList
  }
)
@withRouter
export default class ApiWatchPage extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    isShowCol: PropTypes.bool,
    getProject: PropTypes.func,
    setColData: PropTypes.func,

    currProject: PropTypes.object,
    interfaceColList: PropTypes.array,
    token: PropTypes.string,
    curProjectRole: PropTypes.string,
    currColId: PropTypes.number,
    currCaseList: PropTypes.array,
    envList: PropTypes.array,

    fetchInterfaceColList: PropTypes.func,
    fetchInterfaceCaseList: PropTypes.func,
    fetchCaseList: PropTypes.func,
    fetchCaseData: PropTypes.func,
    currCaseId: PropTypes.number,
    isRander: PropTypes.bool,
    router: PropTypes.object,
    currCase: PropTypes.object,
    fetchProjectList: PropTypes.func,
    fetchCaseEnvList: PropTypes.func,
    getToken: PropTypes.func,
    curUid: PropTypes.number
  };

  constructor(props) {
    super(props);
  }



  async componentWillMount(){
    await this.props.getToken(this.props.match.params.id);
  }


  render() {
    const {
      interfaceColList,
      currCase,
      isRander,
      currCaseId,
      fetchInterfaceColList,
      fetchInterfaceCaseList,
      fetchCaseData,
      fetchCaseList,
      setColData,
      fetchProjectList,
      envList,
      currColId,
      currCaseList
    } = this.props;
    const apiWatchMenuProps = {
      currColId,
      interfaceColList,
      fetchInterfaceColList,
      fetchInterfaceCaseList,
      fetchCaseList,
      fetchCaseData,
      setColData,
      currCaseId,
      isRander,
      currCase,
      fetchProjectList,
      fetchCaseEnvList,
      currCaseList
    };
    const col_id = currColId;

    return (
      <Layout style={{ minHeight: 'calc(100vh - 156px)', marginLeft: '24px', marginTop: '24px' }}>
        <Sider style={{ height: '100%' }} width={300}>
          <div className="left-menu">
            <ApiWatchMenu
              {
                ...apiWatchMenuProps
              }
            />
          </div>
        </Sider>
        <Layout>
          <Content
            style={{
              height: '100%',
              margin: '0 24px 0 16px',
              overflow: 'initial',
              backgroundColor: '#fff'
            }}
          >
            <div className="right-content">
              <ApiWatchSet
                {...{
                  col_id,
                  envList
                }}
              />
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
