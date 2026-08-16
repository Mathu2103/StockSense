import { Request, Response } from 'express';
import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file provided' });
      return;
    }

    // Upload buffer to Cloudinary using upload_stream with Node Readable stream
    const uploadToCloudinary = () => {
      return new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'stocksense',
            resource_type: 'image',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        const readable = new Readable();
        readable._read = () => {};
        readable.push(req.file!.buffer);
        readable.push(null);
        readable.pipe(stream);
      });
    };

    const result = await uploadToCloudinary();

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully to Cloudinary',
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image to Cloudinary',
    });
  }
};
