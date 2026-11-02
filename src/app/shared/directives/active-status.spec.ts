import { ActiveStatus } from './active-status';

describe('ActiveStatus', () => {
  it('should create an instance', () => {
    const directive = new ActiveStatus({} as any, {} as any);
    expect(directive).toBeTruthy();
  });
});
