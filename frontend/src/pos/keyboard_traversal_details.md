# POS Page Keyboard Traversal System

This document explains the keyboard shortcuts, focus behaviors, and function details governing the keyboard traversal system on the POS page.

---

## 1. Global Keyboard Shortcuts
Global shortcuts are handled by a `useEffect` hook listening to the window's `keydown` event in [WholesalePOSPage.tsx](file:///c:/Adinath/invoiso-demoui/my-app/src/pos/WholesalePOSPage.tsx).

| Shortcut Key | Action | Target / Behavior |
| :--- | :--- | :--- |
| **`Ctrl + Q`** | Focus Category Selection | Focuses the first category option (**"All"**). |
| **`Ctrl + P`** / **`Ctrl + F`** | Focus Search Input | Places focus in the product search bar. |
| **`Ctrl + K`** | Focus Product Grid | Focuses the first visible product card in the catalog. |
| **`Ctrl + G`** / **`Ctrl + J`** | Focus Cart | Focuses the first item in the cart (or Settle button if cart is empty). |
| **`Ctrl + B`** | Toggle Sidebar | Shows or hides the customer invoice sidebar. |
| **`Ctrl + Enter`** | Settle Payment | Executes the settle payment action. |
| **`F1`** / **`Ctrl + /`** | Toggle Help Menu | Shows or hides the keyboard shortcuts modal. |
| **`Alt + E`** | Clear Cart | Empties all items from the cart. |
| **`Escape`** | Close Modals / Sidebar | Closes the Help dialog (if open) or the sidebar (if open). |

---

## 2. Component-Specific Traversal Details

### A. Category Selection Buttons
Implemented in [POSProductGrid.tsx](file:///c:/Adinath/invoiso-demoui/my-app/src/pos/POSProductGrid.tsx) using the `handleCategoryKeyDown` handler:
- **`ArrowRight`**: Focuses the next category button.
- **`ArrowLeft`**: Focuses the previous category button.
- **`ArrowDown`**: Focuses the first product card in the product grid.
- **`ArrowUp`**: Focuses the product search input.
- **`Enter`** / **`Space`**: Standard browser behavior that clicks/activates the focused button to filter the catalog by that category.

### B. Product Catalog Grid
Implemented in [POSProductGrid.tsx](file:///c:/Adinath/invoiso-demoui/my-app/src/pos/POSProductGrid.tsx) using the `handleGridKeyDown` handler:
- **`ArrowRight`**: Focuses the next product card.
- **`ArrowLeft`**: Focuses the previous product card.
- **`ArrowDown`**: Focuses the product card directly below in the grid (calculated dynamically based on the current column layout).
- **`ArrowUp`**: Focuses the product card directly above in the grid, or returns focus to the category buttons row.
- **`Escape`**: Returns focus to the product search input.
- **`Enter`** / **`Space`** (on a product card): Add the product to the cart (handled in [POSProductCard.tsx](file:///c:/Adinath/invoiso-demoui/my-app/src/pos/POSProductCard.tsx)).

### C. Cart Summary List
Implemented in [POSCartSummary.tsx](file:///c:/Adinath/invoiso-demoui/my-app/src/pos/POSCartSummary.tsx) using the `handleItemKeyDown` handler:
- **`ArrowRight`**: Increases the item quantity by `1`.
- **`ArrowLeft`**: Decreases the item quantity by `1` (removes it if quantity reaches `0`).
- **`Enter`**: Focuses the next cart item in the list. If it is the last item, it focuses the **"Settle Payment"** button.
- **`Shift + Enter`**: Focuses the previous cart item in the list.
- **`Delete`** / **`Backspace`**: Removes the item from the cart and focuses the next remaining item (or returns focus to the search input if the cart is now empty).

---

## 3. Enter-Key Form Traversal
The entire page container in [WholesalePOSPage.tsx](file:///c:/Adinath/invoiso-demoui/my-app/src/pos/WholesalePOSPage.tsx) handles sequential field navigation:
- Function: `handleEnterTraversal(e, containerRef.current)` (imported from [keyboardUtils.ts](file:///c:/Adinath/invoiso-demoui/my-app/src/keyboardUtils.ts)).
- **`Enter`** (without Shift): Focuses the next focusable input, select, or button on the page.
- **`Shift + Enter`**: Focuses the previous focusable element.
