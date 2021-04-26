import React, {useContext} from 'react';
import {render, fireEvent, createEvent} from '@testing-library/react';
import ConfirmicProvider, {ConfirmicContext} from './ConfirmicProvider';

const Child = () => {
  const {isReady, autoblockingRules} = useContext(ConfirmicContext);
  return isReady ? (
    <ul>
      All rules
      {Object.entries(autoblockingRules).map(([slug, rules]) => (
        <li key={slug}>
          Ruleset for {slug}
          <ol>
            {rules.map(rule => (
              <li key={rule.id}>{rule.name}</li>
            ))}
          </ol>
        </li>
      ))}
    </ul>
  ) : null;
};

const renderTest = autoblocking =>
  render(
    <ConfirmicProvider projectId="some-project-id" autoblocking={autoblocking}>
      <Child />
    </ConfirmicProvider>,
    {
      baseElement: document.documentElement,
    }
  );

describe('ConfirmicProvider', () => {
  beforeEach(() => {
    global.Confirmic = jest.fn();
  });
  describe('when Autoblocking is enabled', () => {
    it('renders the autoblocking config into the head', () => {
      expect(
        renderTest(true).baseElement.querySelector('script[src*="?id="]')
      ).toHaveAttribute('src', expect.stringContaining('some-project-id'));
    });

    it('renders the embed into the head', () => {
      expect(
        renderTest(true).baseElement.querySelector('script[src*="embed"]')
      ).toBeTruthy();
    });

    describe('when both scripts are loaded', () => {
      let baseElement;
      let queryByText;
      beforeEach(() => {
        ({baseElement, queryByText} = renderTest(true));
        const embed = baseElement.querySelector('script[src*="embed"]');
        const config = baseElement.querySelector('script[src*="config.js"]');
        fireEvent(embed, createEvent.load(embed));
        global._mtm = {
          configAutoblocking: {
            rules: [
              {policySlug: 'one', id: 1, name: 'first rule'},
              {policySlug: 'two', id: 2, name: 'second rule'},
              {policySlug: 'one', id: 3, name: 'third rule'},
            ],
          },
        };
        fireEvent(config, createEvent.load(config));
      });
      it('should load Confirmic', () => {
        expect(global.Confirmic).toHaveBeenCalledWith('load', {
          projectId: 'some-project-id',
        });
      });

      it('should provide is ready in the context consumer', () => {
        expect(queryByText('All rules')).toBeTruthy();
      });

      it('should group the rules by slug in the context consumer', () => {
        expect(queryByText('Ruleset for one')).toBeTruthy();
        expect(queryByText('first rule')).toBeTruthy();
        expect(queryByText('third rule')).toBeTruthy();

        expect(queryByText('Ruleset for two')).toBeTruthy();
        expect(queryByText('second rule')).toBeTruthy();
      });
    });
  });

  describe('when Autoblocking is false', () => {
    it('does not render the autoblocking config into the head', () => {
      expect(
        renderTest(false).baseElement.querySelector('script[src*="?id="]')
      ).toBeFalsy();
    });

    it('renders the embed into the head', () => {
      expect(
        renderTest(false).baseElement.querySelector('script[src*="embed"]')
      ).toBeTruthy();
    });
  });
});
