import { Button, Popper } from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DataSource, PacketLoss, RecordType } from '../../model/flow-query';
import { useOutsideClickEvent } from '../../utils/outside-hook';
import './query-options-dropdown.css';
import { QueryOptionsPanel } from './query-options-panel';

export interface QueryOptionsProps {
  recordType: RecordType;
  setRecordType: (recordType: RecordType) => void;
  dataSource: DataSource;
  setDataSource: (dataSource: DataSource) => void;
  allowLoki: boolean;
  allowProm: boolean;
  allowFlow: boolean;
  allowConnection: boolean;
  allowPktDrops: boolean;
  useTopK: boolean;
  limit: number;
  setLimit: (limit: number) => void;
  packetLoss: PacketLoss;
  setPacketLoss: (pl: PacketLoss) => void;
}

export const QueryOptionsDropdown: React.FC<QueryOptionsProps> = props => {
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
        className="overflow-button"
        onClick={() => setOpen(!isOpen)}
        data-test="query-options-dropdown"
      >
        {t('Query options')}
      </Button>
    );
  }, [isOpen, t]);

  const popper = React.useCallback(() => {
    return (
      <div id="query-options-popper" ref={popperRef} className="pf-v6-c-menu" role="dialog">
        <QueryOptionsPanel {...props} />
      </div>
    );
  }, [props]);

  return (
    <div id="query-options-dropdown-container" data-test="query-options-dropdown-container" ref={ref}>
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

export default QueryOptionsDropdown;
