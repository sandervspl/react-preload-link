interface PreloadLinkConfigOptions {
    onLoading?: () => any;
    onSuccess?: () => any;
    onFail?: () => any;
}

type PreloadLinkConfig = (options: PreloadLinkConfigOptions) => void;

type PreloadLinkLifecycleHook = (hook: () => void) => void;
