
# Bus Booking System API

A comprehensive backend API for a bus booking system built with Express.js, MongoDB, and JWT authentication.

## Features

### Admin Role
- **Bus Management**: Add and update buses with details like capacity, type, and amenities
- **Route Management**: Create and manage bus routes with origin, destination, and stops
- **Schedule Management**: Create bus schedules with pricing and timing

### User Role
- **Bus Search**: Search for available buses by origin, destination, and date
- **Booking Management**: Book buses and cancel bookings with automatic refund calculation
- **Booking History**: View all previous and current bookings

### Security Features
- JWT authentication with refresh token functionality
- Role-based authorization (Admin/User)
- Input validation and sanitization
- Rate limiting to prevent abuse
- Secure password hashing with bcrypt

## Technology Stack

- **Backend Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with refresh tokens
- **Security**: Helmet, CORS, Rate limiting
- **Documentation**: Swagger/OpenAPI 3.0
- **Containerization**: Docker and Docker Compose

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- Docker (optional, for containerized deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bus-booking-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/bus-booking
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key
   FRONTEND_URL=http://localhost:8080
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the API**
   - API Base URL: `http://localhost:5000`
   - API Documentation: `http://localhost:5000/api-docs`
   - Health Check: `http://localhost:5000/health`

### Docker Deployment

1. **Using Docker Compose (Recommended)**
   ```bash
   docker-compose up -d
   ```

2. **Manual Docker Build**
   ```bash
   # Build the image
   docker build -t bus-booking-api .
   
   # Run with MongoDB
   docker network create bus-network
   docker run -d --name mongodb --network bus-network mongo:6.0
   docker run -d --name bus-api --network bus-network -p 5000:5000 \
     -e MONGODB_URI=mongodb://mongodb:27017/bus-booking \
     bus-booking-api
   ```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Admin Endpoints (Requires admin role)

- `POST /api/admin/buses` - Add a new bus
- `PUT /api/admin/buses/:id` - Update bus details
- `POST /api/admin/routes` - Add a new route
- `PUT /api/admin/routes/:id` - Update route details
- `POST /api/admin/schedules` - Create bus schedule

### User Endpoints (Requires authentication)

- `GET /api/user/search` - Search available buses
- `POST /api/user/book` - Book a bus
- `GET /api/user/bookings` - Get user bookings
- `PUT /api/user/bookings/:id/cancel` - Cancel a booking

## API Usage Examples

### 1. Register Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### 3. Add Bus (Admin)
```bash
curl -X POST http://localhost:5000/api/admin/buses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "busNumber": "MH12AB1234",
    "capacity": 40,
    "type": "AC",
    "amenities": ["WiFi", "Charging Point", "Water Bottle"]
  }'
```

### 4. Search Buses (User)
```bash
curl -X GET "http://localhost:5000/api/user/search?origin=Mumbai&destination=Pune&date=2024-07-01" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Postman Collection

Import the `postman-collection.json` file into Postman to test all API endpoints with pre-configured requests and examples.

## Database Schema

### User
- Email, password, name, role (admin/user)
- Refresh tokens for JWT management

### Bus
- Bus number, capacity, type (AC/Non-AC/Sleeper/Semi-Sleeper)
- Amenities array, active status

### Route
- Route name, origin, destination, distance, duration
- Intermediate stops array

### Bus Schedule
- Bus and route references, departure/arrival times
- Date, price, available seats, booked seats

### Booking
- User and schedule references, seat numbers, total amount
- Passenger details, payment status, booking status
- Cancellation and refund information

## Security Considerations

1. **JWT Security**: Uses separate secrets for access and refresh tokens
2. **Password Security**: Bcrypt with 12 salt rounds
3. **Rate Limiting**: 100 requests per 15 minutes per IP
4. **Input Validation**: Mongoose schema validation
5. **CORS**: Configured for specific frontend origins
6. **Helmet**: Security headers for Express apps

## AWS EC2 Deployment

### Prerequisites
- AWS EC2 instance (Ubuntu 20.04 LTS recommended)
- Docker and Docker Compose installed
- Domain name (optional)
- SSL certificate (recommended for production)

### Deployment Steps

1. **Connect to EC2 instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Update system and install Docker**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install docker.io docker-compose -y
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker ubuntu
   ```

3. **Clone and deploy**
   ```bash
   git clone <your-repository>
   cd bus-booking-system
   
   # Update environment variables for production
   cp .env.example .env
   nano .env
   
   # Deploy with Docker Compose
   docker-compose up -d
   ```

4. **Configure security groups**
   - Allow inbound traffic on port 5000 (API)
   - Allow inbound traffic on port 22 (SSH)
   - Allow inbound traffic on port 80/443 (if using reverse proxy)

5. **Set up reverse proxy (recommended)**
   ```bash
   # Install Nginx
   sudo apt install nginx -y
   
   # Configure Nginx (create /etc/nginx/sites-available/bus-booking)
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## Performance Optimization

1. **Database Indexing**: Add indexes for frequently queried fields
2. **Caching**: Implement Redis for session management and caching
3. **Load Balancing**: Use multiple instances behind a load balancer
4. **CDN**: Use CloudFront for static content delivery
5. **Monitoring**: Implement logging and monitoring with CloudWatch

## Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in the repository or contact the development team.
