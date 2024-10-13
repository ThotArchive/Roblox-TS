// Note: All commented out locales share the same event name and logo as English for
// the current platform event.

import { getNavigationContainer } from './searchConstants';
import logoVn from '../../../../images/PlatformEventLeftNav_VN.jpg';
import logoTr from '../../../../images/PlatformEventLeftNav_TR.jpg';
// import logoTh from '../../../../images/';
import logoPtbr from '../../../../images/PlatformEventLeftNav_PTBR.jpg';
import logoPl from '../../../../images/PlatformEventLeftNav_PL.jpg';
// import logoKo from '../../../../images/';
import logoJp from '../../../../images/PlatformEventLeftNav_JP.jpg';
// import logoIt from '../../../../images/';
// import logoId from '../../../../images/';
// import logoFr from '../../../../images/';
// import logoEs from '../../../../images/';
import logoEn from '../../../../images/PlatformEventLeftNav_EN.jpg';
import logoDe from '../../../../images/PlatformEventLeftNav_DE.jpg';
// import logoCht from '../../../../images/PlatformEventLeftNav_CHT.png';
// import logoChs from '../../../../images/PlatformEventLeftNav_CHS.png';

const thumbnails = {
  vi_vn: logoVn,
  tr_tr: logoTr,
  // th_th: logoTh,
  pt_br: logoPtbr,
  pl_pl: logoPl,
  // ko_kr: logoKo,
  ja_jp: logoJp,
  // it_it: logoIt,
  // id_id: logoId,
  // fr_fr: logoFr,
  // es_es: logoEs,
  en_us: logoEn,
  de_de: logoDe
  // zh_tw: logoCht,
  // zh_cn: logoChs
};

export default {
  showPlatformEventStartTime: () =>
    getNavigationContainer()?.dataset.platformEventLeftNavEntryStartTime
      ? new Date(
          Date.parse(`${getNavigationContainer()?.dataset.platformEventLeftNavEntryStartTime} UTC`)
        )
      : new Date('01/01/2001'),

  showPlatformEventEndTime: () =>
    getNavigationContainer()?.dataset.platformEventLeftNavEntryEndTime
      ? new Date(
          Date.parse(`${getNavigationContainer()?.dataset.platformEventLeftNavEntryEndTime} UTC`)
        )
      : new Date('01/01/2001'),

  platfromEventURL: () =>
    getNavigationContainer()?.dataset.platformEventLeftNavUrl
      ? getNavigationContainer()?.dataset.platformEventLeftNavUrl
      : '',

  localizedThumbnail: locale => (thumbnails[locale] ? thumbnails[locale] : logoEn)
};
