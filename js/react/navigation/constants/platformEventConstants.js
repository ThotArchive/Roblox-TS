// Note: All commented out locales share the same event name and logo as English for
// the current platform event.

import { getNavigationContainer } from './searchConstants';
import logoVn from '../../../../images/Thumbnail_VN.png';
import logoTr from '../../../../images/Thumbnail_TR.png';
// import logoTh from '../../../../images/';
import logoPtbr from '../../../../images/Thumbnail_PTBR.png';
import logoPl from '../../../../images/Thumbnail_PL.png';
import logoKo from '../../../../images/Thumbnail_KO.png';
import logoJp from '../../../../images/Thumbnail_JP.png';
// import logoIt from '../../../../images/';
// import logoId from '../../../../images/';
// import logoFr from '../../../../images/';
import logoEs from '../../../../images/Thumbnail_ESMX.png';
import logoEn from '../../../../images/Thumbnail_EN.png';
// import logoDe from '../../../../images/';
// import logoCht from '../../../../images/;
import logoChs from '../../../../images/Thumbnail_CHS.png';
import logoAr from '../../../../images/Thumbnail_AR.png';

const thumbnails = {
  vi_vn: logoVn,
  tr_tr: logoTr,
  // th_th: logoTh,
  pt_br: logoPtbr,
  pl_pl: logoPl,
  ko_kr: logoKo,
  ja_jp: logoJp,
  // it_it: logoIt,
  // id_id: logoId,
  // fr_fr: logoFr,
  es_es: logoEs,
  en_us: logoEn,
  // de_de: logoDe,
  // zh_tw: logoCht,
  zh_cn: logoChs,
  ar_001: logoAr
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
