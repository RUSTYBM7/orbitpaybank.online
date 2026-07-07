/**
 * Smoke tests for admin-portal/src/lib/api-stub.ts (FIX-16 + FIX-03/04a).
 *
 * Verifies the Proxy auto-handles any method call and returns a uniform envelope.
 */

import { describe, it, expect } from 'vitest';
import { makeStubApi, empty } from '@/lib/api-stub';

describe('api-stub', () => {
  it('any method returns a uniform ApiEnvelope', async () => {
    const membersApi = makeStubApi();
    const result = await membersApi.getAll({ filter: 'active' });
    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('exposes __isStub for debugging', () => {
    const api = makeStubApi();
    expect(api.__isStub).toBe(true);
  });

  it('handles property access that is not a method', () => {
    const api = makeStubApi() as unknown as { someNonExistent: unknown };
    expect(api.someNonExistent).toBeDefined();
  });

  it('empty() returns success envelope with empty array default', () => {
    const env = empty();
    expect(env.success).toBe(true);
    expect(env.data).toEqual([]);
  });

  it('empty(T) honors the type parameter', () => {
    const env = empty({ foo: 'bar' });
    expect(env.data).toEqual({ foo: 'bar' });
  });
});