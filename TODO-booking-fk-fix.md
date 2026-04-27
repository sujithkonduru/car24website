# Booking FK Error Fix (userId)

## Status: 🔄 In Progress

### Steps:
- [ ] 1. Create this TODO file ✅
- [ ] 2. Fix user state initialization in CarDetail.jsx (decode token → setUser)
- [ ] 3. Update handleBook(): validate user.id, use correct userId in bookingData
- [ ] 4. Add auth validation before booking
- [ ] 5. Test booking flow
- [ ] 6. Mark complete

### Root Cause:
CarDetail.jsx: `const [user, setUser] = useState(id);` where `id` = car ID from params → sends carId as userId → FK violation.

### Testing:
```
cd frontend
npm run dev
Login → /cars/{id} → Book car → No 500 error
