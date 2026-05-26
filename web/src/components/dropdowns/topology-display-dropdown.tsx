import { Button, Popper } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { FlowScope, MetricType, StatFunction } from '../../model/flow-query';
import { ScopeConfigDef } from '../../model/scope';
import { TopologyOptions } from '../../model/topology';
import { useOutsideClickEvent } from '../../utils/outside-hook';
import './topology-display-dropdown.css';
import { TopologyDisplayOptions } from './topology-display-options';

export const TopologyDisplayDropdown: React.FC<{
  metricFunction: StatFunction;
  setMetricFunction: (f: StatFunction) => void;
  metricType: MetricType;
  setMetricType: (t: MetricType) => void;
  metricScope: FlowScope;
  setMetricScope: (s: FlowScope) => void;
  topologyOptions: TopologyOptions;
  setTopologyOptions: (o: TopologyOptions) => void;
  allowedTypes: MetricType[];
  scopes: ScopeConfigDef[];
  isTLSTracking: boolean;
}> = ({
  metricFunction,
  setMetricFunction,
  metricType,
  setMetricType,
  metricScope,
  setMetricScope,
  topologyOptions,
  setTopologyOptions,
  allowedTypes,
  scopes,
  isTLSTracking
}) => {
  const { t } = useTranslation('plugin__netobserv-plugin');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const popperRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = React.useState<boolean>(false);

  const ref = useOutsideClickEvent(() => setOpen(false));

  const trigger = React.useCallback(() => {
    return (
      <Button
        ref={triggerRef}
        variant="link"
        icon={<CogIcon />}
        onClick={() => setOpen(!isOpen)}
        data-test="display-dropdown-button"
      >
        {t('Display options')}
      </Button>
    );
  }, [isOpen, t]);

  const popper = React.useCallback(() => {
    return (
      <div id="topology-display-popper" ref={popperRef} className="pf-v5-c-menu" role="dialog">
        <TopologyDisplayOptions
          metricFunction={metricFunction}
          setMetricFunction={setMetricFunction}
          metricType={metricType}
          setMetricType={setMetricType}
          metricScope={metricScope}
          setMetricScope={setMetricScope}
          topologyOptions={topologyOptions}
          setTopologyOptions={setTopologyOptions}
          allowedTypes={allowedTypes}
          scopes={scopes}
          isTLSTracking={isTLSTracking}
        />
      </div>
    );
  }, [
    metricFunction,
    setMetricFunction,
    metricType,
    setMetricType,
    metricScope,
    setMetricScope,
    topologyOptions,
    setTopologyOptions,
    allowedTypes,
    scopes,
    isTLSTracking
  ]);

  return (
    <div id="display-dropdown-container" data-test="display-dropdown-container" ref={ref}>
      <div ref={containerRef}>
        <Popper
          trigger={trigger()}
          triggerRef={triggerRef}
          popper={popper()}
          popperRef={popperRef}
          isVisible={isOpen}
          enableFlip={true}
          appendTo={containerRef.current || undefined}
        />
      </div>
    </div>
  );
};

export default TopologyDisplayDropdown;
