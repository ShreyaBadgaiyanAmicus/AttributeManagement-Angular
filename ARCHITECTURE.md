# Architecture Overview

This application is built as a modular Angular SPA with standalone components, feature-specific folders, and a centralized state store. The goal is to keep business logic close to the feature it supports while still sharing cross-cutting concerns such as authentication, HTTP interception, logging, and toasts at the app root.

## 1. High-level architecture

The app follows a layered pattern:

- Presentation layer: standalone components and shared UI building blocks
- Feature layer: attribute CRUD, dashboard, login, admin error review
- Core layer: state, auth, guards, interceptors, logging, error handling
- Data layer: HTTP client calls to a JSON server-backed API and local in-memory store sync

The application starts in `App`, which renders the shared shell and delegates route-based screen rendering to Angular Router.

---

## 2. Root application composition

`App` is the bootstrap container. It wires in the shared global UI:

- `ToastComponent`
- `LoaderComponent`
- `RouterOutlet`

It also starts the `IdleService` when the application boots so the session can expire automatically after inactivity.

```text
AppComponent
├─ ToastComponent
├─ LoaderComponent
└─ RouterOutlet
   ├─ /attributes -> AttributeListComponent
   │  ├─ AddAttributeComponent
   │  ├─ EditAttributeComponent
   │  └─ AttributeResolver
   ├─ /dashboard -> DashboardComponent
   ├─ /login -> LoginComponent
   ├─ /admin/errors -> ErrorsComponent
   └─ /** -> PageNotFoundComponent
```

---

## 3. Route and feature layout

### Main route map

| Route | Component | Notes |
| --- | --- | --- |
| `/` | redirect to `/attributes` | Default landing route |
| `/attributes` | `AttributeListComponent` | Main list view with search, sorting, pagination and cards/table toggle |
| `/attributes/add` | `AddAttributeComponent` | Admin-only creation screen |
| `/attributes/:id/edit` | `EditAttributeComponent` | Protected edit screen with unsaved-changes guard |
| `/dashboard` | `DashboardComponent` | KPIs and business-unit summary |
| `/login` | `LoginComponent` | Authentication entry point |
| `/admin/errors` | `ErrorsComponent` | Admin-only review of app errors |
| `**` | `PageNotFoundComponent` | Fallback route |

### Feature folders

```text
src/app/
├─ app.config.ts               # Root Angular providers
├─ app.routes.ts               # Top-level router configuration
├─ app.ts                      # App shell
├─ core/
│  ├─ guards/
│  │  ├─ auth.guard.ts
│  │  ├─ role.guard.ts
│  │  └─ unsaved-changes.guard.ts
│  ├─ handlers/
│  │  └─ global-error-handler.ts
│  ├─ interceptors/
│  │  └─ request.interceptor.ts
│  └─ services/
│     ├─ activity-log.ts
│     ├─ auth.ts
│     ├─ error-log.ts
│     ├─ idle.ts
│     ├─ store.ts
│     ├─ toast.service.ts
│     └─ ...
├─ features/
│  ├─ admin/
│  │  └─ errors/
│  ├─ attributes/
│  │  ├─ components/
│  │  ├─ dtos/
│  │  ├─ models/
│  │  ├─ pages/
│  │  ├─ resolvers/
│  │  └─ services/
│  ├─ auth/
│  │  └─ login/
│  └─ dashboard/
├─ shared/
│  ├─ components/
│  ├─ directives/
│  └─ pipes/
└─ environments/
```

---

## 4. Component tree diagram

```text
App
├─ Shared shell
│  ├─ Loader
│  └─ Toast
└─ Route-driven pages
   ├─ LoginPage
   │  └─ LoginComponent
   │     └─ Username / Password form
   ├─ AttributeFeature
   │  ├─ AttributeListPage
   │  │  ├─ Search input
   │  │  ├─ Table view (DataTable)
   │  │  ├─ Card view (AttributeCardComponent)
   │  │  ├─ ConfirmDialog
   │  │  └─ Role/Status badges
   │  ├─ AddAttributePage
   │  │  └─ Add form
   │  └─ EditAttributePage
   │     └─ Edit form + unsaved changes protection
   ├─ DashboardPage
   │  ├─ KPI summary cards
   │  ├─ Business unit chart
   │  └─ Recent activity panel
   ├─ AdminFeature
   │  └─ ErrorsPage
   └─ NotFoundPage
```

This structure keeps pages focused on orchestration while reusable UI primitives live in `shared`.

---

## 5. State management approach

The project uses a single root `StoreService` built on `BehaviorSubject` and RxJS streams. This is a lightweight centralized store rather than an external library such as NgRx or Akita.

### Store shape

`StoreService` manages the application state for:

- attributes
- lookup tables
- loading status
- authentication status
- role + username

Example slices exposed by the store:

- `state$`
- `attributes$`
- `lookups$`
- `isLoading$`
- `isAuthenticated$`
- `role$`
- `username$`

### Why this architecture

- Components can subscribe to narrow streams without duplicated state logic.
- The `AttributeService` and `LookupService` update store slices after HTTP requests.
- `DashboardComponent` and `AttributeListComponent` react efficiently to store emissions.
- Auth-related checks are encapsulated in `AuthService` and guarded by route guards.

### State mutation pattern

The store is updated immutably via helper methods such as:

- `setAttributes(...)`
- `addAttribute(...)`
- `updateAttribute(...)`
- `removeAttribute(...)`
- `setLookups(...)`
- `setLoading(...)`
- `setAuthenticated(...)`

This makes downstream components easier to reason about because state transitions are explicit and centralized.

---

## 6. Cross-cutting concerns

### HTTP layer

The app config registers a global `requestInterceptor` through `provideHttpClient(withInterceptors([requestInterceptor]))`.

Responsibilities of the interceptor:

- inject request ID header on each request
- retry GET requests twice on transient errors
- map HTTP status to user-friendly messages
- log failed requests in `ErrorLogService`
- show toasts for common HTTP failures
- toggle loading state via `StoreService`

### Error handling

`GlobalErrorHandler` catches uncaught app errors and ensures they are:

- logged to `ErrorLogService`
- surfaced to the user through a toast
- written to the browser console for debugging

This gives the app a consistent error UX across the entire feature set.

### Idle timeout / session management

`IdleService` listens to `mousemove` and `keydown` events, tracks user activity, and logs the user out after a fixed inactivity period.

This is coordinated with `AuthService` and the router so the app redirects them to the login screen if they are idle.

---

## 7. Service inventory and responsibilities

| Service | Responsibility |
| --- | --- |
| `StoreService` | Root state container for attributes, lookup data, loading state, auth state, and user identity |
| `AuthService` | Encapsulates login/logout and exposes role-based accessors like `isAdmin` and `isViewer` |
| `IdleService` | Monitors user activity and logs the user out after inactivity timeout |
| `ToastService` | Displays success and error toast messages and auto-clears them after a delay |
| `ErrorLogService` | Keeps a signal-based in-memory array of application errors for admin review |
| `AttributeService` | Handles attribute CRUD and fetch operations over HTTP and syncs them to the store |
| `LookupService` | Fetches and stores business units, customer locations, and companies |
| `MappingService` | Converts DTOs from the API into typed domain models and back again |
| `ActivityLogService` | Persists and streams recent user activity for reporting and dashboard feed |

### Supporting non-service infrastructure

- `AttributeResolver`: loads the selected attribute before the edit route resolves.
- `AuthGuard`: protects screens requiring authenticated users.
- `RoleGuard`: allows only admin users through privileged routes.
- `UnsavedChangesGuard`: prompts before leaving the edit screen with unsaved changes.

---

## 8. Data flow model

### Attribute CRUD flow

```text
User action
   ↓
AttributeListComponent / AddAttributeComponent / EditAttributeComponent
   ↓
AttributeService
   ↓
HttpClient -> JSON server
   ↓
DTO mapping via MappingService
   ↓
Typed IAttribute object
   ↓
StoreService updates attributes slice
   ↓
Subscribers re-render list, cards, dashboard charts, filters
```

### Authentication flow

```text
LoginComponent
   ↓
AuthService.login()
   ↓
StoreService.setAuthenticated(...)
   ↓
Guards evaluate role / auth state
   ↓
Router allows or redirects to /login or /attributes
```

### Error flow

```text
Component / interceptor / global error
   ↓
GlobalErrorHandler or requestInterceptor
   ↓
ErrorLogService.logError()
   ↓
ToastService.showError()
   ↓
User sees friendly error message and log is retained for review
```

---

## 9. Architectural strengths

- Feature-oriented folder structure keeps concerns bounded.
- Standalone components reduce module boilerplate and make dependencies explicit.
- A centralized store keeps the app state predictable and observable.
- Route guards enforce authorization rules in a reusable way.
- HTTP-level interceptors centralize retries, request metadata, and error handling.
- Shared UI primitives are reused consistently across pages.

## 10. Trade-offs

This architecture intentionally favors clarity and maintainability over full enterprise state libraries. It is ideal for a medium-sized Angular application with a strong feature structure and a relatively straightforward data model.

If the app grows into multiple domains with more complex workflows, the next evolution could be:

- more granular feature stores
- a formal state library such as NgRx
- lazy-loaded subdomains with route-level modules
- more server-side or reactive caching patterns

---

## 11. Summary

The application is structured around a single root app shell, route-driven feature pages, and a lightweight state layer built from RxJS and a root `StoreService`. This gives it a clear separation between UI, routing, business logic, and infrastructure concerns while keeping the codebase approachable and testable.
