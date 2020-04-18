import React from 'react';
import {
  FlipperPlugin,
  Panel,
  ManagedDataInspector,
  Text,
  TableBodyRow,
  FlexColumn,
  SearchableTable,
  DetailSidebar,
  Button,
  Tabs,
  Tab
} from 'flipper';

type State = {
  selectedId: string;
};

type Row = {
  id: string;
  action: {
    type: string;
    payload: any;
  };
  took: string;
  time: string;
  before: object;
  after: object;
};

const columns = {
  time: {
    value: 'Time',
  },
  action: {
    value: 'Action Type',
  },
  took: {
    value: 'Took',
  },
};

const columnSizes = {
  time: '20%',
  action: '35%',
  took: '15%',
};

type PersistedState = {
  actions: Array<any>;
};

export default class ReduxViewer extends FlipperPlugin<State, any, any> {
  state = {
    selectedId: '',
    activeTab: 'Diff'
  };

  static defaultPersistedState: PersistedState = {
    actions: [],
  };

  static persistedStateReducer<PersistedState>(
    persistedState: PersistedState,
    method: string,
    payload: Row
  ) {
    console.log('payload: ', payload);
    switch (method) {
      case 'actionDispatched':
        return {
          ...persistedState,
          actions: [...persistedState.actions, payload],
        };
      default:
        return persistedState;
    }
  }

  renderSidebar() {
    const { selectedId } = this.state;
    if (selectedId != '') {
      const { actions } = this.props.persistedState;
      const selectedData = actions.find((v) => v.id === selectedId);
      return (
        <>
          <Panel floating={false} heading="Action">
            <ManagedDataInspector
              data={selectedData.action}
              collapsed={true}
              expandRoot={true}
            />
          </Panel>
          <Panel floating={false} heading="State">
            <Tabs defaultActive="Diff" onActive={(key: string | null | undefined) => {this.setState({activeTab: key})}} active={this.state.activeTab}>
                <Tab label="Diff">
                  <ManagedDataInspector
                    diff={selectedData.before}
                    data={selectedData.after}
                    collapsed={true}
                    expandRoot={false}
                  />
                </Tab>
                <Tab label="State Tree">
                  <ManagedDataInspector
                    data={selectedData.after}
                    expandRoot={false}
                  />
                </Tab>
              </Tabs>
          </Panel>
        </>
      );
    }

    return null;
  }

  buildRow(row: Row): TableBodyRow {
    return {
      columns: {
        time: {
          value: <Text>{row.time}</Text>,
          filterValue: row.time,
        },
        action: {
          value: <Text>{row.action.type}</Text>,
          filterValue: row.type,
        },
        took: {
          value: <Text>{row.took}</Text>,
        },
      },
      key: row.id,
      copyText: JSON.stringify(row),
      filterValue: `${row.id}`,
    };
  }

  onRowHighlighted = (key) => {
    this.setState({ selectedId: key[0] });
  };

  clear = () => {
    this.setState({ selectedId: '' });
    this.props.setPersistedState({ actions: [] });
  };

  render() {
    const { actions } = this.props.persistedState;
    const rows = actions.map((v) => this.buildRow(v));

    return (
      <FlexColumn grow={true}>
        <SearchableTable
          key={100}
          rowLineHeight={28}
          floating={false}
          multiline={true}
          columnSizes={columnSizes}
          columns={columns}
          onRowHighlighted={this.onRowHighlighted}
          multiHighlight={false}
          rows={rows}
          stickyBottom={true}
          actions={<Button onClick={this.clear}>Clear</Button>}
        />
        <DetailSidebar>{this.renderSidebar()}</DetailSidebar>
      </FlexColumn>
    );
  }
}
