import { isValidImage } from '..';

describe('isValidImage() should work correctly', () => {
  it('should return true if file is a valid image, else return false', () => {
    const mockFile = {
      originalname: 'header-bg.jpg',
      mimetype: 'image/jpeg',
    };

    const output = isValidImage(mockFile);

    expect(output).toBe(true);
  });
});
