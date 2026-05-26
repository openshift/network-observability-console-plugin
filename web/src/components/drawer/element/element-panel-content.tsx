import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Button,
  Divider,
  Flex,
  FlexItem,
  Text,
  TextContent,
  TextVariants
} from '@patternfly/react-core';
import { FilterIcon, TimesIcon } from '@patternfly/react-icons';
import { BaseEdge, BaseNode } from '@patternfly/react-topology';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  createFilterValue,
  doesIncludeFilter,
  Filter,
  FilterCompare,
  FilterDefinition,
  Filters,
  type FilterId
} from '../../../model/filters';
import {
  EdgeTlsPanelData,
  GraphElementPeer,
  isElementFiltered,
  NodeData,
  toggleElementFilter,
  toggleQuickFilterValue
} from '../../../model/topology';
import { findFilter } from '../../../utils/filter-definitions';
import { createPeer } from '../../../utils/metrics';
import { tlsLockSeverityForGroupLabel } from '../../../utils/tls-lock-severity';
import { TlsSeverityLockIcon, TlsVersionLockIcon } from '../../icons/tls-lock-icons';
import { ElementFields } from './element-fields';

export interface ElementPanelContentProps {
  element: GraphElementPeer;
  filters: Filters;
  setFilters: (filters: Filter[]) => void;
  filterDefinitions: FilterDefinition[];
}

export const ElementPanelContent: React.FC<ElementPanelContentProps> = ({
  element,
  filters,
  setFilters,
  filterDefinitions
}) => {
  const { t } = useTranslation('plugin__netobserv-plugin');
  const [hidden, setHidden] = React.useState<string[]>([]);
  const data = element.getData();

  const toggle = React.useCallback(
    (id: string) => {
      const index = hidden.indexOf(id);
      const newExpanded: string[] =
        index >= 0 ? [...hidden.slice(0, index), ...hidden.slice(index + 1, hidden.length)] : [...hidden, id];
      setHidden(newExpanded);
    },
    [hidden]
  );

  const clusterName = React.useCallback(
    (d: NodeData) => {
      if (!d.peer.cluster) {
        return <></>;
      }
      const fields = createPeer({ cluster: d.peer.cluster });
      const isFiltered = isElementFiltered(fields, filters.list, filterDefinitions);
      return (
        <TextContent id="clusterName" className="record-field-container">
          <Text component={TextVariants.h4}>{t('Cluster name')}</Text>
          <Flex>
            <FlexItem flex={{ default: 'flex_1' }}>{d.peer.cluster}</FlexItem>
            <FlexItem>
              <Button
                id={'clustername-filter'}
                variant="plain"
                className="overflow-button"
                icon={isFiltered ? <TimesIcon /> : <FilterIcon />}
                onClick={() => toggleElementFilter(fields, isFiltered, filters.list, setFilters, filterDefinitions)}
              />
            </FlexItem>
          </Flex>
        </TextContent>
      );
    },
    [filterDefinitions, filters, setFilters, t]
  );

  const udnName = React.useCallback(
    (d: NodeData) => {
      if (!d.peer.udn) {
        return <></>;
      }
      const fields = createPeer({ udn: d.peer.udn });
      const isFiltered = isElementFiltered(fields, filters.list, filterDefinitions);
      return (
        <TextContent id="udn" className="record-field-container">
          <Text component={TextVariants.h4}>{t('UDN')}</Text>
          <Flex>
            <FlexItem flex={{ default: 'flex_1' }}>{d.peer.udn}</FlexItem>
            <FlexItem>
              <Button
                id={'udn-filter'}
                variant="plain"
                className="overflow-button"
                icon={isFiltered ? <TimesIcon /> : <FilterIcon />}
                onClick={() => toggleElementFilter(fields, isFiltered, filters.list, setFilters, filterDefinitions)}
              />
            </FlexItem>
          </Flex>
        </TextContent>
      );
    },
    [filterDefinitions, filters, setFilters, t]
  );

  const metricsInfo = React.useCallback(
    (d: NodeData) => {
      if (!d.noMetrics) {
        return <></>;
      }

      return (
        <TextContent id="noMetrics" className="record-field-container">
          <Text component={TextVariants.p}>
            {t(
              "Can't find metrics for this element. Check your capture filters to ensure we can monitor it. Else it probably means there is no traffic here."
            )}
          </Text>
        </TextContent>
      );
    },
    [t]
  );

  const edgeTlsInfo = React.useCallback(
    (d: EdgeTlsPanelData | undefined) => {
      const hasTlsData = (panel?: EdgeTlsPanelData) =>
        Boolean(panel?.tagTlsSecure) ||
        Boolean(panel?.tlsVersionLabels?.length) ||
        Boolean(panel?.tlsGroupLabels?.length);
      const panel = hasTlsData(d) ? d : undefined;
      if (!panel || !hasTlsData(panel)) {
        return <></>;
      }
      const { tagTlsSecure, tlsVersionLabels, tlsGroupLabels } = panel;
      const versionLabels = tlsVersionLabels ?? [];

      const renderTlsQuickFilter = (filterId: FilterId, value: string, buttonId: string) => {
        const def = findFilter(filterDefinitions, filterId);
        if (!def) {
          return null;
        }
        const filterKey = { def, compare: FilterCompare.equal };
        const filterValue = createFilterValue(def, value);
        const filterValues = [filterValue];
        const isFiltered = doesIncludeFilter(filters.list, filterKey, filterValues);
        return (
          <Button
            id={buttonId}
            data-test={`quick-filter-${filterId}-${value}`}
            variant="plain"
            className="overflow-button"
            icon={isFiltered ? <TimesIcon /> : <FilterIcon />}
            aria-label={
              isFiltered ? t('Clear filter for {{value}}', { value }) : t('Apply filter for {{value}}', { value })
            }
            onClick={() => toggleQuickFilterValue(def, value, isFiltered, filters.list, setFilters)}
          />
        );
      };

      return (
        <TextContent id="edge-tls-info" className="record-field-container">
          <Text component={TextVariants.h4}>{t('TLS')}</Text>
          {tagTlsSecure ? (
            <Flex>
              <FlexItem flex={{ default: 'flex_1' }}>
                <Text component={TextVariants.p}>
                  {t('TLS-encrypted traffic was observed on this link for the selected scope and time range.')}
                </Text>
              </FlexItem>
            </Flex>
          ) : null}
          {versionLabels.length > 0 ? (
            <>
              <Text component={TextVariants.h4}>{t('TLS versions')}</Text>
              <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                {versionLabels.map((label, i) => {
                  const versionFilterBtn = renderTlsQuickFilter('tls_version', label, `edge-tls-version-filter-${i}`);
                  return (
                    <Flex key={`${label}-${i}`} alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                      <TlsVersionLockIcon versionLabel={label} />
                      <FlexItem flex={{ default: 'flex_1' }}>
                        <Text component={TextVariants.p}>{label}</Text>
                      </FlexItem>
                      {versionFilterBtn ? <FlexItem>{versionFilterBtn}</FlexItem> : null}
                    </Flex>
                  );
                })}
              </Flex>
            </>
          ) : null}
          {tlsGroupLabels && tlsGroupLabels.length > 0 ? (
            <>
              <Text component={TextVariants.h4}>{t('TLS groups')}</Text>
              <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                {tlsGroupLabels.map((label, i) => {
                  const groupFilterBtn = renderTlsQuickFilter('tls_group', label, `edge-tls-group-filter-${i}`);
                  const groupSeverity = tlsLockSeverityForGroupLabel(label, versionLabels);
                  return (
                    <Flex key={`${label}-${i}`} alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                      <TlsSeverityLockIcon severity={groupSeverity} />
                      <FlexItem flex={{ default: 'flex_1' }}>
                        <Text component={TextVariants.p}>{label}</Text>
                      </FlexItem>
                      {groupFilterBtn ? <FlexItem>{groupFilterBtn}</FlexItem> : null}
                    </Flex>
                  );
                })}
              </Flex>
            </>
          ) : null}
        </TextContent>
      );
    },
    [filterDefinitions, filters, setFilters, t]
  );

  if (element instanceof BaseNode && data) {
    return (
      <>
        {clusterName(data)}
        {udnName(data)}
        <ElementFields
          id="node-info"
          data={data}
          forceFirstAsText={true}
          filters={filters}
          setFilters={setFilters}
          filterDefinitions={filterDefinitions}
        />
        {metricsInfo(data)}
      </>
    );
  } else if (element instanceof BaseEdge) {
    // Edge A to B (prefering neutral naming here as there is no assumption about what is source, what is destination
    const aData: NodeData = element.getSource().getData();
    const bData: NodeData = element.getTarget().getData();
    const edgeData = element.getData();
    const combinedData = Object.assign({}, aData, bData);
    return (
      <>
        {clusterName(combinedData)}
        {udnName(combinedData)}
        <Accordion asDefinitionList={false}>
          <div className="record-group-container" key={'source'} data-test-id={'source'}>
            <AccordionItem data-test-id={'source'}>
              <AccordionToggle
                className="borderless-accordion"
                onClick={() => toggle('source')}
                id={'source'}
                isExpanded={!hidden.includes('source')}
              >
                {filters.match === 'bidirectional' ? t('Endpoint A') : t('Source')}
              </AccordionToggle>
              <AccordionContent
                className="borderless-accordion"
                id="source-content"
                isHidden={hidden.includes('source')}
              >
                <ElementFields
                  id="source-info"
                  data={aData}
                  filters={filters}
                  setFilters={setFilters}
                  filterDefinitions={filterDefinitions}
                />
              </AccordionContent>
            </AccordionItem>
          </div>
          <div className="record-group-container" key={'destination'} data-test-id={'destination'}>
            <Divider />
            <AccordionItem data-test-id={'destination'}>
              <AccordionToggle
                className="borderless-accordion"
                onClick={() => toggle('destination')}
                id={'destination'}
                isExpanded={!hidden.includes('destination')}
              >
                {filters.match === 'bidirectional' ? t('Endpoint B') : t('Destination')}
              </AccordionToggle>
              <AccordionContent
                className="borderless-accordion"
                id="destination-content"
                isHidden={hidden.includes('destination')}
              >
                <ElementFields
                  id="destination-info"
                  data={bData}
                  filters={filters}
                  setFilters={setFilters}
                  filterDefinitions={filterDefinitions}
                />
              </AccordionContent>
            </AccordionItem>
          </div>
        </Accordion>
        {edgeTlsInfo(edgeData)}
      </>
    );
  }
  return <></>;
};

export default ElementPanelContent;
