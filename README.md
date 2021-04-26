# React library for Confirmic cookie widget

React wrapper around [Confirmic](http://confirmic.com/)'s cookie consent solution.

## Install
```
# With npm
npm i @confirmic/react

# With Yarn
yarn add @confirmic/react
```

## Usage

This component implements the [Confirmic SDK](https://confirmic.com/reference#the-confirmic-sdk) to make getting consent in your React app easy.

### Quickstart

```jsx
import { ConsentGate, ConfirmicProvider } from '@confirmic/react'

const MyApp = () => (
  <ConfirmicProvider projectId="my-project-id">
    <>
      <ConsentGate micropolicy="my-policy">
        <MaybeBlockedComponent />
      </ConsentGate>
      <OtherComponent>
    </>
  </ConfirmicProvider>
)
```

### `<ConfirmicProvider />`
The `<ConfirmicProvider>` is the easiest way of getting started.
Just wrap your app with it pass in the `projectId` prop, and it'll inject the script tags for you in your document's head.

Once the scripts have loaded, `<ConfirmicProvider>` will inform any
`<ConsentGate>`s in your code whether they should block or allow their `children`
to render.

**Props**
| Prop         | Type    | Default    | Description                                                                                                                                                                                               |
|--------------|---------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| projectId    | string       | **(required)** | Your [Confirmic project id](https://app.confirmic.com/dashboard/developers)                                                                                                                                    |
| children     | ReactElement | **(required)** | The rest of your app
| autoblocking | boolean      | true           | Whether autoblocking is on. This is separate from the [setting in your dashboard](https://app.confirmic.com/dashboard/autoblocking), and must be set to `true` if you wish to enable autoblocking, so that the autoblocking configuration is also downloaded. |
| debug        | boolean      | false          | Set to `true` to get console logs for when blocking or unblocking happens.                                                                                                                                |


### `<ConsentGate />`
The main component is the `<ConsentGate>`, which tells React whether to
render its `children` or not, based on whether the user has accepted the given
`micropolicy`.

```jsx
import {ConsentGate} from '@confirmic/react'

const MyApp = () => (
  <ConsentGate micropolicy="my-policy">
    <MaybeBlockedComponent />
  </ConsentGate>
)
```

If you want to render a [Placeholder](https://confirmic.com/docs/placeholders)
in place of the blocked Component, simply add the `placeholder` prop. You
can also pass in any parameters you want by passing a an object into the `placeholderParams` prop.

```jsx
import {ConsentGate} from '@confirmic/react'

const MyApp = () => (
  <ConsentGate
    micropolicy="my-policy"
    placeholder="/my-placeholder.html"
    placeholderParams={{
      color: 'blue',
      position: 'left',
    }}
  >
    <MaybeBlockedComponent />
  </ConsentGate>
)
```

| Prop              | Type         | Default     | Description                                                                                                                                     |
|-------------------|--------------|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| micropolicy       | string       | **(required)**  | The micropolicy powering this `<ConsentGate/>`.                                                                                                 |
| children          | ReactElement | **(required)** | The component that should be blocked or unblocked. Only one node is allowed, but you may wrap multiple children in a React Fragment if desired. |
| placeholder       | string       | `undefined`    | The url pointing to your Placeholder. You may also use one of the [standard Confirmic placeholders](https://confirmic.com/docs/placeholder-library)  |
| placeholderParams | object       | `undefined`    | Any arbitrary params you wish to pass to the Placeholder.                                                                                       |

### Writing your own Placeholders

See the main documentation [here](https://confirmic.com/docs/writing-your-own-placeholders).

If the `children` of a `<ConsentGate />` is a native DOM component (e.g. `<img>`
`<picture>`, `<iframe>`, etc.), your placeholder will get the `text` property
in its [`onReady()` payload](https://confirmic.com/reference#onready).

If `children` is a custom React component that you write or import from a
library, the `text` property will simply be `undefined`. In most cases, you
should rely on the `placeholderParams` prop to customise your placeholder,
rather than parsing the DOMString representing the rendered HTML.

### Difference with HTML manual blocking
Because React isn't parsed the same way as regular HTML, we don't need a separate
mechanisms for blocking [different kinds of HTML elements](https://confirmic.com/docs/manual-blocking).

That is, instead of wondering if you should mutate the tag or wrap it, in React
you **always** wrap the component you want to block.

```jsx
import {ConsentGate} from '@confirmic/react'

const MyApp = () => (
  <ConsentGate
    micropolicy="my-policy"
    placeholder="/my-placeholder.html"
    placeholderParams={{
      color: 'blue',
      position: 'left',
    }}
  >
    <script src="some-external-thing.js" />
  </ConsentGate>
)
```

## Advanced Usage

If you want to control loading the Confirmic snippet outside of your React app,
you can choose not to use the `<ConfirmicProvider>`. Since `<ConfirmicProvider>`
inserts the Confirmic scripts via a side effect, this might not be compatible
with your architecture.

Because `<ConfirmicProvider>` is simply syntactic sugar over the React Context
that `<ConsentGate>` uses, you may simply write your own Context Provider:

```jsx
import {ConfirmicContext} from '@confirmic/react'
const MyConfirmicProvider = () => <ConfirmicContext.Provider
  value={{
    // Only set this to true if, by the time the Provider is rendered, you
    // are sure that the `window.Confirmic` object is initialised. If you
    // have the snippet in your base HTML, this will be true.
    isReady: true,
    // Provide any function used for debugging.
    // If you wish to silence debug statements, pass in a noop () => {}
    debug: (...a) => console.log(`[confirmic]`, ...a),
    /* The set of rules powering autoblocking, keyed by micropolicy name:
      {
        micropolicy1: [rule1, rule2],
        micropolicy2: [rule1, rule2]
      }
      This is only used for debugging purposes for now, but might be used
      in future.
    */
    autoblockingRules: {},
  }}>
  {children}
</ConfirmicContext.Provider>
```