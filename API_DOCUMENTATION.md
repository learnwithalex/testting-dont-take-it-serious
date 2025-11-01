# Etheryte NFT Marketplace API Documentation

## Overview

This document provides comprehensive documentation for all API routes and schemas used in the Etheryte NFT Marketplace. The API is built with Next.js 14 App Router and uses Prisma ORM with PostgreSQL.

## Base URL
```
https://your-domain.com/api
```

## Authentication

Most endpoints require authentication via JWT tokens stored in HTTP-only cookies. The authentication system uses:
- `auth-token`: Main authentication token
- `access-token`: Short-lived access token
- `refresh-token`: Long-lived refresh token
- `csrf-token`: CSRF protection token
- `user-data`: Encrypted user data

## Database Models

### User
```typescript
interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  walletAddress?: string
  isVerified: boolean
  isAdmin: boolean
  avatar?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}
```

### NFT
```typescript
interface NFT {
  id: string
  tokenId: string
  name: string
  description?: string
  image: string
  price?: number
  category?: string
  isListed: boolean
  isSold: boolean
  creatorId: string
  collectionId?: string
  createdAt: Date
  updatedAt: Date
}
```

### Collection
```typescript
interface Collection {
  id: string
  name: string
  description?: string
  image?: string
  slug: string
  isVerified: boolean
  creatorId: string
  createdAt: Date
  updatedAt: Date
}
```

### Transaction
```typescript
interface Transaction {
  id: string
  nftId: string
  userId: string
  amount: number
  txHash: string
  type: 'SALE' | 'TRANSFER' | 'MINT'
  createdAt: Date
}
```

### Auction
```typescript
interface Auction {
  id: string
  nftId: string
  sellerId: string
  startPrice: number
  reservePrice?: number
  currentPrice: number
  startTime: Date
  endTime: Date
  isActive: boolean
  createdAt: Date
}
```

### Bid
```typescript
interface Bid {
  id: string
  auctionId: string
  nftId: string
  bidderId: string
  amount: number
  createdAt: Date
}
```

## Validation Schemas

The API uses Zod for validation with the following main schemas:

### User Schemas
```typescript
// Registration
userRegistrationSchema = {
  email: string (email format)
  username: string (3-30 chars, alphanumeric + underscore)
  password: string (min 8 chars)
  firstName?: string (max 50 chars)
  lastName?: string (max 50 chars)
  walletAddress?: string (Ethereum address format)
}

// Login
userLoginSchema = {
  identifier: string (email or username)
  password: string
}

// Update
userUpdateSchema = {
  firstName?: string
  lastName?: string
  bio?: string
  avatar?: string
  walletAddress?: string
}
```

### NFT Schemas
```typescript
// Create NFT
nftCreateSchema = {
  name: string (1-100 chars)
  description?: string (max 1000 chars)
  image: string (URL format)
  price?: number (positive)
  category?: string
  collectionId?: string (UUID)
}

// Update NFT
nftUpdateSchema = {
  name?: string
  description?: string
  price?: number
  isListed?: boolean
}
```

### Collection Schemas
```typescript
// Create Collection
collectionCreateSchema = {
  name: string (1-100 chars)
  description?: string (max 1000 chars)
  image?: string (URL format)
}

// Update Collection
collectionUpdateSchema = {
  name?: string
  description?: string
  image?: string
}
```

### Auction & Bid Schemas
```typescript
// Create Auction
auctionCreateSchema = {
  nftId: string (UUID)
  startingPrice: number (positive)
  reservePrice?: number (positive)
  duration: number (1-168 hours)
}

// Create Bid
bidCreateSchema = {
  auctionId: string (UUID)
  amount: number (positive)
}
```

### Transaction Schema
```typescript
transactionCreateSchema = {
  nftId: string (UUID)
  userId: string (UUID)
  amount: number (positive)
  transactionHash: string
  type: 'SALE' | 'TRANSFER' | 'MINT'
}
```

## API Routes

### Authentication Routes

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```typescript
{
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
  walletAddress?: string
}
```

**Response:**
```typescript
{
  success: boolean
  data: {
    user: User
    message: string
  }
}
```

**Status Codes:**
- 201: User created successfully
- 400: Validation error or user already exists
- 500: Internal server error

#### POST /api/auth/login
Authenticate user and create session.

**Request Body:**
```typescript
{
  identifier: string // email or username
  password: string
}
```

**Response:**
```typescript
{
  success: boolean
  data: {
    user: User
    message: string
  }
}
```

**Status Codes:**
- 200: Login successful
- 400: Invalid credentials
- 429: Too many failed attempts
- 500: Internal server error

#### POST /api/auth/logout
Logout user and invalidate session.

**Response:**
```typescript
{
  success: boolean
  data: {
    message: string
  }
}
```

**Status Codes:**
- 200: Logout successful
- 500: Internal server error

#### GET /api/auth/me
Get current authenticated user information.

**Response:**
```typescript
{
  success: boolean
  data: User
}
```

**Status Codes:**
- 200: User data retrieved
- 401: Not authenticated
- 500: Internal server error

#### POST /api/auth/refresh
Refresh access tokens using refresh token.

**Response:**
```typescript
{
  success: boolean
  data: {
    message: string
  }
}
```

**Status Codes:**
- 200: Tokens refreshed
- 401: Invalid refresh token
- 500: Internal server error

### NFT Routes

#### GET /api/nfts
List NFTs with filtering and pagination.

**Query Parameters:**
- `page?: number` (default: 1)
- `limit?: number` (default: 20, max: 100)
- `category?: string`
- `minPrice?: number`
- `maxPrice?: number`
- `isListed?: boolean`
- `creatorId?: string`
- `ownerId?: string`
- `collectionId?: string`
- `search?: string`
- `sortBy?: string` (default: 'createdAt')
- `sortOrder?: 'asc' | 'desc'` (default: 'desc')

**Response:**
```typescript
{
  success: boolean
  data: {
    nfts: NFT[]
    pagination: {
      page: number
      limit: number
      totalCount: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}
```

#### POST /api/nfts
Create a new NFT. Requires authentication.

**Request Body:**
```typescript
{
  name: string
  description?: string
  image: string
  price?: number
  category?: string
  collectionId?: string
}
```

**Response:**
```typescript
{
  success: boolean
  data: NFT
}
```

**Status Codes:**
- 201: NFT created successfully
- 400: Validation error
- 401: Not authenticated
- 500: Internal server error

#### GET /api/nfts/[id]
Get specific NFT with related data.

**Response:**
```typescript
{
  success: boolean
  data: {
    nft: NFT & {
      creator: User
      collection?: Collection
      transactions: Transaction[]
      activeAuctions: Auction[]
    }
    similarNFTs: NFT[]
  }
}
```

**Status Codes:**
- 200: NFT retrieved
- 404: NFT not found
- 500: Internal server error

#### PUT /api/nfts/[id]
Update NFT. Requires authentication and ownership.

**Request Body:**
```typescript
{
  name?: string
  description?: string
  price?: number
  isListed?: boolean
}
```

**Response:**
```typescript
{
  success: boolean
  data: NFT
}
```

**Status Codes:**
- 200: NFT updated
- 400: Validation error
- 401: Not authenticated
- 403: Not authorized (not owner)
- 404: NFT not found
- 500: Internal server error

#### DELETE /api/nfts/[id]
Delete NFT. Requires authentication and ownership.

**Response:**
```typescript
{
  success: boolean
  data: {
    message: string
  }
}
```

**Status Codes:**
- 200: NFT deleted
- 401: Not authenticated
- 403: Not authorized or NFT has active auctions
- 404: NFT not found
- 500: Internal server error

### Collection Routes

#### GET /api/collections
List collections with filtering and pagination.

**Query Parameters:**
- `page?: number`
- `limit?: number`
- `creatorId?: string`
- `query?: string` (search term)
- `sortBy?: string`
- `sortOrder?: 'asc' | 'desc'`

**Response:**
```typescript
{
  success: boolean
  data: {
    collections: (Collection & {
      creator: User
      stats: {
        totalNFTs: number
        floorPrice: number
        avgPrice: number
        maxPrice: number
        totalVolume: number
      }
    })[]
    pagination: PaginationInfo
  }
}
```

#### POST /api/collections
Create a new collection. Requires authentication.

**Request Body:**
```typescript
{
  name: string
  description?: string
  image?: string
}
```

**Response:**
```typescript
{
  success: boolean
  data: Collection
}
```

#### GET /api/collections/[id]
Get specific collection with NFTs and statistics.

**Response:**
```typescript
{
  success: boolean
  data: {
    collection: Collection & {
      creator: User
      nfts: NFT[]
      stats: CollectionStats
    }
  }
}
```

#### PUT /api/collections/[id]
Update collection. Requires authentication and ownership or admin role.

**Request Body:**
```typescript
{
  name?: string
  description?: string
  image?: string
  isVerified?: boolean // Admin only
}
```

#### DELETE /api/collections/[id]
Delete collection. Requires authentication and ownership or admin role.

### Auction Routes

#### GET /api/auctions
List auctions with filtering and pagination.

**Query Parameters:**
- `page?: number`
- `limit?: number`
- `isActive?: boolean`
- `creatorId?: string`
- `category?: string`
- `minPrice?: number`
- `maxPrice?: number`
- `sortBy?: string`
- `sortOrder?: 'asc' | 'desc'`

**Response:**
```typescript
{
  success: boolean
  data: {
    auctions: (Auction & {
      nft: NFT & { creator: User }
      bids: (Bid & { bidder: User })[]
      _count: { bids: number }
    })[]
    pagination: PaginationInfo
  }
}
```

#### POST /api/auctions
Create a new auction. Requires authentication and NFT ownership.

**Request Body:**
```typescript
{
  nftId: string
  startingPrice: number
  reservePrice?: number
  duration: number // hours
}
```

**Response:**
```typescript
{
  success: boolean
  data: Auction & {
    nft: NFT & { creator: User }
  }
}
```

#### GET /api/auctions/[id]/bids
Get bids for a specific auction.

**Response:**
```typescript
{
  success: boolean
  data: {
    auction: {
      id: string
      nft: NFT
      currentPrice: number
      endTime: Date
      isActive: boolean
    }
    bids: (Bid & { bidder: User })[]
    totalBids: number
    highestBid: Bid | null
  }
}
```

#### POST /api/auctions/[id]/bids
Place a bid on an auction. Requires authentication.

**Request Body:**
```typescript
{
  amount: number
}
```

**Response:**
```typescript
{
  success: boolean
  data: Bid & {
    bidder: User
    auction: Auction & { nft: NFT }
  }
}
```

### Transaction Routes

#### GET /api/transactions
List transactions with filtering and pagination.

**Query Parameters:**
- `page?: number`
- `limit?: number`
- `userId?: string`
- `nftId?: string`
- `type?: 'SALE' | 'TRANSFER' | 'MINT'`
- `minAmount?: number`
- `maxAmount?: number`
- `sortBy?: string`
- `sortOrder?: 'asc' | 'desc'`

**Response:**
```typescript
{
  success: boolean
  data: {
    transactions: (Transaction & {
      nft: NFT
      user: User
    })[]
    pagination: PaginationInfo
  }
}
```

#### POST /api/transactions
Create a new transaction. Requires authentication.

**Request Body:**
```typescript
{
  nftId: string
  userId: string
  amount: number
  transactionHash: string
  type: 'SALE' | 'TRANSFER' | 'MINT'
}
```

**Response:**
```typescript
{
  success: boolean
  data: Transaction & {
    nft: NFT
    user: User
  }
}
```

### User Routes

#### GET /api/users
List users (Admin only).

**Query Parameters:**
- `page?: number`
- `limit?: number`
- `search?: string`
- `role?: string`
- `isVerified?: boolean`
- `sortBy?: string`
- `sortOrder?: 'asc' | 'desc'`

**Response:**
```typescript
{
  success: boolean
  data: {
    users: (User & {
      _count: {
        nfts: number
        transactions: number
        collections: number
        bids: number
      }
    })[]
    pagination: PaginationInfo
    stats: {
      byRole: Record<string, number>
      byVerification: Record<string, number>
    }
  }
}
```

#### GET /api/users/[id]
Get user profile with statistics and recent activity.

**Response:**
```typescript
{
  success: boolean
  data: {
    user: User & {
      _count: {
        nfts: number
        collections: number
        transactions: number
        bids: number
      }
    }
    stats: {
      nfts: number
      collections: number
      transactions: number
      bids: number
      totalVolume: number
      avgNFTPrice: number
      totalNFTValue: number
    }
    recentNFTs: (NFT & { creator: User })[]
    collections: (Collection & { _count: { nfts: number } })[]
    recentTransactions: (Transaction & { nft: NFT, user: User })[]
  }
}
```

#### PUT /api/users/[id]
Update user profile. Requires authentication and ownership or admin role.

**Request Body:**
```typescript
{
  firstName?: string
  lastName?: string
  bio?: string
  avatar?: string
  walletAddress?: string
}
```

#### DELETE /api/users/[id]
Delete user account. Requires authentication and ownership or admin role.

### Admin Routes

#### GET /api/admin/dashboard
Get admin dashboard data. Requires admin role.

**Response:**
```typescript
{
  success: boolean
  data: {
    overview: {
      users: {
        total: number
        today: number
        thisWeek: number
        thisMonth: number
        verified: number
        admins: number
      }
      nfts: {
        total: number
        today: number
        thisWeek: number
        thisMonth: number
        listed: number
        sold: number
      }
      transactions: {
        total: number
        today: number
        thisWeek: number
        thisMonth: number
      }
      volume: {
        total: number
        today: number
        thisWeek: number
        thisMonth: number
      }
      auctions: {
        total: number
        active: number
        today: number
        thisWeek: number
        thisMonth: number
      }
      collections: {
        total: number
        today: number
        thisWeek: number
        thisMonth: number
      }
    }
    recentActivity: {
      users: User[]
      nfts: (NFT & { creator: User })[]
      transactions: (Transaction & { nft: NFT, user: User })[]
      auctions: (Auction & { nft: NFT, seller: User })[]
    }
    topPerformers: {
      creators: (User & { _count: { nfts: number, transactions: number } })[]
      collectors: (User & { _count: { nfts: number, transactions: number } })[]
      collections: (Collection & { creator: User, _count: { nfts: number } })[]
    }
    systemHealth: {
      database: string
      email: string
      storage: string
      lastBackup: Date
    }
  }
}
```

#### GET /api/admin/settings
Get system settings. Requires admin role.

**Response:**
```typescript
{
  success: boolean
  data: {
    settings: SystemSetting[]
    categorized: Record<string, SystemSetting[]>
  }
}
```

#### PUT /api/admin/settings
Update system settings. Requires admin role.

**Request Body:**
```typescript
{
  settings: {
    key: string
    value: string
  }[]
}
```

#### POST /api/admin/settings
Create new system setting. Requires admin role.

**Request Body:**
```typescript
{
  key: string
  value: string
}
```

#### DELETE /api/admin/settings
Delete system setting. Requires admin role.

**Query Parameters:**
- `key: string` (required)

## Error Responses

All endpoints return errors in the following format:

```typescript
{
  success: false
  error: string
  details?: any
}
```

### Common Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (not authenticated)
- **403**: Forbidden (not authorized)
- **404**: Not Found
- **405**: Method Not Allowed
- **409**: Conflict (duplicate resource)
- **429**: Too Many Requests (rate limited)
- **500**: Internal Server Error

## Rate Limiting

The API implements rate limiting on sensitive endpoints:
- Authentication endpoints: 5 requests per minute per IP
- User registration: 3 requests per hour per IP
- Password reset: 3 requests per hour per email

## Pagination

Most list endpoints support pagination with the following parameters:

```typescript
{
  page?: number // default: 1
  limit?: number // default: 20, max: 100
  sortBy?: string // default: 'createdAt'
  sortOrder?: 'asc' | 'desc' // default: 'desc'
}
```

Response includes pagination metadata:

```typescript
{
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
```

## Security Features

- JWT-based authentication with HTTP-only cookies
- CSRF protection
- Rate limiting
- Input validation with Zod
- SQL injection prevention via Prisma ORM
- Role-based access control (User/Admin)
- Secure password hashing
- Email verification system

## Environment Variables

Required environment variables:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development

To run the API locally:

1. Install dependencies: `npm install`
2. Set up environment variables
3. Run database migrations: `npx prisma migrate dev`
4. Generate Prisma client: `npx prisma generate`
5. Start development server: `npm run dev`

## Testing

The API includes comprehensive testing with Jest and Supertest. Run tests with:

```bash
npm test
```

## Deployment

The API is designed to be deployed on Vercel with PostgreSQL database. Ensure all environment variables are configured in your deployment environment.