import React, { useEffect } from 'react';
import { TranslateFunction, withTranslations } from 'react-utilities';
import { TUpdateSettingsModalProps } from 'Roblox';
import { updateSettingsTranslationConfig } from '../../app.config';
import useUpdateSettingsModal from './hooks/useUpdateSettingsModal';
import { RecourseResponse } from '../../types/AmpTypes';

const UpdateSettingsContainer = ({
  translate,
  recourse, // TODO: integrate the acceptable setting values required to satisfy the recourse requirements
  updateSettingsModalProps
}: {
  translate: TranslateFunction;
  recourse: RecourseResponse;
  updateSettingsModalProps: TUpdateSettingsModalProps;
}): JSX.Element => {
  const [updateSettingsModal, updateSettingsModalService] = useUpdateSettingsModal(
    translate,
    updateSettingsModalProps
  );

  useEffect(() => {
    updateSettingsModalService.open();
  }, []);

  return <div>{updateSettingsModal}</div>;
};

export default withTranslations(UpdateSettingsContainer, updateSettingsTranslationConfig);
