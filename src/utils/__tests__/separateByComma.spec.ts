import { separateByComma } from '../separateByComma';

describe('separateByComma() should work correctly', () => {
  it('should return a comma separated string', () => {
    const output = separateByComma(['hey', 'jude', 'george']);

    expect(output).toBe('hey,jude,george');
  });
});
