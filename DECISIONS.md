# Design Decisions

This document records the main architectural decisions used in the Attribute Management Angular application, including the alternatives considered and the reasons for the final choice.

## 1. Standalone components over NgModules

Decision:
Use standalone components for the app, rather than organizing the project around NgModules.

Why:
- The project is a medium-sized SPA with clear feature boundaries.
- Standalone components reduce boilerplate and make dependencies explicit.
- The routing setup already uses lazy loaded feature components, which works well with standalone composition.
- It keeps the codebase easier to reason about for new developers.

Alternatives considered:
- Traditional NgModule-based architecture
- Hybrid module + component structure

Reasoning:
The app is modern and feature-oriented, and standalone components better match the Angular 17+ style. They also make it easier to reuse a component without creating a large module graph.

Trade-off:
Standalone architecture can be less familiar to teams moving from older Angular codebases, but it is simpler for this project’s scope and maintainability.

---

## 2. Centralized state with a lightweight StoreService instead of NgRx

Decision:
Use a root `StoreService` backed by `BehaviorSubject` and RxJS streams instead of introducing NgRx.

Why:
- The app state is modest and mostly local to the Angular client.
- The project already uses a small number of state slices: attributes, lookup data, auth state, and loading state.
- This keeps the implementation lighter and easier to understand than a full Redux-style store.

Alternatives considered:
- NgRx Store / Actions / Effects
- Component-local state only
- Signals-only state management

Reasoning:
For this application, a central store is useful because multiple views need access to the same data and auth state. However, the use case does not justify the extra ceremony of NgRx. The store keeps the architecture predictable without overengineering it.

Trade-off:
This solution is intentionally simpler; it does not provide the same scale-oriented tooling as NgRx, but it matches the app’s complexity better.

---

## 3. Route guards for auth and role protection

Decision:
Protect private screens using Angular route guards rather than hiding or disabling actions only in the UI.

Why:
- Security and authorization should be enforced in the routing layer, not only in templates.
- The app has dedicated admin-only routes and login-required routes.
- This prevents direct URL access and keeps business rules consistent.

Alternatives considered:
- Checking auth only inside components
- Storing permissions only in the UI state
- Hardcoding roles in each page

Reasoning:
UI checks are useful for UX, but they are not enough. Guards provide a consistent policy boundary. `roleGuard` rejects unauthorized access before the page loads, while `auth.guard` protects routes that require login.

Trade-off:
Guards add one more layer of logic to reason about, but they reduce the chance of unauthorized access even if the user manually changes the route.

---

## 4. HTTP interceptor for cross-cutting request concerns

Decision:
Handle request IDs, retry behavior, loading signals, and HTTP error translation in a single interceptor.

Why:
- These behaviors apply to every HTTP request and should not be repeated in individual services.
- The project needs consistent timeout-like tracking, request correlation, and global error UX.
- It centralizes loading-state updates, diagnostics, and user messages.

Alternatives considered:
- Per-service error handling
- Component-specific retry logic
- Hardcoded `try/catch` in every data service

Reasoning:
A global interceptor is the cleanest place to keep cross-cutting HTTP rules. It avoids duplication and makes the request pipeline consistent across the application.

Trade-off:
Interceptors can make debugging more indirect because errors are processed centrally, but the benefit of consistency outweighs that complexity in a real app.

---

## 5. DTO mapping layer to separate API contracts from domain models

Decision:
Use `MappingService` to convert API DTOs to `IAttribute` and related domain objects before they reach the UI.

Why:
- The backend exposes snake_case HTTP payloads, while the Angular app uses camelCase domain models.
- This keeps the rest of the codebase cleaner and reduces the chance of leaking API-specific naming conventions into UI code.
- It improves maintainability if the API changes format or field naming.

Alternatives considered:
- Exposing DTOs directly to components
- Mapping inline inside each service method
- Using raw backend models in the frontend

Reasoning:
The DTO layer is a good balance between type safety and maintainability. It ensures the application boundary is explicit and gives a single place to adapt API input/output.

Trade-off:
There is an extra conversion layer, but it saves time when the backend contract evolves.

---

## 6. Use of a dedicated activity log and error log service

Decision:
Separate concerns for user activity tracking and application error logging rather than mixing them into the attribute service or UI layer.

Why:
- Activity log is useful for dashboard reporting and auditing.
- Error logs are needed for admin review and troubleshooting.
- Both concerns are cross-cutting and should not be coupled directly to a feature page.

Alternatives considered:
- Logging activity directly in each page component
- Storing errors only in console output
- Combining all logging into one generic service

Reasoning:
The app benefits from domain-specific services. `ActivityLogService` tracks business events such as create/edit/delete, while `ErrorLogService` records application failures. This separation keeps the feature layer simpler and improves maintainability.

Trade-off:
There are more services to manage, but the responsibilities are clearer.

---

## 7. OnPush change detection for shared UI components

Decision:
Use `ChangeDetectionStrategy.OnPush` in the root app shell and several feature components.

Why:
- The app is built around immutable state changes and observable-driven updates.
- OnPush reduces unnecessary change detection passes and supports better performance.
- It fits the way the app updates store-based state with RxJS streams.

Alternatives considered:
- Default change detection everywhere
- Manual change detection in each component
- Turning off optimization entirely

Reasoning:
This is a practical optimization for Angular applications that rely on observable data streams. It prevents unnecessary rendering while keeping the code straightforward.

Trade-off:
Developers must be disciplined about immutability and observable updates, otherwise unexpected re-renders can occur. In this project, the state model is structured well enough to benefit from OnPush without excessive complexity.

---

## 8. JSON-server-backed mock API for the assignment context

Decision:
Use a JSON server as the persistence layer for attributes, lookups, and activity logs during development.

Why:
- The app needs realistic CRUD behavior without a full backend setup.
- JSON Server is fast to set up and works well for Angular client demos and assignments.
- It supports the required scenarios for listing, filtering, sorting, and editing data.

Alternatives considered:
- In-memory static arrays only
- Full backend service such as ASP.NET or Node API
- LocalStorage-based persistence

Reasoning:
This project is focused on Angular client behavior and architecture, not backend engineering. JSON Server gives enough realism for data operations while keeping development lightweight.

Trade-off:
It is not production-grade infrastructure, but it is appropriate for an assignment and fast experimentation.

---

## Conclusion

These decisions reflect a pragmatic Angular architecture: modern standalone components, a lightweight state layer, strong route-level security, centralized HTTP concerns, and clean separation between domain models and API contracts. The result is an app that is easy to understand, testable, and extensible without unnecessary complexity.
