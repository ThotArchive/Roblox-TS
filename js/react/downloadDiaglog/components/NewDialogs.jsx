/* eslint-disable react/no-danger */
import React, { useEffect } from 'react';
import { Dialog, useTheme, IconButton, Grid } from '@rbx/ui';
import { useTranslation } from 'react-utilities';
import { AppIcon } from '@rbx/branding-assets';
import { Button } from '@rbx/foundation-ui';
import { jsClientDeviceIdentifier } from 'header-scripts';
import { Endpoints } from 'Roblox';
import qrCode from '../../../../images/install-app-qr-code.png';

import {
  useDialogContainerStyles,
  useStyles,
  iconButtonStyle,
  headingStyle,
  subHeadingStyle,
  paragraphStyle,
  spanStyle,
  listItemStyle,
  messageStyle
} from '../constants/styles';
import dialogTranslations from '../constants/constants';

const { getAbsoluteUrl } = Endpoints;

// TODO: This is a temporary icon for the close button, will be replaced with the Foundation icon via Tailwind in the future.
const CloseIcon = ({ fill }) => (
  <svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28' fill='none'>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M6.53033 5.46967C6.23744 5.17678 5.76256 5.17678 5.46967 5.46967C5.17678 5.76256 5.17678 6.23744 5.46967 6.53033L12.9393 14L5.46967 21.4697C5.17678 21.7626 5.17678 22.2374 5.46967 22.5303C5.76256 22.8232 6.23744 22.8232 6.53033 22.5303L14 15.0607L21.4697 22.5303C21.7626 22.8232 22.2374 22.8232 22.5303 22.5303C22.8232 22.2374 22.8232 21.7626 22.5303 21.4697L15.0607 14L22.5303 6.53033C22.8232 6.23744 22.8232 5.76256 22.5303 5.46967C22.2374 5.17678 21.7626 5.17678 21.4697 5.46967L14 12.9393L6.53033 5.46967Z'
      fill={fill}
    />
  </svg>
);

const splitByPeriod = text => {
  const [first, second] = text.split('.');
  return (
    <React.Fragment>
      {first && (
        <React.Fragment>
          {[first, '.']}
          <br />
        </React.Fragment>
      )}
      {second}
    </React.Fragment>
  );
};

const DialogContainer = ({ inputMessage, bottomButton, onClose }) => {
  const {
    classes: { root, logoBox, logoImage, message, button }
  } = useDialogContainerStyles();
  const theme = useTheme();
  const { translate } = useTranslation();

  return (
    <section className={root}>
      <IconButton
        aria-label={translate(dialogTranslations.closeButton)}
        color='inherit'
        onClick={onClose}
        size='small'
        style={iconButtonStyle}>
        <CloseIcon fill={theme.palette.content.standard} />
      </IconButton>
      <Grid className='flex flex-col items-center'>
        <Grid className={logoBox}>
          <AppIcon className={logoImage} />
        </Grid>
        <p className={message} style={messageStyle(theme)}>
          {inputMessage}
        </p>
      </Grid>
      <Grid className={`flex flex-col items-stretch ${button}`}>{bottomButton}</Grid>
    </section>
  );
};

export const NewLoadingDialog = ({ isOpen, onClose }) => {
  const { translate } = useTranslation();
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogContainer
        inputMessage={
          <span style={spanStyle}>{splitByPeriod(translate(dialogTranslations.loadingLabel))}</span>
        }
        bottomButton={<Button variant='Emphasis' size='Medium' isLoading />}
        onClose={onClose}
      />
    </Dialog>
  );
};

export const NewDownloadDialog = ({ isOpen, onClose, callback }) => {
  const { translate } = useTranslation();
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogContainer
        inputMessage={<span style={spanStyle}>{translate(dialogTranslations.downloadLabel)}</span>}
        bottomButton={
          <Button variant='Emphasis' size='Medium' onClick={callback}>
            {translate(dialogTranslations.downloadButton)}
          </Button>
        }
        onClose={onClose}
      />
    </Dialog>
  );
};

export const NewInstallDialog = ({ isOpen, onClose, continueInstallClick, gameLaunchParams }) => {
  const { translate } = useTranslation();
  const theme = useTheme();
  const {
    classes: {
      container,
      paragraph,
      columnWrapper,
      column,
      borderRight,
      list,
      columnRight,
      qrBox,
      qrImage
    }
  } = useStyles();

  useEffect(() => {
    let link = null;
    let handler = null;

    const observer = new MutationObserver(() => {
      link = document.querySelector('.custom-click-link');
      if (link) {
        link.classList.remove('disabled');

        handler = e => {
          e.data = gameLaunchParams;
          continueInstallClick.call(link, e);
        };

        link.addEventListener('click', handler);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (link && handler) {
        link.removeEventListener('click', handler);
      }
    };
  }, [continueInstallClick, gameLaunchParams]);

  let firstInstruction = dialogTranslations.instructionMacFirstInstruction;
  let retryDownload = getAbsoluteUrl('/download/client?os=mac');
  if (jsClientDeviceIdentifier.isWindows) {
    firstInstruction = dialogTranslations.instructionWindowsFirstInstruction;
    retryDownload = getAbsoluteUrl('/download/client?os=win');
  }
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth={false}>
      <Grid className={container}>
        <IconButton
          aria-label={translate(dialogTranslations.closeButton)}
          color='inherit'
          onClick={onClose}
          size='small'
          style={iconButtonStyle}>
          <CloseIcon fill={theme.palette.content.standard} />
        </IconButton>
        <h2 style={headingStyle(theme)}>{translate(dialogTranslations.instructionHeading)}</h2>
        <p
          className={paragraph}
          dangerouslySetInnerHTML={{
            __html: `${translate(dialogTranslations.instructionFollowSteps)} ${translate(
              dialogTranslations.instructionRetryDownload,
              {
                startLink: `<a href="${retryDownload}">`,
                endLink: '</a>'
              }
            )}`
          }}
        />

        <Grid className={columnWrapper}>
          <Grid className={`${column} ${borderRight}`}>
            <h5 style={subHeadingStyle(theme)}>
              {translate(dialogTranslations.instructionInstallInstructions)}
            </h5>
            <ol className={list}>
              <li
                style={listItemStyle}
                dangerouslySetInnerHTML={{
                  __html: translate(firstInstruction, {
                    startBold: '<b>',
                    endBold: '</b>'
                  })
                }}
              />
              <li
                style={listItemStyle}
                dangerouslySetInnerHTML={{
                  __html: translate(dialogTranslations.instructionSecondInstruction, {
                    startBold: '<b>',
                    endBold: '</b>'
                  })
                }}
              />
              <li style={listItemStyle}>
                {translate(dialogTranslations.instructionThirdInstruction)}
              </li>
              <li
                style={listItemStyle}
                dangerouslySetInnerHTML={{
                  __html: translate(dialogTranslations.instructionFourthInstruction, {
                    startLink: '<a class="custom-click-link">',
                    endLink: '</a>'
                  })
                }}
              />
            </ol>
          </Grid>

          <Grid className={columnRight}>
            <h5 style={{ ...subHeadingStyle(theme) }}>
              {translate(dialogTranslations.instructionMobileAppDownload)}
            </h5>
            <p style={paragraphStyle}>{translate(dialogTranslations.instructionMobileAppQrCode)}</p>
            <Grid className={qrBox}>
              <img src={qrCode} alt='QR Code' className={qrImage} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Dialog>
  );
};
