import * as React from 'react';

export interface PreloadLinkConfigOptions {
    onLoading?: () => any;
    onSuccess?: () => any;
    onFail?: () => any;
    onNavigate?: () => any;
}

export type PreloadLinkConfig = (options: PreloadLinkConfigOptions) => void;

export type PreloadLinkLifecycleHook = (defaultHook: () => void) => any;

type PromiseFn = () => Promise<any>;
export interface PreloadLinkProps {
    to: string,
    load?: PromiseFn | PromiseFn[],
    onLoading?: PreloadLinkLifecycleHook,
    onSuccess?: PreloadLinkLifecycleHook,
    onFail?: PreloadLinkLifecycleHook,
    onNavigate?: PreloadLinkLifecycleHook,
    noInterrupt?: boolean,
}
export default class PreloadLink extends React.Component<PreloadLinkProps, any> {}

export const configure: PreloadLinkConfig;

export const PRELOAD_FAIL: string;
