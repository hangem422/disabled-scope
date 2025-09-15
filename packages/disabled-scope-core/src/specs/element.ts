export type FocusableTarget = HTMLElement | { focus(): void };
export type SelectableInput = FocusableTarget & { select(): void };

export function focus(element?: FocusableTarget | null, { select = false } = {}) {
  if (element && typeof element.focus === 'function') {
    const previouslyFocusedElement = document.activeElement;
    element.focus({ preventScroll: true });

    if (element !== previouslyFocusedElement && isSelectableInput(element) && select) {
      element.select();
    }
  }
}

function isSelectableInput(element: unknown): element is SelectableInput {
  return element instanceof HTMLInputElement && typeof element.select === 'function';
}

export function focusFirstTabbableElements(container: HTMLElement, { select = false } = {}) {
  const elements = removeLinks(getTabbableCandidates(container));

  if (elements.length > 0) {
    focusFirst(elements, { select });
  } else {
    focus(document.body, { select });
  }
}

export function focusNextTabbableElement(container: HTMLElement, { select = false } = {}) {
  const elements = removeLinks(getTabbableCandidates(container));
  const prev: HTMLElement[] = [];
  const next: HTMLElement[] = [];

  for (const el of elements) {
    if (container.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) {
      prev.push(el);
    }
    if (container.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) {
      next.push(el);
    }
  }

  const sortedElements = [...next, ...prev];
  if (sortedElements.length > 0) {
    focusFirst(sortedElements, { select });
  } else {
    focus(document.body, { select });
  }
}

function focusFirst(candidates: HTMLElement[], { select = false } = {}) {
  const previouslyFocusedElement = document.activeElement;

  for (const candidate of candidates) {
    if (candidate === previouslyFocusedElement) {
      return;
    }

    focus(candidate, { select });
    if (document.activeElement !== previouslyFocusedElement) {
      return;
    }
  }
}

function getTabbableCandidates(container: HTMLElement) {
  const nodes: HTMLElement[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      if (container.contains(node)) {
        return NodeFilter.FILTER_SKIP;
      }

      if (isNodeDisabled(node) || isNodeHiddenInput(node)) {
        return NodeFilter.FILTER_SKIP;
      }

      return isNodeTabbable(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });

  while (walker.nextNode()) {
    nodes.push(walker.currentNode as HTMLElement);
  }

  return nodes;
}

function isNodeHiddenInput(node: Node): boolean {
  return 'tagName' in node && node.tagName === 'INPUT' && 'type' in node && node.type === 'hidden';
}

function isNodeDisabled(node: Node): boolean {
  return ('disabled' in node && node.disabled === true) || ('hidden' in node && node.hidden === true);
}

function isNodeTabbable(node: Node): boolean {
  return 'tabIndex' in node && typeof node.tabIndex === 'number' && node.tabIndex >= 0;
}

function removeLinks(items: HTMLElement[]) {
  return items.filter((item) => item.tagName !== 'A');
}
