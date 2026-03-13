# TODO: Fix Blank Page - F1 Comedor Frontend

## Plan Breakdown

1. ✅ Diagnosed: Invalid `<motion.routes>` and missing `<Routes>` wrapper in src/App.jsx causing React render error.

2. ☐ Fix src/App.jsx:
   - Replace `<motion.routes>` block with proper `<Routes></Routes>`.
   - Fix `getDefaultRoute` calls (user?.role consistency).
   - Keep AnimatePresence.

3. ☐ Test: Browser HMR updates, navigate /login, click 'Admin' demo button → Dashboard (F1 desktop app visual).

4. ☐ Optional: Start backend if API needed (uvicorn).

After Step 2 complete, page will show F1 login, demo access to comedor scanner/monitor/dashboard.

Estimated: 1 edit, instant HMR.
