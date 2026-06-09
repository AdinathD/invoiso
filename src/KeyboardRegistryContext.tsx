import React, { createContext, useContext, useRef, useCallback } from 'react';

export interface RegisteredField {
  id: string;
  group: string;
  ref: React.RefObject<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement | HTMLElement | null>;
  onEnter?: (e: React.KeyboardEvent) => boolean | void; // Return true to prevent default traversal
  disabled?: boolean;
}

export interface KeyboardRegistryContextType {
  registerField: (field: RegisteredField) => () => void;
  focusField: (id: string) => void;
  focusNext: (currentId: string, group: string) => void;
  focusPrev: (currentId: string, group: string) => void;
  handleGroupTraversal: (e: React.KeyboardEvent, group: string) => void;
}

const KeyboardRegistryContext = createContext<KeyboardRegistryContextType | null>(null);

export const useKeyboardRegistry = () => {
  const context = useContext(KeyboardRegistryContext);
  if (!context) {
    throw new Error('useKeyboardRegistry must be used within a KeyboardRegistryProvider');
  }
  return context;
};

interface UseKeyboardFieldProps {
  id: string;
  group: string;
  onEnter?: (e: React.KeyboardEvent) => boolean | void;
  disabled?: boolean;
}

export function useKeyboardField({ id, group, onEnter, disabled }: UseKeyboardFieldProps) {
  const ref = useRef<any>(null);
  const registry = useKeyboardRegistry();

  React.useEffect(() => {
    if (disabled) return;
    return registry.registerField({ id, group, ref, onEnter, disabled });
  }, [id, group, onEnter, disabled, registry]);

  return ref;
}

export const KeyboardRegistryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fieldsMapRef = useRef<Map<string, RegisteredField>>(new Map());

  const registerField = useCallback((field: RegisteredField) => {
    fieldsMapRef.current.set(field.id, field);
    return () => {
      fieldsMapRef.current.delete(field.id);
    };
  }, []);

  const focusField = useCallback((id: string) => {
    const field = fieldsMapRef.current.get(id);
    if (field && field.ref.current && !field.disabled) {
      field.ref.current.focus();
    }
  }, []);

  const getSortedFieldsInGroup = useCallback((group: string) => {
    const fields = Array.from(fieldsMapRef.current.values()).filter(
      (f) => f.group === group && f.ref.current && !f.disabled
    );

    // Sort based on compareDocumentPosition to match actual visual DOM order
    return fields.sort((a, b) => {
      const elA = a.ref.current!;
      const elB = b.ref.current!;
      const pos = elA.compareDocumentPosition(elB);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
  }, []);

  const focusNext = useCallback((currentId: string, group: string) => {
    const sorted = getSortedFieldsInGroup(group);
    const index = sorted.findIndex((f) => f.id === currentId);
    if (index !== -1 && index < sorted.length - 1) {
      sorted[index + 1].ref.current?.focus();
    }
  }, [getSortedFieldsInGroup]);

  const focusPrev = useCallback((currentId: string, group: string) => {
    const sorted = getSortedFieldsInGroup(group);
    const index = sorted.findIndex((f) => f.id === currentId);
    if (index > 0) {
      sorted[index - 1].ref.current?.focus();
    }
  }, [getSortedFieldsInGroup]);

  const handleGroupTraversal = useCallback((e: React.KeyboardEvent, group: string) => {
    if (e.key !== 'Enter') return;

    const target = e.target as HTMLElement;
    // Don't traverse out of a textarea with Enter unless shift is pressed
    if (target.tagName === 'TEXTAREA' && !e.shiftKey) {
      return;
    }

    const sorted = getSortedFieldsInGroup(group);
    const currentField = sorted.find(
      (f) => f.ref.current === target || f.ref.current?.contains(target)
    );

    if (!currentField) return;

    // Trigger field-specific enter action first
    if (currentField.onEnter) {
      const handled = currentField.onEnter(e);
      if (handled) {
        e.preventDefault();
        return;
      }
    }

    e.preventDefault();
    const index = sorted.indexOf(currentField);

    if (e.shiftKey) {
      if (index > 0) {
        sorted[index - 1].ref.current?.focus();
      }
    } else {
      if (index !== -1 && index < sorted.length - 1) {
        sorted[index + 1].ref.current?.focus();
      }
    }
  }, [getSortedFieldsInGroup]);

  return (
    <KeyboardRegistryContext.Provider
      value={{
        registerField,
        focusField,
        focusNext,
        focusPrev,
        handleGroupTraversal,
      }}
    >
      {children}
    </KeyboardRegistryContext.Provider>
  );
};
