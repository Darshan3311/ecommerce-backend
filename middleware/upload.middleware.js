const multer = require('multer');
const path = require('path');
const { ErrorHandler } = require('./error.middleware');

class UploadMiddleware {
  constructor() {
    this.storage = multer.memoryStorage();
    this.upload = multer({
      storage: this.storage,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
      },
      fileFilter: this.fileFilter
    });
  }

  fileFilter(req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new ErrorHandler('Only image files are allowed (jpeg, jpg, png, gif, webp)', 400));
    }
  }

  single(fieldName) {
    return this.upload.single(fieldName);
  }

  multiple(fieldName, maxCount = 10) {
    return this.upload.array(fieldName, maxCount);
  }

  fields(fieldsArray) {
    return this.upload.fields(fieldsArray);
  }
}

module.exports = new UploadMiddleware();
