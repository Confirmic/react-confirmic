import React from 'react';
import {ConfirmicProvider, ConsentGate} from 'lib';

const App = opts => (
  <ConfirmicProvider {...opts}>
    {/** <iframe> */}
    <ConsentGate placeholder="@confirmic/youtube" micropolicy="embedded-videos">
      <iframe
        title="test-iframe"
        src="https://www.youtube.com/embed/AgpWX18dby4?autoplay=1"
        width={680}
        height={315}
        frameBorder={0}
      />
    </ConsentGate>

    {/** <img> */}
    <ConsentGate
      micropolicy="marketing"
      placeholder="@confirmic/generic"
      placeholderParams={{
        title: 'image',
      }}>
      <img
        alt="My face"
        src="https://avatars1.githubusercontent.com/u/2020382?s=60&v=4"
        srcSet="https://avatars1.githubusercontent.com/u/2020382?s=100&v=4 1x, https://avatars1.githubusercontent.com/u/2020382?s=200&v=4 2x"
      />
    </ConsentGate>

    {/** <picture> with <source>s */}
    <ConsentGate
      micropolicy="marketing"
      placeholder="@confirmic/generic"
      placeholderParams={{
        title: 'picture',
      }}>
      <picture>
        <source
          media="(max-width: 799px)"
          srcSet="https://avatars1.githubusercontent.com/u/2020382?s=100&v=4"
        />
        <source
          media="(min-width: 800px)"
          srcSet="https://avatars1.githubusercontent.com/u/2020382?s=200&v=4"
        />
        <img
          src="https://avatars1.githubusercontent.com/u/2020382?s=60&v=4"
          alt="My responsive face"
        />
      </picture>
    </ConsentGate>

    {/** Example React component for Intercom chat. Install react-intercom */}
    {/* <ConsentGate
      placeholder="@confirmic/intercom"
      micropolicy="chat"
      placeholderParams={{
        color: 'green',
      }}>
      <Intercom appID="zwwnvxnx" />
    </ConsentGate> */}
  </ConfirmicProvider>
);

export default App;
