# Bugs and Fixes Log

This document records three deliberately introduced bugs from Assignment 2, the symptoms observed, the root cause, and the fix applied.

---

## Bug A: Memory leak caused by subscribing in `ngOnInit()` without cleanup

### Problem
A subscription was created inside `ngOnInit()` without unsubscribing when the component was destroyed.

### What was observed
When the user navigated away from the page and returned several times, the console showed repeated log entries from multiple old subscriptions. The app kept processing work from destroyed components.

### Why it happened
Angular does not automatically unsubscribe from manually created RxJS subscriptions. If a component is destroyed, any subscription created in `ngOnInit()` continues to live unless it is explicitly cleaned up.

### Root cause
The code used a subscription that was not tied to the component lifecycle. This created a memory leak and caused duplicate side effects.

### Correct fix
Use Angular lifecycle cleanup with `takeUntilDestroyed()` and `DestroyRef`.

```ts
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const destroyRef = inject(DestroyRef);

interval(2000)
  .pipe(takeUntilDestroyed(destroyRef))
  .subscribe(count => {
    console.log('AttributeList subscription:', count);
  });
```

### Result
The subscription is cleaned up automatically when the component is destroyed, preventing duplicate logs and memory leaks.

---

## Bug B: `mergeMap()` used instead of `switchMap()` for search

### Problem
The reactive search pipeline used `mergeMap()` instead of `switchMap()`.

### What was observed
When the user typed quickly, multiple search requests remained active at the same time. An older request could finish after a newer request and overwrite the latest search results.

### Why it happened
`mergeMap()` allows every emitted search term to create a parallel inner subscription. It does not cancel the previous request when a new term arrives.

### Root cause
Search behavior required the latest request to win, but `mergeMap()` let stale requests continue and update the UI out of order.

### Correct fix
Use `switchMap()` so that the latest search term cancels the previous request.

```ts
searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(searchTerm =>
    this.attributeService.searchAttributes(searchTerm).pipe(
      catchError(() => of([]))
    )
  )
);
```

### Result
Only the newest search request is kept active, so the displayed results always match the latest input.

### Difference between `mergeMap()` and `switchMap()`

| Operator | Behavior |
| --- | --- |
| `mergeMap()` | Allows multiple requests to run concurrently |
| `switchMap()` | Cancels the previous request when a new value arrives |

`switchMap()` is the correct choice for autocomplete and live search because the latest query should determine the visible result.

---

## Bug C: `Subject` used instead of `BehaviorSubject` in shared state

### Problem
A shared service used `Subject` instead of `BehaviorSubject`.

### What was observed
When a component subscribed after a value had already been emitted, it did not receive the last stored value. Only future emissions were seen.

### Why it happened
A plain `Subject` does not replay previous values. It emits only to active subscribers at the moment of emission.

### Root cause
The service needed to share the latest state with new subscribers immediately, but `Subject` did not retain the most recent value.

### Correct fix
Use `BehaviorSubject` with an initial value.

```ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedDataService {
  private dataSubject = new BehaviorSubject<string>('');

  data$ = this.dataSubject.asObservable();

  updateData(value: string): void {
    this.dataSubject.next(value);
  }
}
```

### Result
New subscribers receive the current value immediately, even if it was emitted before they subscribed.

### Difference between `Subject` and `BehaviorSubject`

| Type | Behavior |
| --- | --- |
| `Subject` | No replay, emits only future values |
| `BehaviorSubject` | Stores the latest value and replays it to new subscribers |

For state management and shared app data, `BehaviorSubject` is generally the safer and more useful choice.

---

## Summary

These three bugs highlight common RxJS mistakes:

1. forgetting lifecycle cleanup
2. using the wrong flattening operator for search
3. using a subject where replayed state is required

Each issue was fixed by applying the correct RxJS pattern and ensuring the app behavior matches the intended state flow.
