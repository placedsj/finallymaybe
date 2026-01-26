# FDSJ-739 Evidence Platform - API Documentation

## Backend Architecture

### Server Details
- **Type**: Flask REST API
- **Port**: 5000 (development)
- **CORS**: Enabled for local development
- **Database**: SQLite (FDSJ739_EVIDENCE.db)

## API Endpoints

### Exhibits Management

#### 1. Get All Exhibits
**Endpoint:** `GET /api/exhibits`

**Description:** Retrieves a list of all exhibits in the database. Supports filtering by keyword, category, and minimum priority.

**Query Parameters:**
- `keyword` (optional): Search term for description and keywords.
- `category` (optional): Filter by category (e.g., SAFETY, FINANCIAL).
- `min_priority` (optional): Minimum priority level (1-10).
- `page` (optional): Page number (default: 1).
- `limit` (optional): Items per page (default: 50).

**Headers:**
- `Accept-Encoding: gzip` (Internal use: Response is compressed if supported)
- **Response Headers:**
    - `Cache-Control: public, max-age=300` (Cached for 5 minutes)

**Response:**
```json
[
  {
    "id": 1,
    "exhibit_number": "A-1",
    "description": "Photograph of Craig Schulz's black eye...",
    "date": "2024-11-19",
    "category": "SAFETY",
    "priority": 10,
    "file_type": "jpg",
    "legal_significance": "Physical evidence of domestic violence...",
    "status": "Original - Photograph"
  },
  ...
]
```

#### Get Critical Exhibits
```
GET /api/exhibits/critical
Description: Get all Priority 10 exhibits (most important)

Response: Array of critical exhibits
```

#### Get Specific Exhibit
```
GET /api/exhibits/<exhibit_number>
Parameters:
  - exhibit_number: The exhibit identifier (e.g., "A1")

Response: Single exhibit object
```

#### Get Exhibits by Module
```
GET /api/modules/<module_number>/exhibits
Parameters:
  - module_number: Module ID

Response: Array of exhibits for that module
```

### Statistics & Analytics

#### Get Database Statistics
```
GET /api/stats
Response:
  {
    "total_exhibits": 1234,
    "by_category": {
      "ASSAULT": 45,
      "CUSTODY": 120,
      ...
    },
    "by_priority": {
      "10": 15,
      "9": 42,
      ...
    },
    "date_range": {
      "earliest": "2025-01-01",
      "latest": "2025-12-31"
    }
  }
```

#### Get Categories List
```
GET /api/categories
Response: ["ASSAULT", "CUSTODY", "DRUGS", "LEGAL_THREATS", ...]
```

### Data Export

#### Export Exhibit Index
```
GET /api/export/index
Description: Export exhibit index as text file

Response:
  {
    "success": true,
    "filename": "exhibit_index_TIMESTAMP.txt"
  }
```

## Frontend API Client

### Usage Pattern
```typescript
import { apiClient } from './services/apiClient';

// Fetch exhibits with pagination
const response = await apiClient.get('/exhibits', {
  params: {
    page: 0,
    limit: 50,
    category: 'ASSAULT'
  }
});

// Fetch specific exhibit
const exhibit = await apiClient.get(`/exhibits/${exhibitNumber}`);

// Get statistics
const stats = await apiClient.get('/stats');
```

### Client Features
- **Automatic Caching**: Responses cached in IndexedDB
- **Request Deduplication**: Same request fired twice = one API call
- **Error Handling**: Automatic retry with exponential backoff
- **Loading States**: Built-in loading tracking

## Response Caching

All GET requests are cached with:
- **Default TTL**: 1 hour
- **Cache Key**: Request URL + parameters
- **Invalidation**: Manual cache.clear() on data updates

## Performance Targets

| Operation | Target | Actual |
|-----------|--------|--------|
| Get 50 exhibits | <100ms | - |
| Search 100K records | <200ms | - |
| Export 10K items | <5s | - |
| Full FTS search | <100ms | - |

## Database Schema

### exhibits table
- id: INTEGER PRIMARY KEY
- exhibit_number: TEXT (unique identifier)
- category: TEXT (ASSAULT, CUSTODY, DRUGS, etc.)
- date: TEXT (ISO format)
- description: TEXT
- priority: INTEGER (1-10)
- witnesses: TEXT (JSON array)
- metadata: TEXT (JSON)

### ocr_content table
- id: INTEGER PRIMARY KEY
- filename: TEXT
- filepath: TEXT
- sender: TEXT
- recipient: TEXT
- raw_text: TEXT (indexed via FTS5)
- formatted_text: TEXT
- processed_date: TEXT
- exhibit_id: INTEGER (FK to exhibits)

### Indexes
- exhibits(category, priority, date)
- ocr_content(exhibit_id, filename, sender, recipient)
- ocr_content(processed_date)
- ocr_content_fts (Full-Text Search on raw_text)

## Error Responses

```json
{
  "error": "Description of error",
  "status": 400
}
```

### Common Status Codes
- 200: Success
- 400: Bad request (invalid parameters)
- 404: Resource not found
- 429: Rate limited
- 500: Server error (check logs)

## Rate Limiting

- **Limit**: 1000 requests per minute per client
- **Headers**: X-RateLimit-Limit, X-RateLimit-Remaining
- **Fallback**: Cached responses used if rate limited

## Authentication

Currently no authentication required for local development.
For production, add JWT tokens to all requests:

```
Authorization: Bearer <token>
```

## Development Notes

- All timestamps in UTC
- Dates in ISO 8601 format (YYYY-MM-DD)
- Search is case-insensitive
- Category values are uppercase
- Priority range: 1-10 (10 = most critical)
