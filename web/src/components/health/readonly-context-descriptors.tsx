import { Text, TextVariants } from '@patternfly/react-core';
import { TFunction } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NETOBSERV_CONTEXT_OVN } from './health-context';
import { buildGenericReadonlyCopy, ReadonlyContextCopy } from './readonly-context-copy';

/**
 * Presentation descriptor for a read-only alerts context tab: the human title, the tab copy
 * and the "info" drawer content. Generic contexts derive everything from their display name;
 * built-in descriptors (currently only the temporary OVN shim) can provide richer, curated copy.
 *
 * Rendering components resolve a descriptor via getReadonlyContextDescriptor() and never branch
 * on a specific context id.
 */
export type ReadonlyContextDescriptor = {
  displayName: string;
  copy: ReadonlyContextCopy;
  scoringTitle: string;
  ScoringInfoContent: React.FC;
};

const SeverityHeading: React.FC<{ colorVar: string; label: string }> = ({ colorVar, label }) => (
  <Text component={TextVariants.h4}>
    <span style={{ color: `var(${colorVar})` }}>{label}</span>
  </Text>
);

/**
 * Severity and state descriptions shared by every read-only alerts context. These are always
 * Prometheus alerts, so the severity buckets and alert states are identical regardless of the
 * owning component and must not differ between tabs.
 */
const ReadonlySeverityStatesInfo: React.FC = () => {
  const { t } = useTranslation('plugin__netobserv-plugin');
  return (
    <>
      <Text component={TextVariants.h3}>{t('Severity Levels')}</Text>
      <Text component={TextVariants.p}>
        {t(
          'Alerts are grouped by their Prometheus severity label. Counts in the summary reflect firing, pending, and silenced alerts at each level:'
        )}
      </Text>

      <SeverityHeading colorVar="--pf-t--global--text--color--status--danger--default" label={t('Critical')} />
      <Text component={TextVariants.p}>{t('Severe problems requiring immediate attention.')}</Text>

      <SeverityHeading colorVar="--pf-t--global--text--color--status--warning--default" label={t('Warning')} />
      <Text component={TextVariants.p}>{t('Moderate issues that should be reviewed.')}</Text>

      <SeverityHeading colorVar="--pf-t--global--text--color--status--info--default" label={t('Info')} />
      <Text component={TextVariants.p}>{t('Minor observations worth noting.')}</Text>

      <Text component={TextVariants.h3}>{t('Alert States')}</Text>
      <Text component="p" className="health-scoring-list-item">
        <strong>{t('Firing')}</strong>: {t('Active alert condition - counted in severity totals')}
      </Text>
      <Text component="p" className="health-scoring-list-item">
        <strong>{t('Pending')}</strong>: {t('Condition detected, awaiting confirmation - counted in severity totals')}
      </Text>
      <Text component="p" className="health-scoring-list-item">
        <strong>{t('Silenced')}</strong>:{' '}
        {t('Known issue, temporarily ignored in Alertmanager - still shown here for visibility')}
      </Text>
    </>
  );
};

const GenericScoringInfoContent: React.FC<{ displayName: string }> = ({ displayName }) => {
  const { t } = useTranslation('plugin__netobserv-plugin');
  return (
    <>
      <Text component={TextVariants.h3}>{t('What are {{title}} alerts?', { title: displayName })}</Text>
      <Text component={TextVariants.p}>
        {t(
          'These alerts are contributed by another component and shown for visibility only. They do not contribute to the 0–10 NetObserv health score.'
        )}
      </Text>

      <ReadonlySeverityStatesInfo />

      <Text component={TextVariants.h3}>{t('Read-only view')}</Text>
      <Text component={TextVariants.p}>
        {t(
          'These alerts cannot be managed from NetObserv. Use the owning component documentation to investigate issues.'
        )}
      </Text>
    </>
  );
};

/** Temporary curated OVN-Kubernetes platform alerts info panel (until CNO ships the health annotation). */
const OvnScoringInfoContent: React.FC = () => {
  const { t } = useTranslation('plugin__netobserv-plugin');
  return (
    <>
      <Text component={TextVariants.h3}>{t('What are OVN platform alerts?')}</Text>
      <Text component={TextVariants.p}>
        {t(
          // eslint-disable-next-line max-len
          'These are Prometheus alerts defined and managed by the OpenShift cluster network operator for OVN-Kubernetes. They monitor control plane health, node networking components, and OVN database state.'
        )}
      </Text>

      <Text component={TextVariants.h3}>{t('Not included in the NetObserv health score')}</Text>
      <Text component={TextVariants.p}>
        {t(
          'Platform alerts are shown for visibility only. They do not contribute to the 0–10 NetObserv health score calculated from NetObserv health rules.'
        )}
      </Text>

      <Text component={TextVariants.h3}>{t('Severity Levels')}</Text>
      <Text component={TextVariants.p}>
        {t(
          'Alerts are grouped by their Prometheus severity label. Counts in the summary reflect firing, pending, and silenced alerts at each level:'
        )}
      </Text>

      <SeverityHeading colorVar="--pf-t--global--text--color--status--danger--default" label={t('Critical')} />
      <Text component={TextVariants.p}>
        {t(
          'Severe platform problems requiring immediate attention, such as a missing OVN control plane or database connectivity loss.'
        )}
      </Text>

      <SeverityHeading colorVar="--pf-t--global--text--color--status--warning--default" label={t('Warning')} />
      <Text component={TextVariants.p}>
        {t('Moderate platform issues that should be reviewed, such as elevated database CPU or stale OVN state.')}
      </Text>

      <SeverityHeading colorVar="--pf-t--global--text--color--status--info--default" label={t('Info')} />
      <Text component={TextVariants.p}>
        {t('Minor platform observations worth noting, such as approaching subnet allocation thresholds.')}
      </Text>

      <Text component={TextVariants.h3}>{t('Alert States')}</Text>
      <Text component="p" className="health-scoring-list-item">
        <strong>{t('Firing')}</strong>: {t('Active alert condition - counted in severity totals')}
      </Text>
      <Text component="p" className="health-scoring-list-item">
        <strong>{t('Pending')}</strong>: {t('Condition detected, awaiting confirmation - counted in severity totals')}
      </Text>
      <Text component="p" className="health-scoring-list-item">
        <strong>{t('Silenced')}</strong>:{' '}
        {t('Known issue, temporarily ignored in Alertmanager - still shown here for visibility')}
      </Text>

      <Text component={TextVariants.h3}>{t('How the summary status is determined')}</Text>
      <Text component={TextVariants.p}>
        {t(
          // eslint-disable-next-line max-len
          'The status message reflects the highest severity with active alerts: critical issues take precedence over warnings, then info. When no alerts are active, the summary reports a healthy platform state.'
        )}
      </Text>

      <Text component={TextVariants.h3}>{t('Read-only platform view')}</Text>
      <Text component={TextVariants.p}>
        {t(
          'These alerts cannot be managed from NetObserv. Use OpenShift monitoring tools or cluster network operator runbooks to investigate and resolve platform issues.'
        )}
      </Text>
    </>
  );
};

const buildOvnDescriptor = (t: TFunction): ReadonlyContextDescriptor => ({
  displayName: t('OVN'),
  copy: {
    summaryLabel: t('OVN-Kubernetes platform alerts'),
    sectionDetails: t('Managed by the OpenShift cluster network operator. Not included in the NetObserv health score.'),
    globalHealthyTitle: t('No cluster-wide OVN platform alerts'),
    globalSectionTitle: t('Cluster-wide OVN alerts'),
    nodesHealthyTitle: t('No OVN platform alerts per node'),
    nodesSectionTitle: t('OVN alerts per node'),
    unavailableTitle: t('OVN platform alerts unavailable'),
    unavailableBody: t(
      'OpenShift OVN-Kubernetes platform alerts were not found. This tab is available on OpenShift clusters using the OVN-Kubernetes network plugin.'
    ),
    loadingLabel: t('Loading OVN platform alerts')
  },
  scoringTitle: t('Understanding OVN Alerts'),
  ScoringInfoContent: OvnScoringInfoContent
});

/**
 * Built-in descriptors keyed by context id. Currently only the temporary OVN shim; remove this
 * entry once CNO OVN alerts carry the netobserv_io_network_health annotation and can flow through
 * the generic path with their own displayName.
 */
const BUILTIN_DESCRIPTORS: Record<string, (t: TFunction) => ReadonlyContextDescriptor> = {
  [NETOBSERV_CONTEXT_OVN]: buildOvnDescriptor
};

/** Resolve the presentation descriptor for a read-only alerts context. */
export const getReadonlyContextDescriptor = (
  contextId: string,
  displayName: string,
  t: TFunction
): ReadonlyContextDescriptor => {
  const builder = BUILTIN_DESCRIPTORS[contextId];
  if (builder) {
    return builder(t);
  }
  return {
    displayName,
    copy: buildGenericReadonlyCopy(displayName, t),
    scoringTitle: t('Understanding {{title}} alerts', { title: displayName }),
    // eslint-disable-next-line react/display-name
    ScoringInfoContent: () => <GenericScoringInfoContent displayName={displayName} />
  };
};
