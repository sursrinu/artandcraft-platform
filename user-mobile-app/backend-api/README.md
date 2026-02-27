# Art & Craft Backend API

REST API backend for the Art & Craft E-Commerce Platform.

## Features

- User authentication & authorization
- Product management & catalog
- Order processing
- Payment gateway integration
- Vendor management
- Analytics & reporting
- Real-time notifications
- Image upload & management

## Tech Stack

- **Framework**: Express.js
- **Database**: MySQL
- **Cache**: Redis
- **Authentication**: JWT
- **Payment**: Stripe
- **Image Storage**: Cloudinary

## Quick Start

### Installation

```bash
npm install
```

### Configuration

1. Copy environment template:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration

### Database Setup

```bash
npm run migrate
npm run seed
```

### Development

```bash
npm run dev
```

Server will start at `http://localhost:3000`

### Health Check

```bash
curl http://localhost:3000/health
```

## API Documentation

API docs available at `http://localhost:3000/api/v1/docs`

### Key Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/products` - Get products
- `GET /api/v1/orders` - Get orders
- `POST /api/v1/payments` - Process payment

See [API_SPECIFICATION.md](../docs/API_SPECIFICATION.md) for complete documentation.

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utilities & helpers
├── validators/      # Input validation
└── index.js         # Application entry point
```

## Testing

```bash
npm test
npm run test:watch
```

## Linting

```bash
npm run lint
npm run lint:fix
```

## Environment Variables

See `.env.example` for all available configuration options.

## Error Handling

API returns standardized error responses:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message"
}
```

## Security

- CORS enabled
- Helmet.js for HTTP headers
- Rate limiting enabled
- Input validation with Joi
- JWT token authentication
- Password hashing with bcryptjs

## Database Migrations

Run migrations:
```bash
npm run migrate
```

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t artandcraft-api .
docker run -p 3000:3000 artandcraft-api
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Submit a pull request

## License

MIT
