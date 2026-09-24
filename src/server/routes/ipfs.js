const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Upload files to IPFS (mock implementation)
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadResults = req.files.map(file => {
      // In a real implementation, you would upload to IPFS here
      // For now, we'll simulate the response
      const mockHash = `Qm${uuidv4().replace(/-/g, '')}`;
      const mockUrl = `${process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/'}${mockHash}`;
      
      return {
        hash: mockHash,
        url: mockUrl,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      };
    });

    res.json(uploadResults);
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Upload single file
router.post('/upload-single', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Mock IPFS upload
    const mockHash = `Qm${uuidv4().replace(/-/g, '')}`;
    const mockUrl = `${process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/'}${mockHash}`;
    
    const result = {
      hash: mockHash,
      url: mockUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    res.json(result);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get file from IPFS (mock implementation)
router.get('/:hash', (req, res) => {
  try {
    const { hash } = req.params;
    
    // In a real implementation, you would fetch from IPFS
    // For now, we'll return a mock response
    const mockUrl = `${process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/'}${hash}`;
    
    res.json({
      hash,
      url: mockUrl,
      message: 'File retrieved from IPFS (mock)'
    });
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
});

// Pin file to IPFS (mock implementation)
router.post('/pin/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    // In a real implementation, you would pin to IPFS
    res.json({
      hash,
      pinned: true,
      message: 'File pinned to IPFS (mock)'
    });
  } catch (error) {
    console.error('Error pinning file:', error);
    res.status(500).json({ error: 'Failed to pin file' });
  }
});

// Unpin file from IPFS (mock implementation)
router.delete('/pin/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    // In a real implementation, you would unpin from IPFS
    res.json({
      hash,
      unpinned: true,
      message: 'File unpinned from IPFS (mock)'
    });
  } catch (error) {
    console.error('Error unpinning file:', error);
    res.status(500).json({ error: 'Failed to unpin file' });
  }
});

module.exports = router;
