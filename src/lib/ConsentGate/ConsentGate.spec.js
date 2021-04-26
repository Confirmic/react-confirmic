import React from 'react';
import {render, fireEvent, createEvent, act} from '@testing-library/react';
import ConsentGate, {MTM_TAG_TYPE} from './ConsentGate';
import ConfirmicProvider from '../ConfirmicProvider';

const MTM_TAG_SELECTOR = `[type="${MTM_TAG_TYPE}"]`;

function loadConfirmic() {
  const embed = document.head.querySelector('script[src*="embed"]');
  const config = document.head.querySelector('script[src*="config.js"]');
  global._mtm = {};
  act(() => {
    fireEvent(embed, createEvent.load(embed));
    fireEvent(config, createEvent.load(config));
  });
}

describe('ConsentGate', () => {
  beforeEach(() => {
    global.Confirmic = jest.fn();
  });
  afterEach(() => {
    document.head.innerHTML = '';
  });

  describe('When Confirmic is not yet loaded', () => {
    it('should render nothing', () => {
      const {container} = render(
        <ConfirmicProvider projectId="foobar">
          <ConsentGate micropolicy="policy">
            <iframe title="test-iframe" src="some-third-party" />
          </ConsentGate>
        </ConfirmicProvider>
      );
      expect(container).toMatchInlineSnapshot('<div />');
    });
  });

  describe('When Confirmic is loaded', () => {
    let baseElement;
    let queryByTestId;
    beforeEach(() => {
      ({baseElement, queryByTestId} = render(
        <ConfirmicProvider projectId="foobar">
          <ConsentGate micropolicy="policy">
            <picture data-testid="picture" width={123} height={456}>
              <source
                media="(max-width: 799px)"
                srcSet="some-src-set"
                data-testid="source"
              />
              <img src="some-src" alt="some alt" data-testid="img" />
            </picture>
          </ConsentGate>
        </ConfirmicProvider>
      ));
    });
    describe('if the user has consented to the policy', () => {
      beforeEach(() => {
        global.Confirmic.mockImplementation((command, props, callback) => {
          if (command === 'getConsentState') {
            expect(props).toEqual({slug: 'policy'});
            act(() => callback({enabled: true}));
          }
        });
        loadConfirmic();
      });
      it('should render the children', () => {
        expect(queryByTestId('picture')).toBeTruthy();
        expect(queryByTestId('img')).toBeTruthy();
        expect(queryByTestId('source')).toBeTruthy();
      });
    });

    describe('if the user has not yet consented to the policy', () => {
      let onConsentChange;
      beforeEach(() => {
        global.Confirmic.mockImplementation((command, props, callback) => {
          if (command === 'getConsentState') {
            expect(props).toEqual({slug: 'policy'});
            act(() => callback({enabled: false}));
          } else if (command === 'ConsentManager:onConsentStateChange') {
            onConsentChange = props;
          }
        });
        loadConfirmic();
      });
      it('should render the mtmTag with fromReact: true', () => {
        expect(baseElement.querySelector(MTM_TAG_SELECTOR)).toHaveProperty(
          'fromReact',
          true
        );
      });
      it('shoulder render the mtmTag with the dimensions from the children', () => {
        const mtmTag = baseElement.querySelector(MTM_TAG_SELECTOR);
        expect(mtmTag).toHaveAttribute('width', '123');
        expect(mtmTag).toHaveAttribute('height', '456');
      });

      it('should render the children with a blocked src', () => {
        expect(queryByTestId('picture')).toBeTruthy();
        expect(queryByTestId('source')).toHaveAttribute(
          'data-blocked-srcset',
          'some-src-set'
        );
        expect(queryByTestId('img')).toHaveAttribute(
          'data-blocked-src',
          'some-src'
        );
      });

      describe('when the user then consents to another policy', () => {
        beforeEach(() => {
          act(() =>
            onConsentChange({slug: 'other-policy', state: 'CONSENTED'})
          );
        });
        it('should keep the child blocked', () => {
          expect(queryByTestId('picture')).toBeTruthy();
          expect(queryByTestId('source')).toHaveAttribute(
            'data-blocked-srcset',
            'some-src-set'
          );
          expect(queryByTestId('img')).toHaveAttribute(
            'data-blocked-src',
            'some-src'
          );
        });
      });

      describe('when the user then declines the policy', () => {
        beforeEach(() => {
          act(() => onConsentChange({slug: 'policy', state: 'DECLINED'}));
        });
        it('should keep the child blocked', () => {
          expect(queryByTestId('picture')).toBeTruthy();
          expect(queryByTestId('source')).toHaveAttribute(
            'data-blocked-srcset',
            'some-src-set'
          );
          expect(queryByTestId('img')).toHaveAttribute(
            'data-blocked-src',
            'some-src'
          );
        });
      });

      describe('when the user then consents to the policy', () => {
        beforeEach(() => {
          act(() => onConsentChange({slug: 'policy', state: 'CONSENTED'}));
        });
        it('should not render an mtmTag', () => {
          expect(baseElement.querySelector(MTM_TAG_SELECTOR)).toBeFalsy();
        });
        it('should render the children unblocked', () => {
          expect(queryByTestId('picture')).toBeTruthy();
          expect(queryByTestId('source')).toHaveAttribute(
            'srcset',
            'some-src-set'
          );
          expect(queryByTestId('img')).toHaveAttribute('src', 'some-src');
        });
      });
    });
  });
});
