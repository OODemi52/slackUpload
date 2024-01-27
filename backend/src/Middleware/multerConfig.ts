import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    console.log(`Storing file in: ${uploadsDir}`); // Log the path
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const newFilename = Date.now() + path.extname(file.originalname);
    console.log(`Saving file as: ${newFilename}`); // Log the file name
    cb(null, newFilename);
  }
});

export const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5000000
    },
    fileFilter: (req, file, cb) => {
        // You can add file filter logic here if needed
        cb(null, true);
    },
    // Optional: Add limits if needed, e.g., fileSize: 1024 * 1024 * 10 // 10MB
});
