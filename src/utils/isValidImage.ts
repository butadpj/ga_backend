import * as path from 'path';

export const isValidImage = (file: {
  originalname: string;
  mimetype: string;
}): boolean => {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mimeh
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return true;
  }
  return false;
};
