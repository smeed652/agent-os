# Tech Stack

## Context

Global tech stack defaults for Agent OS projects, overridable in project-specific `.agent-os/product/tech-stack.md`.

- App Framework: Ruby on Rails 8.0+
- Language: Ruby 3.2+
- Primary Database: PostgreSQL 17+
- ORM: Active Record
- JavaScript Framework: React latest stable
- Build Tool: Vite
- Import Strategy: Node.js modules
- Package Manager: npm
- Node Version: 22 LTS
- CSS Framework: TailwindCSS 4.0+
- UI Components: Instrumental Components latest
- UI Installation: Via development gems group
- Font Provider: Google Fonts
- Font Loading: Self-hosted for performance
- Icons: Lucide React components
- Application Hosting: Digital Ocean App Platform/Droplets
- Hosting Region: Primary region based on user base
- Database Hosting: Digital Ocean Managed PostgreSQL
- Database Backups: Daily automated
- Asset Storage: Amazon S3
- CDN: CloudFront
- Asset Access: Private with signed URLs
- CI/CD Platform: GitHub Actions
- CI/CD Trigger: Push to main/staging branches
- Tests: Run before deployment
- Production Environment: production branch (manual deployment)
- Staging Environment: main branch (auto-deploy)
- Release Management: Release branches with automatic changelog generation
- Version Control: Git with conventional commits
- Deployment Platform: AWS Amplify (or project-specific)
- Release Workflow: Feature Branch → Main → Release Branch → Production
- Changelog Generation: Automatic from conventional commits
- Version Management: Semantic versioning (major.minor.patch)
