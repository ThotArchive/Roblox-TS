import environmentUrls from "@rbx/environment-urls";
import { COOKIE_NAME, COOKIE_REGEX, COOKIE_TIMESPAN, TRIGGERING_CONTEXT } from "./constants";

const isLen3 = <T>(arr: T[]): arr is [T, T, T] => arr.length >= 3;

export default class PaymentFlowContext {
  public purchaseFlowUuid: string;

  public triggeringContext: TRIGGERING_CONTEXT;

  constructor(purchaseFlowUuid: string, triggeringContext: TRIGGERING_CONTEXT) {
    this.purchaseFlowUuid = purchaseFlowUuid;
    this.triggeringContext = triggeringContext;
  }

  public save(): void {
    const flowCtx = `${this.purchaseFlowUuid},${this.triggeringContext}`;
    document.cookie = `${COOKIE_NAME}=${flowCtx}; domain=.${environmentUrls.domain}; path=/; max-age=${COOKIE_TIMESPAN}`;
  }

  public static stop(): void {
    document.cookie = `${COOKIE_NAME}=; domain=.${environmentUrls.domain}; path=/; max-age=0`;
  }

  public static loadFromCookie(): PaymentFlowContext | null {
    const cookieDataArr = COOKIE_REGEX.exec(document.cookie);
    COOKIE_REGEX.lastIndex = 0;

    if (cookieDataArr != null && isLen3(cookieDataArr)) {
      const [, uuid, context] = cookieDataArr;
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return new PaymentFlowContext(uuid, context as TRIGGERING_CONTEXT);
    }

    return null;
  }
}
