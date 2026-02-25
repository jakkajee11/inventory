# CI/CD Setup

This document describes the CI/CD pipeline setup for the Inventory Management System.

## Overview

The project uses GitHub Actions for continuous integration and deployment with the following workflows:

1. **CI Pipeline** - Runs on push to main branches
2. **Deploy Pipeline** - Runs on tags and after CI success

## Workflows

### CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to main branches: `main`, `001-inventory-management`, `develop`
- Pull requests to main branches

**Jobs:**

1. **test**: Multi-node version testing (18.x, 20.x)
   - Installs dependencies with pnpm
   - Runs type checking
   - Runs linting
   - Runs tests with coverage
   - Uploads coverage to Codecov

2. **build**: Builds the applications
   - Downloads build artifacts from test job
   - Builds API and web applications
   - Uploads build artifacts

3. **docker-build**: Builds Docker images
   - Uses Docker Buildx
   - Pushes images to Docker Hub

### Deploy Workflow (`.github/workflows/deploy.yml`)

**Triggers:**
- Version tags (`v*.*.*`)
- After CI workflow completes on main branches

**Jobs:**

1. **deploy-staging**: Deploys to staging environment
   - Downloads build artifacts
   - Runs deployment commands
   - Notifies Slack on completion

2. **deploy-production**: Deploys to production environment
   - Only runs after staging deployment
   - Downloads build artifacts
   - Runs deployment commands
   - Notifies Slack on completion

3. **version-bump**: Handles version tagging
   - Downloads build artifacts
   - Updates package.json versions
   - Commits version bump
   - Builds and publishes Docker images

## Environment Variables

Required secrets:

- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password
- `SLACK_WEBHOOK`: Slack webhook URL for deployment notifications

## Docker Setup

### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## Multi-stage Docker Builds

The application uses multi-stage Docker builds for optimized production images:

### API Dockerfile (`apps/api/Dockerfile`)

- Stage 1: Base with Node.js 20 Alpine
- Stage 2: Install dependencies
- Stage 3: Build the application
- Stage 4: Production runtime image

### Web Dockerfile (`apps/web/Dockerfile`)

- Stage 1: Base with Node.js 20 Alpine
- Stage 2: Install dependencies
- Stage 3: Build with Next.js standalone output
- Stage 4: Production runtime image

## Turborepo Integration

The project uses Turborepo for workspace management:

- `turbo run dev`: Start all services in development
- `turbo run build`: Build all applications
- `turbo run test`: Run tests
- `turbo run lint`: Run linting
- `turbo run type-check`: Run type checking

## Scheduled Jobs

The system includes scheduled jobs using @nestjs/schedule:

- **Stock Alert Job**: Runs daily at 6:00 AM (Asia/Bangkok)
  - Checks low stock levels
  - Creates notifications for active users
  - Prevents duplicate alerts per product per day

## Notifications

The notification system includes:

- Real-time alerts for stock levels
- Email notifications (future enhancement)
- In-app notifications in the dashboard
- Push notifications (future enhancement)

## Deployment Strategy

1. **Development**: Direct push to develop branch
2. **Staging**: Push to develop or feature branch
3. **Production**: Merge to main branch after testing

## Monitoring

- Health checks for all services
- Application metrics (future enhancement)
- Error tracking (future enhancement)
- Deployment notifications via Slack

## Future Enhancements

- Kubernetes deployment
- Automatic scaling
- Blue-green deployment strategy
- Rollback on failure
- Performance monitoring