import { EnvironmentUrls } from 'Roblox';
import { COOKIE_NAME, COOKIE_REGEX, COOKIE_TIMESPAN, TRIGGERING_CONTEXT } from './constants';

export default class PaymentFlowContext {
  public purchaseFlowUuid: string;

  public triggeringContext: TRIGGERING_CONTEXT;

  constructor(purchaseFlowUuid: string, triggeringContext: TRIGGERING_CONTEXT) {
    this.purchaseFlowUuid = purchaseFlowUuid;
    this.triggeringContext = triggeringContext;
  }

  public save() {
    const flowCtx = `${this.purchaseFlowUuid},${this.triggeringContext}`;
    document.cookie = `${COOKIE_NAME}=${flowCtx}; domain=.${EnvironmentUrls.domain}; path=/; max-age=${COOKIE_TIMESPAN}`;
  }

  public static stop() {
    document.cookie = `${COOKIE_NAME}=; domain=.${EnvironmentUrls.domain}; path=/; max-age=0`;
  }

  public static loadFromCookie() {
    const cookieDataArr = COOKIE_REGEX.exec(document.cookie);
    COOKIE_REGEX.lastIndex = 0;

    // cookieDataArr example: ['RBXPaymentsFlowContext=uuid,ctx', 'uuid', 'ctx']
    if (!Array.isArray(cookieDataArr) || cookieDataArr.length < 3) {
      return null;
    }

    return new PaymentFlowContext(cookieDataArr[1], cookieDataArr[2] as TRIGGERING_CONTEXT);
  }
}
