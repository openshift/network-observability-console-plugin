import {
  aggregateByWithTlsVersion,
  isTimeMetric,
  showTLSHints,
  topologyTlsVersionAggregateSuffix
} from '../flow-query';

describe('isTimeMetric', () => {
  it('should be true for DNS latency and RTT', () => {
    expect(isTimeMetric('DnsLatencyMs')).toBe(true);
    expect(isTimeMetric('TimeFlowRttNs')).toBe(true);
  });

  it('should be false for volume metrics', () => {
    expect(isTimeMetric('Bytes')).toBe(false);
    expect(isTimeMetric('Packets')).toBe(false);
  });

  it('should be false when undefined', () => {
    expect(isTimeMetric(undefined)).toBe(false);
  });
});

describe('aggregateByWithTlsVersion', () => {
  it('should append the TLS version dimension suffix', () => {
    expect(topologyTlsVersionAggregateSuffix).toBe('__TLSVersion');
    expect(aggregateByWithTlsVersion('owner')).toBe('owner__TLSVersion');
  });
});

describe('isTopologyTlsMetric', () => {
  it('should be true for volume metrics', () => {
    expect(showTLSHints('Bytes')).toBe(true);
    expect(showTLSHints('Packets')).toBe(true);
    expect(showTLSHints('PktDropBytes')).toBe(true);
    expect(showTLSHints('PktDropPackets')).toBe(true);
  });

  it('should be false for DNS, RTT, and undefined', () => {
    expect(showTLSHints('DnsLatencyMs')).toBe(false);
    expect(showTLSHints('TimeFlowRttNs')).toBe(false);
    expect(showTLSHints(undefined)).toBe(false);
  });
});
