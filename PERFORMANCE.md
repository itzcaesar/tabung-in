# Performance Optimization Guide

This document outlines the performance optimizations implemented in Tabung.in and best practices for maintaining good performance.

## Implemented Optimizations

### 1. Database Performance

#### Connection Configuration
- **File**: `src/lib/db/index.ts`
- **Optimization**: Added explicit configuration for Neon HTTP client with cache control
- **Impact**: Better connection handling and cache behavior for database operations
- **Details**: 
  ```typescript
  const sql = neon(process.env.DATABASE_URL!, {
    fetchOptions: {
      cache: 'no-store', // Ensure fresh data for mutations
    },
  });
  ```

#### Query Optimization
- **File**: `src/app/dashboard/page.tsx`
- **Optimization**: Consolidated parallel queries into a single `Promise.all()` to eliminate sequential database calls
- **Impact**: Reduced dashboard load time by executing 9 queries in parallel instead of 8+1 sequential
- **Details**: Moved `categorySpending` query from sequential execution into the main `Promise.all()` block

### 2. OCR Performance

#### Worker Caching
- **File**: `src/lib/ocr.ts`
- **Optimization**: Implemented Tesseract.js worker instance caching
- **Impact**: Significantly faster subsequent OCR operations by reusing initialized worker
- **Details**:
  - Worker is created once and reused across multiple scans
  - Eliminates worker initialization overhead (can save 1-2 seconds per scan)
  - Added `terminateWorker()` function for cleanup when needed

#### Pattern Matching Optimization
- **File**: `src/lib/ocr.ts`
- **Optimization**: 
  - Compiled regex patterns once outside loops
  - Reordered validation checks (cheapest first)
  - Used `Array.some()` for early exit pattern matching
- **Impact**: Faster text parsing when extracting receipt data
- **Details**:
  ```typescript
  // Skip patterns compiled once
  const SKIP_PATTERNS = [
    /^(total|subtotal|...)/i,
    /^(ruko|jl\.|...)/i,
  ];
  
  // Fast length check before expensive regex
  if (cleaned.length < 4) continue;
  
  // Early exit on match
  if (SKIP_PATTERNS.some(pattern => pattern.test(cleaned))) {
    continue;
  }
  ```

### 3. News Feed Performance

#### RSS Parsing Optimization
- **File**: `src/lib/services/news.ts`
- **Optimization**:
  - Used `matchAll()` iterator instead of regex exec loop
  - Compiled financial keywords into a Set for O(1) lookup
  - Early exit when enough items are collected
  - Optimized regex patterns to handle CDATA sections in one pattern
- **Impact**: Faster RSS feed parsing and filtering
- **Details**:
  ```typescript
  // Use Set for O(1) keyword lookup
  const financialKeywords = new Set(['saham', 'rupiah', ...]);
  
  // Early exit when we have enough items
  for (const itemMatch of itemMatches) {
    if (items.length >= 5) break;
    // ...
  }
  ```

#### API Caching
- **File**: `src/app/api/news/route.ts`
- **Optimization**: Route-level revalidation with 1-hour cache
- **Impact**: Reduces external API calls and improves response time
- **Details**: `export const revalidate = 3600;`

### 4. React Component Performance

#### Component Memoization
- **Files**: 
  - `src/components/dashboard/expense-chart.tsx`
  - `src/components/dashboard/category-breakdown.tsx`
  - `src/components/dashboard/transaction-list.tsx`
- **Optimization**: Wrapped components with `React.memo()` to prevent unnecessary re-renders
- **Impact**: Reduced re-render cycles when parent components update but props remain unchanged
- **Details**:
  ```typescript
  export const ExpenseChart = memo(function ExpenseChart({ data }) {
    // Component already uses useMemo for data transformations
    // ...
  });
  ```

#### Async State Management
- **File**: `src/components/dashboard/news-ticker.tsx`
- **Optimization**: Proper async data fetching with cleanup in useEffect
- **Impact**: Prevents memory leaks and race conditions
- **Details**: Added mounted flag to prevent state updates on unmounted components

### 5. Date Calculations

#### Reusable Date Objects
- **Files**: 
  - `src/app/dashboard/page.tsx`
  - `src/app/dashboard/reports/page.tsx`
- **Optimization**: Calculate date ranges once and reuse across multiple queries
- **Impact**: Eliminates redundant date calculations
- **Details**:
  ```typescript
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  // Reuse in multiple queries...
  ```

## Performance Best Practices

### Database Queries
1. **Always use Promise.all() for independent queries**: When fetching multiple unrelated datasets, execute queries in parallel
2. **Avoid N+1 queries**: Use `with` clause in Drizzle to fetch related data in one query
3. **Index frequently queried columns**: Ensure userId, date ranges, and status fields are indexed
4. **Limit result sets**: Always use `limit` when displaying recent/top items

### React Components
1. **Memoize expensive components**: Use `React.memo()` for components with complex rendering
2. **Use useMemo for expensive calculations**: Memoize computed values that depend on props
3. **Use useCallback for event handlers**: Prevent function recreation on every render
4. **Lazy load heavy dependencies**: Use dynamic imports for large libraries like Tesseract.js

### API Routes
1. **Implement caching**: Use Next.js revalidation for data that doesn't need to be real-time
2. **Set appropriate cache headers**: Configure cache-control headers for static/semi-static data
3. **Batch requests**: Combine multiple related API calls when possible

### Assets and Resources
1. **Optimize images**: Use Next.js Image component for automatic optimization
2. **Code splitting**: Leverage Next.js automatic code splitting
3. **Tree shaking**: Import only what you need from large libraries

## Monitoring Performance

### Key Metrics to Monitor
- **Server-side rendering time**: Dashboard page load time
- **Database query duration**: Monitor slow queries
- **API response times**: Especially external services like RSS feeds
- **Client-side rendering**: React component render times
- **OCR processing time**: Track Tesseract.js performance

### Tools
- Next.js built-in performance analytics
- React DevTools Profiler
- Database query logging
- Browser Performance API
- Lighthouse CI for continuous monitoring

## Future Optimizations

### Potential Improvements
1. **Implement server-side caching**: Use Redis for frequently accessed data
2. **Add database read replicas**: Distribute read load across multiple instances
3. **Implement incremental static regeneration**: For dashboard widgets that don't need real-time data
4. **Add service worker**: For offline support and background sync
5. **Optimize bundle size**: Analyze and reduce JavaScript bundle size
6. **Implement virtual scrolling**: For long transaction lists
7. **Add request deduplication**: Prevent duplicate API calls
8. **Implement optimistic UI updates**: Improve perceived performance

## Benchmarking

To measure the impact of optimizations:

```bash
# Run performance tests
npm run test:performance

# Profile component renders
# Use React DevTools Profiler in development mode

# Measure API response times
# Use Next.js analytics or custom logging
```

## Contributing

When adding new features, please:
1. Consider performance implications
2. Add appropriate caching where applicable
3. Use React.memo() for expensive components
4. Batch database queries when possible
5. Document any performance-critical code

---

Last updated: 2025-12-09
