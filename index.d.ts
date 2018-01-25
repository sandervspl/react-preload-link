export interface PreloadLinkConfigOptions {
    onLoading?: () => any;
    onSuccess?: () => any;
    onFail?: () => any;
}

export type PreloadLinkConfig = (options: PreloadLinkConfigOptions) => void;

export type PreloadLinkLifecycleHook = (hook: () => void) => void;
