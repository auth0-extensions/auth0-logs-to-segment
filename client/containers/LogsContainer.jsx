import React, { PropTypes, Component } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import connectContainer from 'redux-static';
import { Error, LoadingPanel, Pagination, TableTotals, InputCheckBox } from 'auth0-extension-ui';

import { logActions } from '../actions';

import LogsTable from '../components/LogsTable';
import LogsDialog from '../components/LogsDialog';

export default connectContainer(class extends Component {
  static stateToProps = (state) => ({
    logs: state.logs,
    filter: state.filter.toJS()
  });

  static actionsToProps = {
    ...logActions
  }

  static propTypes = {
    logs: PropTypes.object.isRequired,
    fetchLogs: PropTypes.func.isRequired,
    setFilter: PropTypes.func.isRequired,
    openLog: PropTypes.func.isRequired,
    clearLog: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.fetchLogs();
  }

  updateFilter = () => {
    this.props.setFilter(!this.props.filter.status);
    this.props.fetchLogs(1, !this.props.filter.status);
  };

  handleReload = () => {
    this.props.fetchLogs(1, this.props.filter.status);
  };

  handlePageChange = (page) => {
    this.props.fetchLogs(page, this.props.filter.status);
  };

  render() {
    const { error, records, total, loading, activeRecord } = this.props.logs.toJS();

    return (
      <div>
        <div className="col-xs-12">
          <div className="col-xs-6">
            <InputCheckBox input={{ onChange: this.updateFilter }} name="only-errors" label="Only Errors" />
          </div>
          <ButtonToolbar className="pull-right">
            <Button bsSize="small" className="btn-default" onClick={this.handleReload}>
              <i className="icon icon-budicon-257" /> Reload
            </Button>
          </ButtonToolbar>
        </div>
        <LoadingPanel show={loading} animationStyle={{ paddingTop: '5px', paddingBottom: '5px' }}>
          <div className="row">
            <div className="col-xs-12">
              <Error message={error} />
              <LogsTable error={error} records={records} showLogs={this.props.openLog} />
              <LogsDialog log={activeRecord} onClose={this.props.clearLog} />
            </div>
          </div>
        </LoadingPanel>
        <div>
          { total > 10 ?
            <Pagination
              totalItems={total}
              handlePageChange={this.handlePageChange}
              perPage={10}
            /> :
            <TableTotals currentCount={records.length} totalCount={total} />
          }
        </div>
      </div>
    );
  }
});
