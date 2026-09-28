import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Text,
  TextVariants
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import * as React from 'react';

export interface HealthErrorProps {
  title: string;
  body: string;
}

export const HealthError: React.FC<HealthErrorProps> = ({ title, body }) => {
  return (
    <div id="netobserv-error-container" className="health-tab-panel">
      <EmptyState data-test="error-state">
        <EmptyStateHeader titleText={title} headingLevel="h2" icon={<EmptyStateIcon icon={ExclamationCircleIcon} />} />
        <EmptyStateBody className="error-body">
          <Text className="netobserv-error-message" component={TextVariants.p}>
            {body}
          </Text>
        </EmptyStateBody>
      </EmptyState>
    </div>
  );
};

export default HealthError;
