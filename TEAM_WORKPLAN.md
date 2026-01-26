# FDSJ-739 Evidence Platform - Team Optimization Workplan

**Date**: January 18, 2026  
**Status**: Foundation Complete - Ready for Team Implementation  
**Next Phase**: Detailed Implementation by AI Team Members

---

## 📋 What's Been Completed

### ✅ Foundation Setup (By Main AI)
1. **Environment Configuration**
   - `.env.local.example` - Template for configuration
   - `requirements.txt` - Python dependencies
   - Setup and launch scripts (PowerShell)

2. **Documentation**
   - `API_DOCS.md` - Complete API reference
   - `README_NEW.md` - Comprehensive user guide
   - This workplan document

3. **Performance Optimizations (Initial)**
   - `vite.config.ts` - Updated with code splitting, minification, asset optimization
   - `package.json` - Added react-window, optimization scripts
   - `services/apiClient.ts` - Backend API client with caching & deduplication

4. **Database Tooling**
   - `scripts/optimize_db.py` - Database optimization utility
   - Strategic index planning documented

---

## 🤖 Team Workplan - 5 Independent Tasks

Each task is **self-contained** and can be worked on **in parallel** by different AI team members.

---

### **TASK 1: Backend Integration & API Optimization**

**Assigned to**: AI Team Member #1  
**Dependencies**: None (Can start immediately)  
**Estimated Time**: 2-3 hours  
**Complexity**: Medium

#### Complete Prompt:

```
TASK: Backend-Frontend Connection & Performance

CONTEXT:
- Frontend: React/TypeScript app running on port 3000 (Vite)
- Backend: Flask server on port 5000 with SQLite evidence database
- Current Status: Backends exist but aren't connected to frontend
- Database: FDSJ739_EVIDENCE.db with OCR content, exhibits table

REQUIREMENTS:

1. Create a unified API client in `services/apiClient.ts`:
   ✓ (ALREADY DONE - Review existing code)
   - Base URL configuration for Flask backend (http://localhost:5000)
   - Request/response interceptors with error handling
   - Automatic retry logic with exponential backoff
   - Request deduplication (don't fire same request twice)

2. Modify `geminiService.ts`:
   - Add caching by file hash (store results in IndexedDB)
   - Before calling Gemini, check if this file hash was already processed
   - If cache hit, return cached response
   - Cache TTL: 30 days for same files

3. Update `api_server.py`:
   - Add database indexing on: filename, sender, recipient, category, date
   - Add response caching headers (ETag, Cache-Control)
   - Add database connection pooling (SQLite WAL mode)
   - Add query optimization: use LIMIT/OFFSET pagination (default 50 items)
   - Return paginated results for /api/exhibits
   - Add gzip compression middleware for responses
   - Test: All queries should complete in <100ms

4. Create `services/cache.ts`:
   - IndexedDB cache system for API responses
   - TTL-based expiration (default 1 hour)
   - Cache invalidation on data updates
   - Cache statistics (hit rate, size, entries)

5. Integration Testing:
   - Verify frontend can call backend without errors
   - Verify caching works (second identical request should be instant)
   - Verify pagination works (?page=0&limit=50)
   - Verify error handling for network failures

DELIVERABLES:
- `services/apiClient.ts` (already created - ensure it works)
- `services/cache.ts` (new file)
- Updated `services/geminiService.ts` with file hash caching
- Updated `api_server.py` with optimization
- `INTEGRATION_TESTS.md` documenting what was tested

SUCCESS CRITERIA:
✓ Frontend can call GET /api/exhibits and receive paginated results
✓ Second identical API call uses cache (instant response)
✓ Database queries complete in <100ms for 50-item pages
✓ Gemini responses cached by file content hash
✓ Error handling works (no crashes on network failure)
✓ All endpoints documented and tested
```

**Files to Modify**:
- [services/geminiService.ts](services/geminiService.ts)
- [api_server.py](api_server.py)
- Create: services/cache.ts (new)
- Create: INTEGRATION_TESTS.md (new)

---

### **TASK 2: Frontend Performance & UI Optimization**

**Assigned to**: AI Team Member #2  
**Dependencies**: Task 1 (API client) should be complete first  
**Estimated Time**: 3-4 hours  
**Complexity**: Medium-High

#### Complete Prompt:

```
TASK: React Bundle Optimization & Pagination UI

CONTEXT:
- App.tsx is the main component with all tabs/features
- Currently loads ALL_EXHIBITS (thousands of records) at startup
- ExhibitList component renders entire list without virtualization
- Components: Dashboard, ExhibitList, CaseTimeline, ForensicsAnalysis, etc.

REQUIREMENTS:

1. Implement Route-Based Code Splitting in `App.tsx`:
   - Use React.lazy() for each major feature/tab
   - Wrap with Suspense boundaries showing loading spinners
   - Split these routes:
     * Dashboard (main tab)
     * ExhibitList (exhibit browsing)
     * CaseTimeline (timeline view)
     * ForensicsAnalysis (AI analysis)
     * CounselPrepRoom (legal tools)
     * All other tabs
   - Result: Only load Dashboard on startup, others load on demand
   - Test: Verify bundle size reduced to <150KB (gzipped)

2. Create `components/VirtualizedExhibitList.tsx`:
   - Use 'react-window' library (already added to package.json)
   - Implement FixedSizeList for exhibit items
   - Support for 10,000+ exhibits without performance hit
   - Keep scroll position on filter changes
   - Lazy load more items as user scrolls
   - Test: Scroll through 10,000 items at 60fps

3. Implement Pagination in `ExhibitList.tsx`:
   - Add page size selector (25, 50, 100 items)
   - Add previous/next/goto page buttons
   - Call backend API with ?page=X&limit=50 parameters
   - Show status: "Showing 1-50 of 12,482"
   - Cache previous/next pages for faster navigation
   - Test: Switching pages should be <200ms

4. Optimize Search/Filter:
   - Debounce search input (300ms delay before API call)
   - Don't search until 3+ characters typed
   - Show results as-you-type with loading state
   - Reuse cached responses from Task 1
   - Clear old search results when starting new search
   - Test: Search should feel responsive

5. Update `vite.config.ts`:
   ✓ (ALREADY DONE - Review for any additions)
   - Verify manualChunks for vendor code (React, Recharts, Lucide)
   - Verify compression is enabled
   - Preload critical chunks
   - Test production build: npm run build

DELIVERABLES:
- Updated `App.tsx` with code splitting and Suspense
- `components/VirtualizedExhibitList.tsx` (new)
- Updated `ExhibitList.tsx` with pagination
- `PERFORMANCE_REPORT.md` with metrics

SUCCESS CRITERIA:
✓ Initial bundle <150KB (gzipped)
✓ Dashboard loads in <2 seconds
✓ ExhibitList renders 50 items instantly
✓ Scrolling 10,000 items is smooth (60fps)
✓ Search debounces and uses cache
✓ Page switching is instant (<200ms)
✓ No console errors or warnings
```

**Files to Modify**:
- [App.tsx](App.tsx)
- [components/ExhibitList.tsx](components/ExhibitList.tsx)
- Create: components/VirtualizedExhibitList.tsx (new)
- Create: PERFORMANCE_REPORT.md (new)

---

### **TASK 3: Database & SQLite Optimization**

**Assigned to**: AI Team Member #3  
**Dependencies**: None (Independent)  
**Estimated Time**: 1-2 hours  
**Complexity**: Low-Medium

#### Complete Prompt:

```
TASK: SQLite Database Indexing & Query Optimization

CONTEXT:
- Database: FDSJ739_EVIDENCE.db in root folder
- Tables: exhibits, ocr_content, ocr_content_fts
- Recent changes: integrate_ocr.py just ran (added OCR data)
- Current: Basic structure exists, need optimization

REQUIREMENTS:

1. Analyze Current Schema:
   - Open FDSJ739_EVIDENCE.db with sqlite3
   - List all tables and their columns
   - Identify frequently searched fields (sender, recipient, filename, exhibit_id)
   - Check existing indexes with: PRAGMA index_list(table_name)
   - Analyze query plans with: EXPLAIN QUERY PLAN

2. Add Strategic Indexes (if not already present):
   - exhibits table:
     * CREATE INDEX idx_exhibits_category_priority_date ON exhibits(category, priority, date)
     * CREATE INDEX idx_exhibits_date ON exhibits(date)
   - ocr_content table:
     * CREATE INDEX idx_ocr_exhibit_id ON ocr_content(exhibit_id)
     * CREATE INDEX idx_ocr_filename ON ocr_content(filename)
     * CREATE INDEX idx_ocr_sender ON ocr_content(sender)
     * CREATE INDEX idx_ocr_recipient ON ocr_content(recipient)
     * CREATE INDEX idx_ocr_processed_date ON ocr_content(processed_date)
   - Run: ANALYZE to update query planner statistics
   - Test: Each simple search should take <50ms

3. Optimize FTS5 (Full Text Search):
   - Verify FTS5 triggers are working properly
   - Test FTS searches: SELECT * FROM ocr_content_fts WHERE raw_text MATCH 'keyword'
   - FTS queries on 100K records should complete <100ms
   - Document FTS usage patterns

4. Run Database Optimization Script:
   - Execute: scripts/optimize_db.py
   - This runs VACUUM (defragmentation) and ANALYZE
   - Check before/after database size
   - Run: PRAGMA integrity_check to verify database integrity

5. Document Database Performance:
   - Create `DB_SCHEMA.md` with:
     * All tables and their columns
     * Relationships (foreign keys)
     * Index strategy explanation
     * Query patterns and performance targets
     * Backup/recovery procedures

DELIVERABLES:
- Optimized FDSJ739_EVIDENCE.db with all indexes
- `DB_SCHEMA.md` documentation
- `DB_OPTIMIZATION_REPORT.md` with performance metrics
- Test queries showing <50-100ms response times

SUCCESS CRITERIA:
✓ Simple searches complete in <50ms
✓ Complex searches (50K+ records) in <200ms
✓ Database size optimized and defragmented
✓ All indexes created and analyzed
✓ FTS5 works for full-text searches
✓ Integrity check passes (no corruption)
✓ Database ready for production queries
```

**Files to Modify**:
- FDSJ739_EVIDENCE.db (optimize)
- Create: DB_SCHEMA.md (new)
- Create: DB_OPTIMIZATION_REPORT.md (new)

---

### **TASK 4: Environment Setup & Deployment**

**Assigned to**: AI Team Member #4  
**Dependencies**: None (Independent)  
**Estimated Time**: 1-2 hours  
**Complexity**: Low

#### Complete Prompt:

```
TASK: Environment Configuration & Deployment Scripts

CONTEXT:
- App needs GEMINI_API_KEY to function
- Two backends: React (port 3000) + Flask (port 5000)
- Setup files already created (setup.ps1, launch.ps1)
- Need verification and refinement

REQUIREMENTS:

1. Verify Setup & Launch Scripts:
   - Test setup.ps1:
     * Checks for Node.js and Python
     * Installs npm dependencies
     * Installs Python dependencies
     * Creates .env.local from example
   - Test launch.ps1:
     * Starts Flask backend
     * Starts Vite frontend
     * Opens browser to localhost:3000
   - Ensure proper error handling and messages

2. Create `.gitignore` Update:
   - Ensure `.env.local` is NOT committed
   - Exclude: node_modules/, __pycache__/, *.db
   - Exclude: dist/, build/, .vite/

3. Create Quick Start Guide (`QUICKSTART.md`):
   - 1-minute setup instructions
   - Common commands (npm run dev, python api_server.py)
   - Where to get Gemini API key
   - Troubleshooting common issues

4. Create Environment Setup Documentation:
   - Update README.md sections if needed
   - Document all environment variables
   - Document required ports (3000, 5000)
   - Document system requirements

5. Add GitHub Actions Workflow (Optional):
   - Create `.github/workflows/test.yml`
   - Test: npm run build succeeds
   - Test: Python syntax valid
   - Test: No console errors on startup

DELIVERABLES:
- Verified setup.ps1 and launch.ps1
- Updated `.gitignore`
- `QUICKSTART.md` (new)
- `.github/workflows/test.yml` (optional)
- Setup verification checklist

SUCCESS CRITERIA:
✓ New user can run setup.ps1 successfully
✓ launch.ps1 starts both servers automatically
✓ .env.local is never accidentally committed
✓ Documentation clear for first-time setup
✓ All scripts handle errors gracefully
```

**Files to Modify/Create**:
- Verify: [setup.ps1](setup.ps1)
- Verify: [launch.ps1](launch.ps1)
- Create: .gitignore (update)
- Create: QUICKSTART.md (new)
- Create: .github/workflows/test.yml (optional)

---

### **TASK 5: AI Service Optimization**

**Assigned to**: AI Team Member #5  
**Dependencies**: Task 1 (API client) should be complete first  
**Estimated Time**: 2-3 hours  
**Complexity**: Medium-High

#### Complete Prompt:

```
TASK: Gemini API Optimization & Batching

CONTEXT:
- Service: `services/geminiService.ts`
- Current: Calls Gemini for every file uploaded (slow, expensive)
- Model: gemini-2.0-flash-exp
- Goal: Reduce API calls, implement caching, batch processing

REQUIREMENTS:

1. Implement Request Batching System:
   - Create batch queue in memory (max 5-10 items per batch)
   - Don't process file immediately - add to queue
   - Process batches every 2 seconds or when queue full
   - Reduces API overhead and costs significantly
   - Implement with async/await pattern

2. Add Content Hash-Based Caching:
   - Before calling Gemini, hash file content (SHA-256)
   - Check IndexedDB cache for this hash
   - Only call Gemini if cache miss
   - Store response with hash as key
   - Long TTL: 30 days (same file = always same analysis)
   - Show "cached" indicator in UI

3. Implement Fallback Modes:
   - If API key missing: basic extraction from filename
   - If API rate limited (429): use cached response or fallback
   - If API error: save for retry later, show user message
   - Show appropriate UI feedback (loading, cached, error)

4. Optimize System Prompts:
   - Current system instruction is good - keep it
   - For batch processing: create variant prompt
   - Structured output (JSON schema) already used - verify working
   - Test with sample files and verify quality

5. Add Request Monitoring & Logging:
   - Log all API calls (timestamp, tokens used, response time)
   - Track cache hit/miss rates
   - Estimate costs based on token usage
   - Alert if approaching rate limits
   - Create monitoring dashboard in UI (optional)

DELIVERABLES:
- Updated `services/geminiService.ts`:
  * Batching queue system
  * Content hash-based caching
  * Fallback modes
  * Request monitoring
- `services/batchProcessor.ts` (new) - queue management
- `GEMINI_OPTIMIZATION_REPORT.md` with:
  * Cost estimates
  * Cache hit rate statistics
  * Performance improvements
  * Example batch processing

SUCCESS CRITERIA:
✓ Multiple uploads processed in batches (not one-by-one)
✓ Same file uploaded twice uses cache instantly
✓ API key missing doesn't crash app
✓ Request logs track costs and performance
✓ Cache hit rate >80% for repeat uploads
✓ Batch processing reduces API calls by 70%+
✓ Fallback modes handle all error scenarios
```

**Files to Modify**:
- [services/geminiService.ts](services/geminiService.ts)
- Create: services/batchProcessor.ts (new)
- Create: GEMINI_OPTIMIZATION_REPORT.md (new)

---

## 📦 Implementation Checklist

### Phase 1: Foundation (COMPLETE ✓)
- [x] Environment setup (.env.local.example)
- [x] Setup/launch scripts
- [x] API documentation
- [x] README updated
- [x] Vite config optimized
- [x] API client skeleton created
- [x] Database optimization script

### Phase 2: Team Implementation (IN PROGRESS)
- [ ] Task 1: Backend Integration
- [ ] Task 2: Frontend Optimization  
- [ ] Task 3: Database Optimization
- [ ] Task 4: Deployment Setup
- [ ] Task 5: AI Optimization

### Phase 3: Testing & Validation
- [ ] Integration testing (all tasks working together)
- [ ] Performance testing (benchmarks)
- [ ] Error scenario testing
- [ ] User acceptance testing
- [ ] Documentation review

### Phase 4: Deployment
- [ ] Production build: `npm run build`
- [ ] Database backup
- [ ] Performance monitoring
- [ ] User training/documentation
- [ ] Launch! 🚀

---

## 🔄 Workflow for Team Members

1. **Choose your task** from Tasks 1-5 above
2. **Read your complete prompt** carefully
3. **Examine existing code** in the workspace
4. **Implement required changes** following the specifications
5. **Create deliverables** (new files, documentation)
6. **Test thoroughly** - verify success criteria
7. **Return results** - paste updated files and documentation back here

---

## 📊 Communication Format

When returning completed work, use this format:

```
## ✅ TASK X COMPLETE: [Task Name]

### What Was Implemented
- List of changes made
- New files created
- Existing files updated

### Files Modified
- [filepath](filepath#L10) - Brief description

### Files Created
- new_file.ts - Description
- new_doc.md - Description

### Testing Results
- ✓ Success criteria 1
- ✓ Success criteria 2
- ✓ Success criteria 3

### Performance Metrics (if applicable)
- Metric 1: X ms
- Metric 2: X KB
- Metric 3: X%

### Notes for Integration
- Any dependencies
- Any breaking changes
- Recommendations for next phase

---
[PASTE CODE/DOCUMENTATION HERE]
---
```

---

## 🎯 Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Initial Load Time | <2s | 📊 |
| API Response Time | <100ms | 📊 |
| Bundle Size (gzipped) | <150KB | 📊 |
| Search Performance | <200ms | 📊 |
| Cache Hit Rate | >80% | 📊 |
| Database Query Time | <50ms | 📊 |

---

## 🚀 Ready to Launch

Once all 5 tasks are complete and integrated:

```powershell
# Test everything
npm install
npm run build
python api_server.py &
npm run dev

# Open browser
http://localhost:3000
```

**Good luck, team! Let's build something great! 🎉**
