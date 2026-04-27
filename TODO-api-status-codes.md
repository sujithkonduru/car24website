# Fix: Display API Status Codes in UI

## Current Issue
✅ APIs hit successfully  
✅ Status codes logged to console  
❌ UI shows generic "Request failed" messages  

## Root Causes
1. `useApi.js` discards `err.status`, sets `error = err.message` only  
2. Components expect `err.response?.status` (axios pattern)  
3. No status → user-friendly message mapping  

## Implementation Plan

### [ ] 1. Create `frontend/src/utils/errorHandler.js`
```
- Map status codes → user messages
- Format: "Error 400: Invalid input"
- Global utility for all components
```

### [ ] 2. Update `frontend/src/hooks/useApi.js`
```
- Preserve full error: return { error, status }
- Don't strip err.status/err.statusCode
```

### [ ] 3. Update `frontend/src/api.js`
```
- Throw consistent: new ApiError(message, status, data)
- Enhanced console logging with full details
```

### [ ] 4. Fix `frontend/src/pages/Register.jsx`
```
- Replace err.response?.status → err.status
- Use errorHandler(status) for messages
```

### [ ] 5. Update Dashboard action handlers
```
- showNotification(`Error ${error.status}: ${errorHandler(error.status)}`)
```

### [ ] 6. Test & Verify
```
- Browser devtools: Status codes in UI alerts/toasts
- Console: Clean error logs  
- All pages: Consistent error display
```

## Success Criteria
- UI shows "Error 400: Bad Request" instead of "Request failed"
- Works across Register, Dashboard, all API calls
- Console logs preserved for debugging
