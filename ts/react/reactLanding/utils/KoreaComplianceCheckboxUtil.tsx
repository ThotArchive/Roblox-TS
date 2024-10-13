import { TranslateFunction } from 'react-utilities';
import {
  signupFormStrings,
  urlConstants,
  anchorOpeningTag,
  anchorOpeningTagEnd,
  anchorClosingTag,
  koreaComplianceSignupStrings
} from '../constants/signupConstants';
import { buildLinkWithLocale } from './signupUtils';

type KoreaComplianceTextboxProperties = {
  text: (translate: TranslateFunction, locale: string) => string;
};

const getLocalizedLinkElement = (locale: string, url: string, text: string) => {
  const localizedLink = buildLinkWithLocale(url, locale);
  const linkElement = `${
    anchorOpeningTag + localizedLink + anchorOpeningTagEnd
  }${text}${anchorClosingTag}`;
  return linkElement;
};

export enum KoreaComplianceCheckboxType {
  USER_AGREEMENT_PRIVACY_POLICY,
  THIRD_PARTY_PROVISION_OF_PERSONAL_INFORMATION,
  CONSENT_TO_ALL_TERMS,
  OVERSEAS_TRANSFER_OF_PERSONAL_INFORMATION,
  COLLECTION_OF_REQUIRED_PERSONAL_INFORMATION,
  COLLECTION_OF_OPTIONAL_PERSONAL_INFORMATION
}

export const KoreaComplianceCheckboxTypeMap: Record<
  KoreaComplianceCheckboxType,
  KoreaComplianceTextboxProperties
> = {
  [KoreaComplianceCheckboxType.USER_AGREEMENT_PRIVACY_POLICY]: {
    text: (translate: TranslateFunction, locale: string) => {
      return translate(koreaComplianceSignupStrings.UserAgreementsTerms, {
        spanStart: '<span>',
        spanEnd: '</span>',
        TermsAndConditionsLink: getLocalizedLinkElement(
          locale,
          urlConstants.koreaComplianceTermsOfService,
          translate(koreaComplianceSignupStrings.TermsAndConditions)
        ),
        PrivacyPolicyLink: getLocalizedLinkElement(
          locale,
          urlConstants.koreaCompliancePrivacyPolicy,
          translate(koreaComplianceSignupStrings.PrivacyPolicy)
        )
      });
    }
  },
  [KoreaComplianceCheckboxType.THIRD_PARTY_PROVISION_OF_PERSONAL_INFORMATION]: {
    text: (translate: TranslateFunction, locale: string) => {
      return translate(koreaComplianceSignupStrings.ThirdPartyPersonalInformationTerms, {
        spanStart: '<span>',
        spanEnd: '</span>',
        ThirdPartyPersonalInformationLink: getLocalizedLinkElement(
          locale,
          urlConstants.koreaComplianceThirdPartyPersonalInformationPolicy,
          translate(koreaComplianceSignupStrings.ThirdPartyPersonalInformationProvision)
        )
      });
    }
  },
  [KoreaComplianceCheckboxType.CONSENT_TO_ALL_TERMS]: {
    text: (translate: TranslateFunction, locale: string) => {
      return translate(koreaComplianceSignupStrings.ConsentToAllTerms, {
        spanStart: '<span>',
        spanEnd: '</span>',
        privacyPolicyLink: getLocalizedLinkElement(
          locale,
          urlConstants.privacy,
          translate(signupFormStrings.Privacy)
        )
      });
    }
  },
  [KoreaComplianceCheckboxType.OVERSEAS_TRANSFER_OF_PERSONAL_INFORMATION]: {
    text: (translate: TranslateFunction, locale: string) => {
      return translate(koreaComplianceSignupStrings.OverseasPersonalInformationTerms, {
        spanStart: '<span>',
        spanEnd: '</span>',
        OverseasPersonalInformationTransferLink: getLocalizedLinkElement(
          locale,
          urlConstants.koreaComplianceTransferPersonalInformationPolicy,
          translate(koreaComplianceSignupStrings.OverseasPersonalInformationTransfer)
        )
      });
    }
  },
  [KoreaComplianceCheckboxType.COLLECTION_OF_REQUIRED_PERSONAL_INFORMATION]: {
    text: (translate: TranslateFunction, locale: string) => {
      return translate(koreaComplianceSignupStrings.RequiredPersonalInformationTerms, {
        spanStart: '<span>',
        spanEnd: '</span>',
        RequiredPersonalInformationLink: getLocalizedLinkElement(
          locale,
          urlConstants.koreaCompliancePersonalInformationPolicy,
          translate(koreaComplianceSignupStrings.RequiredPersonalInformation)
        )
      });
    }
  },
  [KoreaComplianceCheckboxType.COLLECTION_OF_OPTIONAL_PERSONAL_INFORMATION]: {
    text: (translate: TranslateFunction, locale: string) => {
      return translate(koreaComplianceSignupStrings.OptionalPersonalInformationTerms, {
        spanStart: '<span>',
        spanEnd: '</span>',
        OptionalPersonalInformationLink: getLocalizedLinkElement(
          locale,
          urlConstants.koreaComplianceOptionalPersonalInformationPolicy,
          translate(koreaComplianceSignupStrings.OptionalPersonalInformation)
        )
      });
    }
  }
};
