# react-preload-link

[![npm version](https://img.shields.io/npm/v/react-preload-link.svg)](https://www.npmjs.com/package/react-preload-link)
[![npm downloads](https://img.shields.io/npm/dm/react-preload-link.svg)](https://www.npmjs.com/package/react-preload-link)

A superversion of [React Router's](https://github.com/ReactTraining/react-router) Link component that preloads your data before navigating. Built with and for [React](http://facebook.github.io/react/index.html).

## Demo

Live demo: [https://sandervspl.github.io/react-preload-link/](https://sandervspl.github.io/react-preload-link/)

## Installation

NPM

```js
npm install --save react-preload-link
```

YARN

```js
yarn add react-preload-link
```

## Usage

```js
import PreloadLink from 'react-preload-link';

const PreloadExample = () => {
    const loadProfile = () => {
        return fetch('https://someapi.com/api/v1/user/me')
            .then(result => doSomething(result));
    };
    
    const loadFriends = () => {
        return fetch('https://someapi.com/api/v1/user/1/friends')
            .then(result => doSomething(result));
    }
    
    return (
        <div>
            <PreloadLink to="profile" load={loadProfile}>
                View profile
            </PreloadLink>
            
            <PreloadLink to="friends" load={[loadProfile, loadFriends]}>
                View friends
            </PreloadLink>
        </div>
    );
};
```

## Props
```ts
PreloadLinkProps {
    to: string,
    load?: () => Promise<any> | Array<() => Promise<any>>,
    onLoading?: (defaultHook: () => void) => any,
    onSuccess?: (defaultHook: () => void) => any,
    onFail?: (defaultHook: () => void) => any,
    onNavigate?: (defaultHook: () => void) => any,
    loadMiddleware?: (data: any) => any,
    noInterrupt?: boolean,
    className?: string,
    navLink?: boolean,
    activeClassName?: string,
    onClick?: () => any,
}
```

### to (Required)
> `string`

The URL to which the app will navigate to. If `load` is used, it will navigate after the `load` function(s) resolve. The only required prop.

### load
> `() => Promise<any> | Array<() => Promise<any>>`

Promise that will be resolved before navigating to the URL provided by `to`. This can be a single function or multiple in an Array. **Must be a function that returns a Promise!** It will wait for everything to resolve before navigating.

**Note**: If you see an error that says "Can not read then of undefined" then one of your passed functions does not return a Promise.

### onLoading, onSuccess, onFail, onNavigate
> `(defaultHook: () => void) => void`

Overriding the default hooks, set with `configure`, can be done with these props. The default hook is passed as a parameter.

### loadMiddleware
> `(data: any) => void`

Will fire for each of your resolved Promises. The resolved data is passed as a parameter.

**Note:** This will fire multiple times if you pass an Array to `load`.

### noInterrupt
> `boolean` | Default `false`

 PreloadLinks with this prop can not have their `load` be interrupted by any other PreloadLink.
 
### className
> `string`

The CSS class to be set on the `<a>` element.

### navLink
> `boolean` | Default `false`

Use React-Router's `NavLink` instead of `Link`. This will give it the same benefits as the regular `NavLink`.

### activeClassName
> `string`

CSS class to be set on the `<a>` element when its route is active.

### onClick
> `() => void`

For any methods that should be fired instantly on click. Use this for methods that are not async.

**Note:** will not fire if another PreloadLink process is busy and this process is not interruptible. This happens when a `noInterrupt` PreloadLink was clicked.

## Configuring lifecycle hooks

You can create hooks for the various lifecycle methods of PreloadLink. These functions will only be called if a `load` prop is passed to the component. These functions will only be called once, even if you pass an array to `load`. It's recommended to only use `configure` once, like at the entry of your app.

### Example
You can hook up a global loader with these hooks very easily. Here is an example on how to use [NProgress](https://github.com/rstacruz/nprogress/) together with PreloadLink.

```js
import { configure } from 'react-preload-link';
import NProgress from 'nprogress';

configure({
    onLoading: NProgress.start,
    onFail: NProgress.done,
    onSuccess: NProgress.done,
)};
```

### Type
```ts
PreloadLinkConfigOptions {
    onLoading?: () => any;
    onSuccess?: () => any;
    onFail?: () => any;
    onNavigate?: () => any;
}
```

### onLoading
> `() => any`

Fires once when the load process has started. Only fires when `load` prop has been used.

### onSuccess
> `() => any`

Fires once when the all Promises have been resolved. Success is fired *before* navigation. Only fires when `load` prop has been used.

### onFail
> `() => any`

Fires once when one of the Promised from `load` fails or rejects. Only fires when `load` prop has been used.

### onNavigate
> `() => any`

Fires once *after* navigation. Always fires.
