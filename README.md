# Face Recognition Attendance System

A robust backend system for marking attendance using facial recognition technology. This system uses FaceApi.js and Tensorflow.js for face detection and a custom similarity algorithm for face matching.

## Features

- User registration and authentication
- Face profile upload and storage
- Face recognition for attendance marking
- Check-in and check-out functionality
- Secure API endpoints with JWT authentication

## Technologies Used

- Node.js and Express.js
- MongoDB with Mongoose
- Face-api.js for face detection
- Cloudinary for image storage
- JWT for authentication
- Multer for file uploads

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Face-api.js with tensorflow/tfjs-node enviroment
- Cloudinary account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CORS_ORIGIN=http://localhost:3000
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables
4. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### User Routes

- `POST /api/users/invite` - Invite a new user
- `POST /api/users/login` - Login a user
- `POST /api/users/refresh-token` - Refresh access token
- `POST /api/users/logout` - Logout a user
- `POST /api/users/updateUser` - Upload face profile image and other details

### Attendance Routes

- `POST /api/v1/attendance/mark-attendance` - Mark attendance using face recognition

## Face Recognition Process

1. User uploads a face image for attendance
2. System detects faces in the uploaded image using Google Vision API
3. System retrieves the user's stored face profile
4. System compares the detected face with the stored face using a custom similarity algorithm
5. If the faces match, attendance is marked (check-in or check-out)
6. If the faces don't match, an error is returned

## Security Considerations

- All API endpoints (except registration and login) require JWT authentication
- Face images are stored securely on Cloudinary
- Temporary files are cleaned up after processing
- Input validation and error handling are implemented

## License

ISC 