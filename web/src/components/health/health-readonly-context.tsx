import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
  Text,
  TextContent,
  TextVariants
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { HealthDrawerContainer } from './health-drawer-container';
import { getAllHealthItems } from './health-helper';
import { getReadonlyContextDescriptor } from './readonly-context-descriptors';
import { ReadonlyHealthStats } from './readonly-health-helper';
import { RuleDetails } from './rule-details';

export type HealthReadonlyView = 'global' | 'per-node';

export interface HealthReadonlyContextProps {
  contextId: string;
  stats: ReadonlyHealthStats;
  view: HealthReadonlyView;
  isLoading?: boolean;
  isDark: boolean;
}

export const HealthReadonlyContext: React.FC<HealthReadonlyContextProps> = ({
  contextId,
  stats,
  view,
  isLoading,
  isDark
}) => {
  const { t } = useTranslation('plugin__netobserv-plugin');
  const copy = getReadonlyContextDescriptor(contextId, stats.displayName, t).copy;
  const testPrefix = `health-${contextId}`;
  const globalItems = getAllHealthItems(stats.global);
  const hasNodeItems = stats.byNode.some(s => getAllHealthItems(s).length > 0);

  if (isLoading) {
    return (
      <Bullseye data-test={`${testPrefix}-loading`}>
        <Spinner size="lg" aria-label={copy.loadingLabel} />
      </Bullseye>
    );
  }

  if (!stats.available) {
    return (
      <EmptyState data-test={`${testPrefix}-unavailable`}>
        <EmptyStateHeader titleText={copy.unavailableTitle} headingLevel="h2" />
        <EmptyStateBody>{copy.unavailableBody}</EmptyStateBody>
      </EmptyState>
    );
  }

  if (view === 'global') {
    if (globalItems.length === 0) {
      return (
        <Bullseye>
          <EmptyState data-test={`${testPrefix}-global-healthy`}>
            <EmptyStateHeader
              titleText={copy.globalHealthyTitle}
              headingLevel="h2"
              icon={<EmptyStateIcon icon={CheckCircleIcon} />}
            />
          </EmptyState>
        </Bullseye>
      );
    }

    return (
      <div className="health-readonly-content" data-test={`${testPrefix}-content`}>
        <TextContent>
          <Text component={TextVariants.h3}>{copy.globalSectionTitle}</Text>
        </TextContent>
        <RuleDetails kind={'Global'} resourceHealth={stats.global} />
      </div>
    );
  }

  if (!hasNodeItems) {
    return (
      <Bullseye>
        <EmptyState data-test={`${testPrefix}-nodes-healthy`}>
          <EmptyStateHeader
            titleText={copy.nodesHealthyTitle}
            headingLevel="h2"
            icon={<EmptyStateIcon icon={CheckCircleIcon} />}
          />
        </EmptyState>
      </Bullseye>
    );
  }

  return (
    <div className="health-readonly-content" data-test={`health-${contextId}-content`}>
      <HealthDrawerContainer title={copy.nodesSectionTitle} stats={stats.byNode} kind={'Node'} isDark={isDark} />
    </div>
  );
};
