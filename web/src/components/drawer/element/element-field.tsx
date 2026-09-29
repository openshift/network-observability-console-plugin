import { Content, ContentVariants, Flex, FlexItem } from '@patternfly/react-core';
import * as React from 'react';
import { TopologyMetricPeer } from '../../../api/query-response';
import { Filter, FilterDefinition, Filters } from '../../../model/filters';
import { NodeType } from '../../../model/flow-query';
import { PeerResourceLink } from '../../tabs/netflow-topology/peer-resource-link';
import { SummaryFilterButton } from '../../toolbar/filters/summary-filter-button';

export interface ElementFieldProps {
  id: string;
  label: string;
  filterType: NodeType;
  forcedText?: string;
  peer: TopologyMetricPeer;
  filters: Filters;
  setFilters: (filters: Filter[]) => void;
  filterDefinitions: FilterDefinition[];
}

export const ElementField: React.FC<ElementFieldProps> = ({
  id,
  label,
  filterType,
  forcedText,
  peer,
  filters,
  setFilters,
  filterDefinitions
}) => {
  return (
    <Content id={id} className="record-field-container">
      <Content component={ContentVariants.h4}>{label}</Content>
      <Flex>
        <FlexItem flex={{ default: 'flex_1' }}>
          {forcedText ? <Content component="p">{forcedText}</Content> : <PeerResourceLink peer={peer} />}
        </FlexItem>
        <FlexItem>
          <SummaryFilterButton
            id={id + '-filter'}
            filters={filters}
            filterType={filterType}
            fields={peer}
            setFilters={setFilters}
            filterDefinitions={filterDefinitions}
          />
        </FlexItem>
      </Flex>
    </Content>
  );
};
