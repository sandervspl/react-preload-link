import { default as PreloadLink, configure } from './PreloadLink';
import { PRELOAD_FAIL } from './constants';

export default PreloadLink;
PreloadLink.PRELOAD_FAIL = PRELOAD_FAIL;
PreloadLink.configure = configure;
