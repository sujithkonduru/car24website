# TODO: Fix createStaff Export Error

## Plan Steps:
- [x] 1. Edit ./frontend/src/api.js: Add named exports for createStaff (alias createManagement), getStaff (alias getBranchStaff), updateStaff, deleteStaff to match AdminDashboard.jsx imports.
- [ ] 2. Test frontend: cd frontend && npm run dev, check AdminDashboard loads without SyntaxError.
- [ ] 3. Verify staff creation works (calls /roleauth/createMangement backend).
- [ ] 4. Check for other missing exports and update if needed.
- [ ] 5. Mark complete.

Current status: Step 1 complete. api.js updated with staff exports.
