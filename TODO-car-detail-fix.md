# TODO: Fix selectedBranchId error in CarDetail.jsx

## Steps to complete:

- [ ] Step 1: Add `useState` for `selectedBranchId` at top-level hooks
- [ ] Step 2: Add `useEffect` to set default `selectedBranchId = car?.branchId`
- [ ] Step 3: Add branch selector dropdown in booking form (using `branches` state)
- [ ] Step 4: Update `handleBook()` - add branch validation, remove redundant `const branchId`
- [ ] Step 5: Add UX polish (loading state, disable selector if no branches)

**Status:** Starting implementation...

**Goal:** Fix ReferenceError, enable branch selection for bookings with car.branchId fallback.
