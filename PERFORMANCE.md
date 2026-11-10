Initial chunk files | Names            |  Raw size | Estimated transfer size
chunk-BChC7EHU.js   | -                | 187.52 kB |                54.80 kB
main-X7GUOZN2.js    | main             |  96.58 kB |                24.94 kB
styles-5INURTSO.css | styles           |   0 bytes |                 0 bytes

                    | Initial total    | 284.10 kB |                79.74 kB

Lazy chunk files    | Names            |  Raw size | Estimated transfer size
chunk-DsVyfZaG.js   | attribute-routes |  61.64 kB |                11.86 kB
chunk-BxbgBmUZ.js   | -                |  49.24 kB |                10.14 kB
chunk-DBtzEIsc.js   | dashboard        |  12.25 kB |                 3.56 kB
chunk-BcRLqQRF.js   | login            |   6.48 kB |                 1.84 kB
chunk-DgJyDUcY.js   | -                |   3.92 kB |                 1.23 kB
chunk-CdOaZbiV.js   | page-not-found   | 540 bytes |               540 bytes


# Performance Baseline

## 1. Overview

A baseline performance audit was conducted using Google Chrome Lighthouse on the production build of the Attribute Management Angular application.

- **Application:** Attribute Management
- **Environment:** Production build
- **URL:** `http://localhost:8080/attributes`
- **Audit Tool:** Chrome Lighthouse
- **Device:** Mobile
- **Audit Mode:** Navigation

## 2. Lighthouse Performance Results

| Metric | Baseline Result |
|---|---:|
| Performance Score | 97/100 |
| First Contentful Paint (FCP) | 1.8 s |
| Largest Contentful Paint (LCP) | 2.5 s |
| Total Blocking Time (TBT) | 40 ms |
| Cumulative Layout Shift (CLS) | 0 |
| Speed Index | 1.8 s |

## 3. Initial Bundle Sizes

The following JavaScript resources were observed in Chrome DevTools Network tab while loading the Attributes page.

| JavaScript File | Transferred Size |
|---|---:|
| chunk-BChC7EHU.js | 63.7 kB |
| main-AJLRAU7I.js | 29.3 kB |
| chunk-CH3BmPN0.js | 14.7 kB |
| chunk-B2CbkNs7.js | 1.7 kB |
| chunk-BxbgBmUZ.js | 12.1 kB |
| **Total** | **121.5 kB** |

Note: These are the transferred sizes displayed in Chrome DevTools Network tab for the tested page load.

## 4. Production Build Bundle Summary

| Bundle Type | Raw Size | Estimated Transfer Size |
|---|---:|---:|
| Initial Bundles | 284.10 kB | 79.74 kB |

Lazy-loaded chunks include the Attributes, Dashboard, Login, and Page Not Found routes.

## 5. Screenshots

The following screenshots are stored in `Screenshots/Assignment5/`:

- `baseline-network.png` – Initial JavaScript bundle requests and transferred sizes.
- `baseline-lighthouse.png` – Lighthouse Performance score and metrics.

## 6. Conclusion

The initial production performance audit achieved a Lighthouse Performance score of **97/100** on mobile.

The application demonstrated a low Total Blocking Time of 40 ms and zero Cumulative Layout Shift.

These measurements establish the baseline for evaluating future performance optimizations.