import { CircularProgress, Divider, Grid, Typography } from '@mui/material';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form/dist/index.ie11';
import { DeviceMeta } from 'Roblox';
import { useNotificationLocalization } from '../context/NotificationsLocalization';
import {
  AbuseReportFormData,
  AbuseReportFormProps,
  EntryPoint,
  ReportedTags
} from './abuseReportFormType';
import AbuseReportInput from './AbuseReportInput';
import { getReportConfiguration, sendEventStreamEvent, sendReport } from './abuseReportService';
import ABUSE_REPORT_EVENTS from './constants/eventConstants';

const AbuseReportForm: FC<AbuseReportFormProps> = ({
  children,
  customRender,
  onSubmit,
  defaultFormValues,
  formActions,
  reportedEntity,
  reportedEntityContext,
  reporterId,
  title
}) => {
  // TODO: Add loading state, when fetching configuration

  const [customSubmitSuccess, setCustomSubmitSuccess] = useState(false);
  const [defaultSubmitSuccess, setDefaultSubmitSuccess] = useState(false);

  // TODO: move translation to separate namespace and remove dependency from notifications
  const translate = useNotificationLocalization();
  const abuseReportsInputsConfiguration = getReportConfiguration(translate);

  const defaultValues = {
    ...abuseReportsInputsConfiguration.reduce(
      (value, config) => ({
        ...value,
        [config.name]: config.initialValue
      }),
      {}
    ),
    ...defaultFormValues
  };

  const getEntryPoint = (): EntryPoint => {
    // TODO: remove this dependency to be outside this form??
    if (DeviceMeta) {
      const { isInApp, isPhone } = DeviceMeta();
      if (isPhone) {
        return 'mobile';
      }
      if (isInApp) {
        return 'desktop';
      }
    }
    return 'website';
  };

  const { control, formState, handleSubmit, register } = useForm({
    defaultValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldUnregister: true
  });
  const { isSubmitting, errors, isValid } = formState;

  const generateReportTags = useCallback(
    (data: AbuseReportFormData) => {
      const defaultTags: ReportedTags = {
        SUBMITTER_USER_ID: {
          valueList: [
            {
              data: reporterId
            }
          ]
        },
        [reportedEntity.key]: {
          valueList: [
            {
              data: reportedEntity.id
            }
          ]
        },
        REPORTED_ABUSE_VECTOR: {
          valueList: [
            {
              data: reportedEntity.type
            }
          ]
        },
        ENTRY_POINT: {
          valueList: [
            {
              data: getEntryPoint()
            }
          ]
        }
      };
      const reportTags = Object.entries(data).reduce((tags, [key, value]) => {
        // eslint-disable-next-line no-param-reassign
        tags[key] = {
          valueList: [
            {
              data: value
            }
          ]
        };
        return tags;
      }, defaultTags);
      return reportTags;
    },
    [reporterId, reportedEntity]
  );

  const abuseReportDefaultSubmit = useCallback(
    async (data: AbuseReportFormData) => {
      const reportTags = generateReportTags(data);
      return sendReport(reportTags, reportedEntity.idempotenceKey);
    },
    [generateReportTags, reportedEntity]
  );

  const onReportSubmit = useCallback(
    async (data: AbuseReportFormData) => {
      // Make default call
      if (!defaultSubmitSuccess && !onSubmit?.disableDefaultSubmit) {
        sendEventStreamEvent(ABUSE_REPORT_EVENTS.AbuseReportSubmit, 'click', {
          reportedAbuseVector: reportedEntity.type,
          reportedEntityId: reportedEntity.id,
          entryPoint: getEntryPoint(),
          reportedAbuseCategory: data.REPORTED_ABUSE_CATEGORY
        });
        try {
          const safetyApiResponse = await abuseReportDefaultSubmit(data);
          sendEventStreamEvent(ABUSE_REPORT_EVENTS.AbuseReportSubmitSuccess, 'click', {
            reportedAbuseVector: reportedEntity.type,
            reportedEntityId: reportedEntity.id,
            entryPoint: getEntryPoint(),
            reportedAbuseCategory: data.REPORTED_ABUSE_CATEGORY,
            safetyEventId: safetyApiResponse.data.id
          });
          setDefaultSubmitSuccess(true);
        } catch (e) {
          sendEventStreamEvent(ABUSE_REPORT_EVENTS.AbuseReportSubmitFailed, 'click', {
            reportedAbuseVector: reportedEntity.type,
            reportedEntityId: reportedEntity.id,
            entryPoint: getEntryPoint(),
            reportedAbuseCategory: data.REPORTED_ABUSE_CATEGORY
          });
          setDefaultSubmitSuccess(false);
        }
      }
      if (onSubmit?.action) {
        try {
          await onSubmit?.action(data);
          setCustomSubmitSuccess(true);
        } catch (e) {
          setCustomSubmitSuccess(false);
        }
      }
    },
    [abuseReportDefaultSubmit, defaultSubmitSuccess, onSubmit, reportedEntity]
  );

  useEffect(() => {
    sendEventStreamEvent(ABUSE_REPORT_EVENTS.AbuseReportInitiated, 'load', {
      reportedAbuseVector: reportedEntity.type,
      reportedEntityId: reportedEntity.id,
      entryPoint: getEntryPoint()
    });
  }, []);

  const AbuseReportBody = useMemo(
    () =>
      abuseReportsInputsConfiguration.map(config => (
        <Grid item xs={12} key={config.name}>
          <AbuseReportInput
            control={control}
            config={config}
            register={register}
            errors={errors}
            disabled={isSubmitting}
          />
        </Grid>
      )),
    [abuseReportsInputsConfiguration, control, errors, isSubmitting, register]
  );

  const AbuseReportActionButtons = useMemo(() => {
    const actionsList =
      formActions?.map(action => (
        <button
          type='button'
          key={action.id}
          data-testid={action.id}
          onClick={action.action}
          className={action.classes}
          disabled={isSubmitting}>
          {action.label}
        </button>
      )) ?? [];
    actionsList.push(
      <button
        key='submit'
        type='button'
        data-testid='on-abuse-report-submit'
        className={onSubmit?.classes ?? 'btn-primary-lg'}
        disabled={!isValid}
        onClick={handleSubmit(onReportSubmit)}>
        {isSubmitting ? <CircularProgress size={16} /> : translate('Action.Report')}
      </button>
    );
    return actionsList;
  }, [formActions, handleSubmit, onReportSubmit, onSubmit, isSubmitting, translate, isValid]);

  const AbuseReportActions = useMemo(() => {
    const buttonWidth = 12 / ((formActions?.length ?? 0) + 1);

    return (
      <Grid item xs={12}>
        <Grid container direction='row' spacing={1}>
          {AbuseReportActionButtons?.map(action => (
            <Grid item xs={buttonWidth} key={action.key}>
              {action}
            </Grid>
          ))}
        </Grid>
      </Grid>
    );
  }, [formActions, AbuseReportActionButtons]);

  return customRender ? (
    customRender(AbuseReportBody, AbuseReportActionButtons)
  ) : (
    <Grid container direction='column'>
      <Grid item xs={12}>
        <Typography variant='h1'>{title}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <React.Fragment>
        <Grid item xs={12}>
          {reportedEntityContext}
        </Grid>
        {AbuseReportBody}
        {children}
      </React.Fragment>
      <Grid item xs={12}>
        <Grid container direction='row' spacing={1}>
          {AbuseReportActions}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default AbuseReportForm;
