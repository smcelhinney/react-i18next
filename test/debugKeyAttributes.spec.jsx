import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, cleanup, screen } from '@testing-library/react';
import i18n from './i18n';
import { setI18n, setDefaults, getDefaults } from '../src/context';
import { Trans } from '../src/Trans';
import { useTranslation } from '../src/useTranslation';

// Set the i18n instance for hooks
setI18n(i18n);

describe('debugKeyAttributes', () => {
  beforeEach(() => {
    // Reset to default before each test
    setDefaults({ debugKeyAttributes: false });
  });

  afterEach(() => {
    cleanup();
    setDefaults({ debugKeyAttributes: false });
  });

  describe('Trans component', () => {
    it('should NOT add debug attributes when debugKeyAttributes is false (default)', () => {
      setDefaults({ debugKeyAttributes: false });

      function TestComponent() {
        return (
          <Trans i18nKey="key1" parent="span">
            test
          </Trans>
        );
      }

      const { container } = render(<TestComponent />);
      expect(container.firstChild).toMatchInlineSnapshot(`
        <span>
          test
        </span>
      `);
      expect(container.firstChild).not.toHaveAttribute('data-i18n-key');
    });

    it('should add debug attributes when debugKeyAttributes is true', () => {
      setDefaults({ debugKeyAttributes: true });

      function TestComponent() {
        return (
          <Trans i18nKey="key1" parent="span">
            test
          </Trans>
        );
      }

      const { container } = render(<TestComponent />);
      const element = container.firstChild;

      expect(element).toHaveAttribute('data-i18n-key', 'key1');
      expect(element).toHaveAttribute('data-i18n-namespace', 'translation');
    });

    it('should support custom attribute names via object config', () => {
      setDefaults({
        debugKeyAttributes: {
          keyAttributeName: 'data-test-key',
          namespaceAttributeName: 'data-test-ns',
        },
      });

      function TestComponent() {
        return (
          <Trans i18nKey="key1" parent="span">
            test
          </Trans>
        );
      }

      const { container } = render(<TestComponent />);
      const element = container.firstChild;

      expect(element).toHaveAttribute('data-test-key', 'key1');
      expect(element).toHaveAttribute('data-test-ns', 'translation');
      expect(element).not.toHaveAttribute('data-i18n-key');
    });

    it('should still add attributes using defaultTransParent when parent is null', () => {
      // When debugKeyAttributes is enabled, even if parent={null}, the defaultTransParent kicks in
      // and attributes are added to the default wrapper
      setDefaults({ debugKeyAttributes: true });

      function TestComponent() {
        return (
          <Trans i18nKey="key1" parent={null}>
            test
          </Trans>
        );
      }

      const { container } = render(<TestComponent />);
      const element = container.firstChild;

      // Even with parent={null}, defaultTransParent ('div' from i18n config) is used
      // and debug attributes are added
      expect(element.tagName).toBe('DIV');
      expect(element).toHaveAttribute('data-i18n-key', 'key1');
      expect(element).toHaveAttribute('data-i18n-namespace', 'translation');
    });

    it('should handle specified namespace', () => {
      setDefaults({ debugKeyAttributes: true });

      function TestComponent() {
        return (
          <Trans i18nKey="transTest1" ns="other" parent="span">
            test
          </Trans>
        );
      }

      const { container } = render(<TestComponent />);
      const element = container.firstChild;

      expect(element).toHaveAttribute('data-i18n-key', 'transTest1');
      expect(element).toHaveAttribute('data-i18n-namespace', 'other');
    });
  });

  describe('useTranslation hook', () => {
    it('should return wrapped t function when debugKeyAttributes is true', () => {
      setDefaults({ debugKeyAttributes: true });

      function TestComponent() {
        const { t } = useTranslation();
        return <div>{t('key1')}</div>;
      }

      const { container } = render(<TestComponent />);
      const span = container.querySelector('span');

      expect(span).toHaveAttribute('data-i18n-key', 'key1');
      expect(span).toHaveAttribute('data-i18n-namespace', 'translation');
      expect(span.textContent).toBe('test');
    });

    it('should return string when debugKeyAttributes is false', () => {
      setDefaults({ debugKeyAttributes: false });

      function TestComponent() {
        const { t } = useTranslation();
        const result = t('key1');
        // When disabled, t() returns a string
        return <div>{result}</div>;
      }

      const { container } = render(<TestComponent />);

      // No span wrapper when disabled
      expect(container.querySelector('span')).toBeNull();
      expect(container.firstChild.textContent).toBe('test');
    });

    it('should use custom attribute names from object config', () => {
      setDefaults({
        debugKeyAttributes: {
          keyAttributeName: 'data-my-key',
          namespaceAttributeName: 'data-my-ns',
        },
      });

      function TestComponent() {
        const { t } = useTranslation();
        return <div>{t('key1')}</div>;
      }

      const { container } = render(<TestComponent />);
      const span = container.querySelector('span');

      expect(span).toHaveAttribute('data-my-key', 'key1');
      expect(span).toHaveAttribute('data-my-ns', 'translation');
    });
  });

  describe('defaults', () => {
    it('should have debugKeyAttributes default to false', () => {
      // Create a fresh defaults object to check the initial value
      const defaults = getDefaults();
      expect(defaults.debugKeyAttributes).toBe(false);
    });
  });
});
