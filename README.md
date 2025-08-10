# Futuristic Social Dashboard

A modern, futuristic social media dashboard built with Next.js, Prisma, and Tailwind CSS.

## Features

- Modern UI with neon effects and glass morphism
- User authentication and authorization
- Post creation and management
- Image upload with Cloudinary
- Admin panel for content moderation
- Real-time statistics and progress tracking

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom auth with bcryptjs
- **File Upload**: Cloudinary
- **UI Components**: Radix UI

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database
- Cloudinary account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dash-7k
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

5. Set up the database:
```bash
npx prisma db push
```

6. Generate Prisma client:
```bash
npx prisma generate
```

7. Run the development server:
```bash
pnpm dev
```

## Deployment on Vercel

### Prerequisites

1. **Database**: Set up a PostgreSQL database (recommended: Supabase, Neon, or Railway)
2. **Environment Variables**: Configure all required environment variables in Vercel

### Required Environment Variables

Make sure to set these environment variables in your Vercel project:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Build Process

The project is configured to automatically generate the Prisma client during the build process. The build script includes:

```json
{
  "build": "prisma generate && next build"
}
```

This ensures that the Prisma client is always up-to-date with your database schema.

### Troubleshooting

If you encounter Prisma-related errors during deployment:

1. **Prisma Client Generation**: Ensure `DATABASE_URL` is properly configured
2. **Database Connection**: Verify that your database is accessible from Vercel's servers
3. **Schema Sync**: Make sure your database schema matches your Prisma schema

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
├── contexts/          # React contexts
├── lib/               # Utility functions
├── services/          # API services
└── types/             # TypeScript types
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
