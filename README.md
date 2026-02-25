# Inventory Management System

A modern, multi-tenant inventory management system built with NestJS and Next.js.

## 🚀 Features

- Multi-tenant architecture
- Real-time inventory tracking
- Goods receipt and issue management
- Stock adjustments
- Low stock and out-of-stock alerts
- Comprehensive reporting
- Docker support
- CI/CD pipelines

## 🏗️ Architecture

The application follows a monorepo structure using Turborepo patterns:

```
inventory/
├── apps/
│   ├── api/          # NestJS backend API
│   └── web/          # Next.js frontend application
├── packages/         # Shared packages
├── .github/          # GitHub workflows
├── docker-compose.yml
└── README.md
```

## 🛠️ Prerequisites

- Node.js 20.x
- pnpm 8.x
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

## 📦 Installation

### Using pnpm (Recommended)

```bash
# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install
```

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# Run migrations
docker-compose exec api npm run db:migrate

# Seed the database
docker-compose exec api npm run db:seed
```

## 🔧 Setup

### 1. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Run migrations (if needed)
pnpm db:migrate

# Seed the database
pnpm db:seed
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://inventory_user:inventory_password@localhost:5432/inventory_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key-here"

# API Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

### 3. Start Development Servers

```bash
# Start API server
pnpm --filter api dev

# Start web application (in another terminal)
pnpm --filter web dev
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:cov

# Run API tests
pnpm --filter api test

# Run web tests
pnpm --filter web test
```

## 🏗️ Building for Production

```bash
# Build all applications
pnpm build

# Or build individually
pnpm --filter api build
pnpm --filter web build
```

## 🚢 Docker Commands

### Development

```bash
# Build and run in detached mode
docker-compose up -d

# Stop and remove containers
docker-compose down

# View logs
docker-compose logs -f

# Rebuild services
docker-compose build --no-cache
```

### Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml up -d --build

# Stop production services
docker-compose -f docker-compose.prod.yml down
```

## 🔔 Notifications

The system includes automated stock alerts:

- **Low Stock Alerts**: Triggered when stock falls below minimum level
- **Out of Stock Alerts**: Triggered when stock reaches zero
- **Schedule**: Runs daily at 6:00 AM (Asia/Bangkok timezone)

Alerts are automatically generated and sent to active users in the respective companies.

## 🔄 CI/CD

The project includes GitHub workflows for:

- **CI Pipeline** (`.github/workflows/ci.yml`):
  - Multi Node.js version testing
  - Linting and type checking
  - Build verification
  - Docker image builds

- **Deploy Pipeline** (`.github/workflows/deploy.yml`):
  - Staging deployments
  - Production deployments
  - Version tagging
  - Slack notifications

## 🧪 API Documentation

The API includes Swagger/OpenAPI documentation available at:
- Development: `http://localhost:3000/api/docs`
- Production: `https://your-domain.com/api/docs`

## 📊 Development Workflow

1. **Setup** - Install dependencies and configure environment
2. **Development** - Use pnpm for workspace management
3. **Testing** - Run tests before committing
4. **Linting** - Run `pnpm lint` to ensure code quality
5. **Building** - Test builds before deploying

## 🔐 Security

- JWT-based authentication
- Role-based access control
- Rate limiting
- Input validation
- CORS configuration

## 🚀 Deployment

### Manual Deployment

```bash
# Build the project
pnpm build

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Automated Deployment

The CI/CD pipeline automatically deploys to staging on push to `develop` branch and to production on push to `main` branch.

## 📚 Resources

- [NestJS Documentation](https://nestjs.com)
- [Next.js Documentation](https://nextjs.org)
- [Prisma Documentation](https://prisma.io)
- [Docker Documentation](https://docker.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.