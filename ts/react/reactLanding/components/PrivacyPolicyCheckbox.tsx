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
import LegalCheckbox from '../../common/components/LegalCheckbox';

export type legalTextProps = {
  locale: string;
  translate: WithTranslationsProps['translate'];
  isChecked: boolean;
  onCheckBoxChanged: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const PrivacyPolicyCheckbox = ({
  locale,
  translate,
  isChecked,
  onCheckBoxChanged
}: legalTextProps): JSX.Element => {
  const privacyLocalizedLink = buildLinkWithLocale(urlConstants.privacy, locale);
  const privacyLinkElement = `${
    anchorOpeningTag + privacyLocalizedLink + anchorOpeningTagEnd
  }${translate(signupFormStrings.Privacy)}${anchorClosingTag}`;
  const legalText = translate(signupFormStrings.CompliancePrivacyPolicyAck, {
    spanStart: '<span>',
    spanEnd: '</span>',
    privacyPolicyLink: privacyLinkElement
  });

  return (
    <LegalCheckbox
      id='compliance-privacy-policy'
      isChecked={isChecked}
      onCheckBoxChanged={onCheckBoxChanged}
      legalText={legalText}
    />
  );
};

export default withTranslations(PrivacyPolicyCheckbox, signupTranslationConfig);
