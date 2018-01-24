import { default as PreloadLink, configure, PRELOAD_FAIL } from './PreloadLink';

PreloadLink.PRELOAD_FAIL = PRELOAD_FAIL;
PreloadLink.configure = configure;

export default PreloadLink;
