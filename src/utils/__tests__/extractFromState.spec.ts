import { extractFromState } from '..';

describe('extractFromState()', () => {
  it('', () => {
    const expectedOutput = {
      email: 'hey@gmail.com',
      redirect_page: '/my-profile',
    };

    const extractedState = extractFromState(
      ':emailhey@gmail.com:&:redirect_page/my-profile:',
      ['email', 'redirect_page'],
    );

    expect(extractedState).toMatchObject(expectedOutput);
  });
});
