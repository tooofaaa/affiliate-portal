# Admin Portal Browser Visual Test

## Application Overview

The Admin Portal (inventory-management) is a Next.js 16 application running at http://localhost:3002. It uses Supabase for authentication with a custom cookie named "sb-admin-auth". The portal has role-based access control with roles: super_admin, general_manager, manager_sales, manager_logistics, employee_sales, employee_logistics. Browser testing via Playwright MCP was blocked because @playwright/test is not installed locally in the project node_modules. This plan is based on comprehensive static code analysis of the source files in /home/ubuntu/inventory-management/src/.

## Test Scenarios

### 1. Authentication and Root Redirect Tests

**Seed:** `seed.spec.ts`

#### 1.1. Root page redirects to login when unauthenticated

**File:** `tests/auth/root-redirect.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3002
    - expect: URL should redirect to http://localhost:3002/login
    - expect: Login page should be rendered
    - expect: No dashboard content visible
  2. Check the final URL after redirect
    - expect: URL ends with /login

#### 1.2. Login page has all required form elements

**File:** `tests/auth/login-form.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3002/login
    - expect: Page renders without 500 error
    - expect: Two-column layout visible on desktop: branding panel left, form right
  2. Check for email input field
    - expect: Input with id='login-email' and type='email' is present
    - expect: Label with 'Email' text is associated via htmlFor='login-email'
  3. Check for password input field
    - expect: PasswordInput component renders with name='password'
    - expect: Label with 'Password' text is visible (note: label may be missing htmlFor/id association - accessibility gap)
  4. Check for remember me checkbox
    - expect: Checkbox with name='remember' is present and defaultChecked=true
  5. Check for forgot password link
    - expect: Link to /forgot-password is visible with text from translation key tl.forgotPassword
  6. Check for submit button
    - expect: Submit button renders with text from tl.signIn
    - expect: Button is of type='submit'
  7. Check admin branding
    - expect: Branding panel visible with brandName and brandTagline from translation
    - expect: Logo image at /logo.png
    - expect: Stats: 99.9% Uptime, 10k+ Products, 24/7 Support
    - expect: Language toggle button (EN/AR)

#### 1.3. Login with invalid credentials shows error

**File:** `tests/auth/login-invalid.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3002/login
    - expect: Login page loads
  2. Enter invalid email 'test@test.com' and password 'wrongpassword', click Sign In
    - expect: Error message appears: 'Invalid email or password.'
    - expect: User remains on /login page
    - expect: No redirect to dashboard
  3. Try with empty fields
    - expect: HTML5 validation prevents submission
    - expect: Email field is marked required

#### 1.4. Login with valid admin credentials succeeds

**File:** `tests/auth/login-valid.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3002/login
    - expect: Login page loads
  2. Enter valid admin credentials and submit
    - expect: Server action calls supabase.auth.signInWithPassword
    - expect: Checks admin_user_roles table for role
    - expect: Redirects to /dashboard on success
  3. Verify dashboard is accessible after login
    - expect: URL is http://localhost:3002/dashboard
    - expect: Sidebar renders with role badge
    - expect: Navigation items appropriate for role

#### 1.5. Account deactivated error message on login

**File:** `tests/auth/login-deactivated.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3002/login?error=account_deactivated
    - expect: Amber warning banner appears: 'Your account has been deactivated. Please contact your administrator.'
  2. Attempt login with deactivated account credentials
    - expect: Server returns: 'Your account has been deactivated. Contact your administrator.'
    - expect: User cannot access app

### 2. Protected Routes Tests

**Seed:** `seed.spec.ts`

#### 2.1. /verifications redirects unauthenticated users to login

**File:** `tests/routes/verifications-protection.spec.ts`

**Steps:**
  1. Clear all cookies and navigate to http://localhost:3002/verifications
    - expect: Page-level auth check: if (!user) redirect('/login') fires
    - expect: User is redirected to /login
    - expect: Verifications content is NOT shown
  2. Verify the page has the correct auth guard in source
    - expect: verifications/page.tsx line 17 contains: if (!user) redirect('/login')

#### 2.2. /affiliates redirects unauthenticated users to login

**File:** `tests/routes/affiliates-protection.spec.ts`

**Steps:**
  1. Clear all cookies and navigate to http://localhost:3002/affiliates
    - expect: Page-level auth check fires
    - expect: User is redirected to /login
    - expect: Affiliates content is NOT shown
  2. Verify the page has the correct auth guard in source
    - expect: affiliates/page.tsx line 26 contains: if (!user) redirect('/login')

#### 2.3. CRITICAL: /dashboard missing auth guard (security issue)

**File:** `tests/routes/dashboard-protection.spec.ts`

**Steps:**
  1. Clear all cookies and navigate to http://localhost:3002/dashboard
    - expect: EXPECTED: Redirect to /login
    - expect: ACTUAL RISK: dashboard/page.tsx has NO explicit auth check
    - expect: middleware-manifest.json shows empty middleware (src/proxy.ts is not active as Next.js middleware)
    - expect: Unauthenticated users may see dashboard or receive errors from getDashboardStats()
  2. Check middleware manifest for active middleware
    - expect: .next/server/middleware-manifest.json shows: {"middleware": {}, "sortedMiddleware": []}
    - expect: This confirms NO middleware is protecting any routes globally

#### 2.4. CRITICAL: Middleware not applied (src/proxy.ts naming issue)

**File:** `tests/routes/middleware-not-active.spec.ts`

**Steps:**
  1. Check for middleware file at src/middleware.ts or root middleware.ts
    - expect: Neither src/middleware.ts nor root-level middleware.ts exists
    - expect: Only src/proxy.ts exists which exports a named 'proxy' function (not a default export)
    - expect: Next.js requires middleware to be in a file named middleware.ts/js with a default export
    - expect: This means route protection via middleware is COMPLETELY bypassed
  2. Verify which pages have page-level auth guards
    - expect: Only 4 pages have explicit if (!user) redirect('/login') guards:
    - expect: - verifications/page.tsx
    - expect: - affiliates/page.tsx
    - expect: - management/page.tsx
    - expect: - settings/page.tsx
    - expect: Pages WITHOUT auth guards: dashboard, inventory, orders, sales, customers, reports, finance, tasks, tickets, audit, etc.

#### 2.5. /x-foundation-ctrl requires super_admin role

**File:** `tests/routes/superadmin-route.spec.ts`

**Steps:**
  1. Login as non-super_admin user and navigate to /x-foundation-ctrl
    - expect: middleware would redirect to /dashboard (but middleware is NOT active)
    - expect: page.tsx has double-check: if (role !== 'super_admin') redirect('/dashboard')
    - expect: Non-super_admin users see dashboard instead
  2. Verify page-level super_admin guard
    - expect: x-foundation-ctrl/page.tsx has server-side role check via supabase.rpc('get_my_role')
    - expect: Redirects to /dashboard if not super_admin

### 3. Network Health and Error Tests

**Seed:** `seed.spec.ts`

#### 3.1. API health endpoint returns 200 OK

**File:** `tests/network/api-health.spec.ts`

**Steps:**
  1. Send GET request to http://localhost:3002/api/test
    - expect: Response status: 200
    - expect: Response body: 'OK'
    - expect: No 500 errors

#### 3.2. No JS errors on login page load

**File:** `tests/network/console-errors.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3002/login and check browser console
    - expect: No JavaScript errors in console
    - expect: No 404 errors for static assets
    - expect: Supabase anon key is present in NEXT_PUBLIC_SUPABASE_ANON_KEY
  2. Check network requests on login page
    - expect: Static assets load (CSS, JS bundles)
    - expect: No failed network requests
    - expect: No CORS errors for Supabase endpoint

#### 3.3. Supabase configuration is correct

**File:** `tests/network/supabase-config.spec.ts`

**Steps:**
  1. Check .env.local for Supabase configuration
    - expect: NEXT_PUBLIC_SUPABASE_URL is set to https://efyphjqioljuzqdtwert.supabase.co
    - expect: NEXT_PUBLIC_SUPABASE_ANON_KEY is set and non-empty
    - expect: SUPABASE_SERVICE_ROLE_KEY is set for server-side operations
  2. Verify auth cookie name configuration
    - expect: Middleware uses cookieOptions: { name: 'sb-admin-auth' }
    - expect: Cookie is separate from affiliate portal cookie (sb-affiliate-auth)
