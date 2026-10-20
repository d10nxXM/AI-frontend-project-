---
description: Run the unit and end-to-end tests
---

1. From the repo root run `pnpm test` (Vitest unit tests), then `pnpm test:e2e` (Playwright, at 375 px and 1440 px; it starts the dev server itself or reuses a running one)
2. For every failing test: read the error, the screenshot and `error-context.md` in `frontend/test-results/`, and decide whether the app is wrong or the test is out of date
   - App is wrong: fix the code and run the tests again
   - Test is out of date (the behaviour changed on purpose): ask me before changing the test
   - Never weaken an assertion or delete a test just to make it pass
3. Give me a short report: how many tests passed and failed in each run, what you fixed, and anything I should decide
