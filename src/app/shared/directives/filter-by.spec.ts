import { FilterBy } from './filter-by';

describe('FilterBy', () => {
  it('should create an instance', () => {
    const directive = new FilterBy(null as any, null as any);
    expect(directive).toBeTruthy();
  });
});
