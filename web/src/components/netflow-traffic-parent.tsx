import { NamespaceBar } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, PageSection, Spinner } from '@patternfly/react-core';
import * as React from 'react';
import { getRole } from '../api/routes';
import { config } from '../utils/config';
import AlertFetcher from './alerts/fetcher';
import SamplingBanner from './alerts/sampling-banner';
import { NetflowTraffic, NetflowTrafficProps } from './netflow-traffic';

type Props = NetflowTrafficProps & {};

type State = {
  role?: string;
  namespace?: string;
};

// NetflowTrafficParent loads role and namespace for the NetflowTraffic component
class NetflowTrafficParent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    getRole()
      .then(role => {
        let namespace = this.state.namespace;
        if (role === 'dev') {
          namespace = window?.sessionStorage?.getItem('bridge/last-namespace-name') || 'default';
        }
        this.setState({ role, namespace });
      })
      .catch(error => {
        console.error('Failed to get role:', error);
      });
  }

  render() {
    if (!this.state.role) {
      return (
        <PageSection id="pageSection">
          <Bullseye data-test="loading-role">
            <Spinner size="xl" />
          </Bullseye>
        </PageSection>
      );
    }
    return (
      <AlertFetcher>
        <>
          <SamplingBanner samplingValue={config.sampling} />
          {!this.props.forcedNamespace && this.state.role === 'dev' && (
            <NamespaceBar onNamespaceChange={ns => this.setState({ namespace: ns })} />
          )}
          <NetflowTraffic
            isTab={this.props.isTab}
            hideTitle={this.props.hideTitle}
            forcedFilters={this.props.isTab ? this.props.forcedFilters : null}
            forcedNamespace={this.props.forcedNamespace || this.state.namespace}
            parentConfig={this.props.parentConfig}
          />
        </>
      </AlertFetcher>
    );
  }
}

export default NetflowTrafficParent;
