// Note: All commented out locales share the same event name and logo as English for
// the current platform event.

import { getNavigationContainer } from './searchConstants';
import logoVn from '../../../../images/The_Haunt__VN_1x1_400x400.png';
import logoTr from '../../../../images/The_Haunt__TR_1x1_400x400.png';
import logoTh from '../../../../images/The_Haunt__TH_1x1_400x400.png';
import logoPtbr from '../../../../images/The_Haunt__PTBR_1x1_400x400.png';
import logoPl from '../../../../images/The_Haunt__PL_1x1_400x400.png';
import logoKo from '../../../../images/The_Haunt__KO_1x1_400x400.png';
import logoJp from '../../../../images/The_Haunt__JP_1x1_400x400.png';
import logoIt from '../../../../images/The_Haunt__IT_1x1_400x400.png';
// import logoId from '../../../../images/';
// import logoFr from '../../../../images/';
import logoEs from '../../../../images/The_Haunt__ESMX_1x1_400x400.png';
import logoEn from '../../../../images/The_Haunt__EN_1x1_400x400.png';
// import logoDe from '../../../../images/';
import logoCht from '../../../../images/The_Haunt__CHT_1x1_400x400.png';
import logoChs from '../../../../images/The_Haunt__CHS_1x1_400x400.png';

const thumbnails = {
  vi_vn: logoVn,
  tr_tr: logoTr,
  th_th: logoTh,
  pt_br: logoPtbr,
  pl_pl: logoPl,
  ko_kr: logoKo,
  ja_jp: logoJp,
  it_it: logoIt,
  // id_id: logoId,
  // fr_fr: logoFr,
  es_es: logoEs,
  en_us: logoEn,
  // de_de: logoDe,
  zh_tw: logoCht,
  zh_cn: logoChs
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
