/**
 * Centralized Keyboard and Focus Utilities for Billing App
 */

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
    )
  ).filter((el) => {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
}

/**
 * Handles Enter/Shift+Enter traversal inside a container
 */
export function handleEnterTraversal(e: React.KeyboardEvent<HTMLElement>, container: HTMLElement | null) {
  if (!container) return;

  const target = e.target as HTMLElement;
  const isInputOrSelect = target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON';
  if (!isInputOrSelect) return;

  if (target.tagName === 'TEXTAREA' && !e.shiftKey) {
    return;
  }

  if (e.key === 'Enter') {
    if (target.tagName === 'BUTTON' && !e.shiftKey) {
      return;
    }
    e.preventDefault();
    const elements = getFocusableElements(container);
    const index = elements.indexOf(target);

    if (e.shiftKey) {
      if (index > 0) {
        elements[index - 1].focus();
      }
    } else {
      if (index !== -1 && index < elements.length - 1) {
        elements[index + 1].focus();
      }
    }
  }
}
