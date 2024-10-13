import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { signupTranslationConfig } from '../translation.config';
import {
  signupFormStrings,
  urlConstants,
  anchorOpeningTag,
  anchorOpeningTagEnd,
  anchorClosingTag
} from '../constants/signupConstants';
import { buildLinkWithLocale } from '../utils/signupUtils';

export type legalTextProps = {
  locale: string;
  translate: WithTranslationsProps['translate'];
};

const LegalText = ({ locale, translate }: legalTextProps): JSX.Element => {
  const termsOfUseLocalizedLink = buildLinkWithLocale(urlConstants.termsOfUse, locale);
  const privacyLocalizedLink = buildLinkWithLocale(urlConstants.privacy, locale);
  const termsOfUseLinkElement = `${
    anchorOpeningTag + termsOfUseLocalizedLink + anchorOpeningTagEnd
  }${translate(signupFormStrings.TermsOfUSe)}${anchorClosingTag}`;
  const privacyLinkElement = `${
    anchorOpeningTag + privacyLocalizedLink + anchorOpeningTagEnd
  }${translate(signupFormStrings.Privacy)}${anchorClosingTag}`;
  return (
    <div className='legal-text-container legal-text-container-top-margin'>
      <div
        className='terms-agreement'
        dangerouslySetInnerHTML={{
          __html: translate(signupFormStrings.SignUpAgreement, {
            spanStart: '<span>',
            spanEnd: '</span>',
            termsOfUseLink: termsOfUseLinkElement,
            privacyPolicyLink: privacyLinkElement
          })
        }}
      />
    </div>
  );
};

export default withTranslations(LegalText, signupTranslationConfig);
