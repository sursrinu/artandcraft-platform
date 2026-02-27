# Art & Craft Admin Panel

Laravel-based admin dashboard for the Art & Craft E-Commerce Platform.

## Features

- Admin login & authentication
- Vendor management & approval
- Product moderation
- Order management
- Transaction monitoring
- Commission management
- Analytics dashboard
- Reports generation
- System configuration

## Tech Stack

- **Framework**: Laravel 10
- **Frontend**: Blade templates (or Vue.js)
- **Database**: MySQL
- **Authentication**: Laravel Sanctum
- **Package Manager**: Composer

## Quick Start

### Installation

```bash
composer install
```

### Configuration

1. Copy environment file:
```bash
cp .env.example .env
```

2. Generate application key:
```bash
php artisan key:generate
```

3. Update database credentials in `.env`

### Database Setup

```bash
php artisan migrate
php artisan db:seed
```

### Run Application

```bash
php artisan serve
```

Application will be available at `http://localhost:8000`

## Project Structure

```
app/
├── Http/
│   ├── Controllers/     # Admin controllers
│   ├── Middleware/      # Custom middleware
│   └── Requests/        # Form requests & validation
├── Models/              # Eloquent models
├── Services/            # Business logic
└── Policies/            # Authorization policies

resources/
├── views/               # Blade templates
│   ├── layouts/
│   ├── auth/
│   ├── dashboard/
│   ├── vendors/
│   ├── products/
│   ├── orders/
│   └── reports/
└── css/                 # Stylesheet

routes/
├── web.php              # Web routes
└── api.php              # API routes (if using API)

database/
├── migrations/          # Database migrations
├── seeders/             # Database seeders
└── factories/           # Model factories
```

## Authentication

Admin login via `/login` route with admin credentials.

Role-based access control (RBAC) using Laravel Permission package.

## Database Tables

- admins/users
- vendors
- products
- categories
- orders
- payments
- commissions
- reports
- activity_logs

See [DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md) for complete schema.

## API Integration

Admin panel communicates with backend API at:
```
API_BASE_URL=http://localhost:3000/api/v1
```

Configure in `.env` file.

## Key Routes

- `/dashboard` - Admin dashboard
- `/vendors` - Vendor management
- `/products` - Product moderation
- `/orders` - Order management
- `/reports` - Analytics & reports
- `/settings` - System configuration

## Testing

```bash
php artisan test
```

## Artisan Commands

Common commands:

```bash
php artisan migrate           # Run migrations
php artisan db:seed          # Seed database
php artisan tinker           # Interactive shell
php artisan make:controller  # Create controller
php artisan make:model       # Create model
php artisan make:migration   # Create migration
```

## Dependencies

Key packages:
- `laravel/sanctum` - API authentication
- `spatie/laravel-permission` - Role-based access
- `maatwebsite/excel` - Excel export
- `barryvdh/laravel-dompdf` - PDF generation
- `intervention/image` - Image manipulation

## Security

- CSRF protection enabled
- SQL injection prevention (Eloquent)
- Password hashing with bcrypt
- Rate limiting on login
- Activity logging

## Development

### Code Style

```bash
php artisan pint      # Format code
```

### Debugging

Enable debug mode in `.env`:
```
APP_DEBUG=true
```

Use Laravel Debugbar for profiling.

## Deployment

### Production Setup

1. Set environment to production:
```
APP_ENV=production
APP_DEBUG=false
```

2. Cache configuration:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

3. Setup database:
```bash
php artisan migrate --force
```

## License

MIT
