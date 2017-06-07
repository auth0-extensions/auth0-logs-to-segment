import React, { PropTypes, Component } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import connectContainer from 'redux-static';
import { Error, LoadingPanel } from 'auth0-extension-ui';

import { logActions } from '../actions';

import LogsTable from '../components/LogsTable';
import LogsDialog from '../components/LogsDialog';

export default connectContainer(class extends Component {
  static stateToProps = (state) => ({
    logs: state.logs
  });

  static actionsToProps = {
    ...logActions
  }

  static propTypes = {
    logs: PropTypes.object.isRequired,
    fetchLogs: PropTypes.func.isRequired,
    openLog: PropTypes.func.isRequired,
    clearLog: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.fetchLogs();
  }

  render() {
    const { error, records, loading, activeRecord } = this.props.logs.toJS();

    return (
      <div>
        <LoadingPanel show={loading} animationStyle={{ paddingTop: '5px', paddingBottom: '5px' }}>
          <div className="row">
            <div className="col-xs-12">
              <ButtonToolbar className="pull-right">
                <Button bsSize="small" className="btn-default" onClick={this.props.fetchLogs}>
                  <i className="icon icon-budicon-257" /> Reload
                </Button>
              </ButtonToolbar>
            </div>
            <div className="col-xs-12">
              <Error message={error} />
              <LogsTable error={error} records={records} showLogs={this.props.openLog} />
              <LogsDialog log={activeRecord} onClose={this.props.clearLog} />
            </div>
          </div>
        </LoadingPanel>
      </div>
    );
  }
});
