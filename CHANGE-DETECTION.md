# Change Detection Strategy: OnPush

## 1. Objective

The objective of this task was to switch all Angular components from the default change detection strategy to `ChangeDetectionStrategy.OnPush`.

OnPush improves change detection performance by allowing Angular to check a component when specific triggers occur instead of checking it during every change detection cycle.

## 2. Implementation

The following 14 components were updated to use OnPush:

| # | Component | Change Detection |
|---|---|---|
| 1 | App | OnPush |
| 2 | AttributeCardComponent | OnPush |
| 3 | AddAttributeComponent | OnPush |
| 4 | AttributeListComponent | OnPush |
| 5 | EditAttributeComponent | OnPush |
| 6 | LoginComponent | OnPush |
| 7 | DashboardComponent | OnPush |
| 8 | CardWrapper | OnPush |
| 9 | CollapsibleSection | OnPush |
| 10 | ConfirmDialog | OnPush |
| 11 | DataTable | OnPush |
| 12 | LoaderComponent | OnPush |
| 13 | PageNotFoundComponent | OnPush |
| 14 | ToastComponent | OnPush |

The strategy was configured using:

```typescript
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  // Other component metadata
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

## 3. How OnPush Works

Angular checks an OnPush component when:

- An input binding receives a new value or object reference.
- An event handler inside the component executes.
- A signal read by the component's template changes.
- An observable subscribed to using AsyncPipe emits a new value.
- The component is explicitly marked for checking using `ChangeDetectorRef.markForCheck()`.

## 4. Issues and Fixes

All components were tested after enabling OnPush. No new runtime failures were observed during testing.

Some components already used mechanisms that work correctly with OnPush.

### A. AttributeListComponent

**Existing mechanism:** `ChangeDetectorRef.markForCheck()` and AsyncPipe.

**Why it works:** Manual subscriptions update component properties. Calling `markForCheck()` marks the component for checking. AsyncPipe handles observable updates automatically.

### B. EditAttributeComponent

**Existing issue to account for:** Lookup and save operations update component properties through manual subscriptions.

**Solution:** Added `ChangeDetectorRef.markForCheck()` after these asynchronous updates.

**Why it works:** Angular is explicitly notified that the OnPush component needs to be checked.

### C. DashboardComponent

**Mechanism:** AsyncPipe for summary, chart, and activity observables.

**Why it works:** AsyncPipe automatically marks the component for checking whenever an observable emits.

### D. LoaderComponent

**Mechanism:** AsyncPipe for the loading-state observable.

**Why it works:** AsyncPipe updates the component view when the loading state changes.

### E. ToastComponent

**Mechanism:** Angular Signals.

**Why it works:** Angular tracks signals read in the template and marks the component for checking when their values change.

### F. DataTableComponent

**Mechanism:** Input bindings and output events.

**Why it works:** New input references trigger checks, while sorting and pagination events trigger change detection.

### G. CollapsibleSection

**Mechanism:** Template event handler.

**Why it works:** Clicking the toggle button triggers change detection for the component.

### H. ConfirmDialog

**Mechanism:** Input bindings and output events.

**Why it works:** Input changes and user interactions trigger the appropriate checks.

### I. AttributeCardComponent

**Mechanism:** Input binding.

**Why it works:** Angular checks the component when its attribute input receives a new reference. Immutable updates are important when changing objects.

### J. Remaining Components

App, AddAttributeComponent, LoginComponent, CardWrapper, and PageNotFoundComponent were tested successfully with OnPush. Their existing event-driven, reactive-form, projected-content, or static rendering behavior did not require additional change detection code.

## 5. Immutable Updates

With OnPush, directly mutating an existing object or array may not trigger change detection because its reference remains unchanged.

Prefer immutable updates.

Example:

```typescript
// Avoid mutating the existing array
this.attributes.push(newAttribute);

// Create a new array reference
this.attributes = [
  ...this.attributes,
  newAttribute
];
```

For objects:

```typescript
// Create a new object reference
this.attribute = {
  ...this.attribute,
  attributeName: 'Updated Name'
};
```

## 6. Testing Performed

The following scenarios were tested after enabling OnPush:

- Attribute listing and card view.
- Attribute creation and editing.
- Attribute deletion and confirmation dialog.
- Sorting and pagination.
- Dashboard summary cards and chart updates.
- Dashboard recent activity.
- Collapsible dashboard sections.
- Login, role selection, and navigation.
- Loader visibility during API requests.
- Success and error toast notifications.
- Automatic toast dismissal.
- Page-not-found navigation.
- Project build.

All tested functionality continued to work with OnPush.

## 7. Build Verification

Command:

```bash
ng build
```

Result: Application bundle generation completed successfully.

Initial bundle:
- Raw size: 284.10 kB
- Estimated transfer size: 79.72 kB

Lazy-loaded chunks were generated successfully.

One CSS budget warning remains:

`attribute-list.css` is 7.20 kB against a configured 4.00 kB budget.

This warning is unrelated to the OnPush implementation.

## 8. Conclusion

All 14 Angular components now use `ChangeDetectionStrategy.OnPush`.

The application was tested after the changes, and the production build completed successfully.

The implementation uses AsyncPipe, Angular Signals, immutable updates, template events, and `ChangeDetectorRef.markForCheck()` where appropriate, without switching any component back to Default change detection.