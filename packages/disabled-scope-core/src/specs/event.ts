import { focusFirstTabbableElements, focusNextTabbableElement } from './element';

export const AUTOFOCUS_OUT_ON_MOUNT = 'disabled-scope:autoFocusOutOnMount';
export const EVENT_OPTIONS = { bubbles: false, cancelable: true };

export function addFocusEventListener(container: HTMLElement): VoidFunction {
  function handleFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement | null;
    if (container.contains(target)) {
      focusNextTabbableElement(container, { select: true });
    }
  }

  function handleFocusOut(event: FocusEvent) {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    if (relatedTarget === null) {
      return;
    }

    if (container.contains(relatedTarget)) {
      focusNextTabbableElement(container, { select: true });
    }
  }

  document.addEventListener('focusin', handleFocusIn);
  document.addEventListener('focusout', handleFocusOut);

  return () => {
    document.removeEventListener('focusin', handleFocusIn);
    document.removeEventListener('focusout', handleFocusOut);
  };
}

export function addMountEventListener(
  container: HTMLElement,
  onMountAutoFocus: (event: Event) => void | null | undefined,
): VoidFunction {
  const previouslyFocusedElement = document.activeElement as HTMLElement | null;
  const hasFocusedCandidate = container.contains(previouslyFocusedElement);

  if (hasFocusedCandidate) {
    const mountEvent = new CustomEvent(AUTOFOCUS_OUT_ON_MOUNT, EVENT_OPTIONS);
    container.addEventListener(AUTOFOCUS_OUT_ON_MOUNT, onMountAutoFocus);
    container.dispatchEvent(mountEvent);

    if (!mountEvent.defaultPrevented) {
      focusFirstTabbableElements(container, { select: true });
    }
  }

  return () => {
    container.removeEventListener(AUTOFOCUS_OUT_ON_MOUNT, onMountAutoFocus);
  };
}
