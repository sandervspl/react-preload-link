import {
    default as PreloadLink,
    configure,
    PreloadLink as PreloadLinkComponent,
} from './PreloadLink';

/*
 * Fix importing in typescript after rollup compilation
 * https://github.com/rollup/rollup/issues/1156
 * https://github.com/Microsoft/TypeScript/issues/13017#issuecomment-268657860
 */
PreloadLink.default = PreloadLink;
PreloadLink.configure = configure;
PreloadLink.PreloadLinkComponent = PreloadLinkComponent;

export default PreloadLink;
