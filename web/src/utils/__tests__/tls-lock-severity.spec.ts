import {
  aggregateTlsLockSeverity,
  classifyTlsLockSeverity,
  classifyTlsVersionString,
  mergeTlsLockSeverities,
  tlsLockSeverityForGroupLabel
} from '../tls-lock-severity';

describe('classifyTlsVersionString', () => {
  it('should classify known pipeline TLSVersion values', () => {
    expect(classifyTlsVersionString('TLS 1.0')).toBe('deprecated');
    expect(classifyTlsVersionString('TLS 1.1')).toBe('deprecated');
    expect(classifyTlsVersionString('TLS 1.2')).toBe('legacy');
    expect(classifyTlsVersionString('TLS 1.3')).toBe('modern');
    expect(classifyTlsVersionString('SSLv3')).toBe('deprecated');
  });

  it('should strip approximate prefix', () => {
    expect(classifyTlsVersionString('~ TLS 1.3')).toBe('modern');
  });

  it('should return null for unknown labels', () => {
    expect(classifyTlsVersionString('0x0304')).toBeNull();
  });
});

describe('classifyTlsLockSeverity', () => {
  it('should upgrade TLS 1.3 with PQC group to pqc', () => {
    expect(classifyTlsLockSeverity('TLS 1.3', 'X25519MLKEM768')).toBe('pqc');
    expect(classifyTlsLockSeverity('TLS 1.3', 'Secp256r1MLKEM768')).toBe('pqc');
    expect(classifyTlsLockSeverity('TLS 1.3', 'Secp384r1MLKEM1024')).toBe('pqc');
  });

  it('should keep TLS 1.3 without PQC group as modern', () => {
    expect(classifyTlsLockSeverity('TLS 1.3', 'X25519')).toBe('modern');
  });
});

describe('aggregateTlsLockSeverity', () => {
  it('should pick worst among versions', () => {
    expect(aggregateTlsLockSeverity(['TLS 1.3', 'TLS 1.2'])).toBe('legacy');
    expect(aggregateTlsLockSeverity(['TLS 1.3', 'TLS 1.0'])).toBe('deprecated');
  });

  it('should detect PQC from TLS 1.3 and group labels on the same edge', () => {
    expect(aggregateTlsLockSeverity(['TLS 1.3'], ['X25519MLKEM768'])).toBe('pqc');
  });

  it('should prefer deprecated over PQC when both are observed', () => {
    expect(aggregateTlsLockSeverity(['TLS 1.0'], ['X25519MLKEM768'])).toBe('deprecated');
  });
});

describe('tlsLockSeverityForGroupLabel', () => {
  it('should mark PQC groups as pqc when TLS 1.3 is on the link', () => {
    expect(tlsLockSeverityForGroupLabel('X25519MLKEM768', ['TLS 1.3'])).toBe('pqc');
  });

  it('should not upgrade PQC groups without TLS 1.3', () => {
    expect(tlsLockSeverityForGroupLabel('X25519MLKEM768', ['TLS 1.2'])).toBe('unknown');
  });

  it('should treat non-PQC groups as unknown', () => {
    expect(tlsLockSeverityForGroupLabel('X25519', ['TLS 1.3'])).toBe('unknown');
  });
});

describe('mergeTlsLockSeverities', () => {
  it('should merge with worst winning', () => {
    expect(mergeTlsLockSeverities('modern', 'deprecated')).toBe('deprecated');
    expect(mergeTlsLockSeverities('pqc', 'modern')).toBe('pqc');
    expect(mergeTlsLockSeverities('pqc', 'deprecated')).toBe('deprecated');
    expect(mergeTlsLockSeverities('legacy', undefined)).toBe('legacy');
  });
});
