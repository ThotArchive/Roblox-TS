import React from 'react';
import PropTypes from 'prop-types';
import { urlService } from 'core-utilities';
import { dataStores, eventStreamService } from 'core-roblox-utilities';
import { Dropdown, NativeDropdown, SimpleModal, Loading } from 'react-style-guide';
import { authenticatedUser } from 'header-scripts';
import eventStreamEvents from '../constants/languageSelectorEventStreamConstants';
import cacheConstants from '../constants/cacheConstants';

const queryParamName = 'locale';
const { localeDataStore } = dataStores;

const getLocaleLabel = supportedLocale => {
  if (supportedLocale.locale && supportedLocale.locale.nativeName) {
    return supportedLocale.isEnabledForFullExperience
      ? supportedLocale.locale.nativeName
      : `${supportedLocale.locale.nativeName}*`;
  }
  return '';
};

class LanguageSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      supportedLocales: [],
      userLocale: {},
      showUnsupportedModal: false,
      isUserLocaleUnsupported: false,
      isLocaleUpdateInProgress: false
    };

    this.handleNativeLanguageChange = this.handleNativeLanguageChange.bind(this);
    this.hideUnsupportedModal = this.hideUnsupportedModal.bind(this);
  }

  componentDidMount() {
    this.loadSupportedLocales();
  }

  handleLanguageChange(selectedLocale) {
    const supportedLocale = { ...selectedLocale.locale };
    const { userLocale } = this.state;
    const { isAuthenticatedUser, onLanguageChange } = this.props;
    const previousSupportedLocale = { ...userLocale };
    if (isAuthenticatedUser) {
      this.setState({
        isLocaleUpdateInProgress: true
      });
      localeDataStore
        .setUserLocale(supportedLocale.locale)
        .then(
          () => {
            if (selectedLocale.isEnabledForFullExperience) {
              onLanguageChange(supportedLocale);
            } else {
              this.showUnsupportedLocaleMessage();
              this.showUnsupportedLocaleModal(supportedLocale);
            }
          },
          error => {
            console.debug(error);
          }
        )
        .finally(() => {
          this.setState({
            isLocaleUpdateInProgress: false
          });
        });
    } else {
      onLanguageChange(supportedLocale);
    }

    this.setUserLocaleByLocaleCode(supportedLocale.locale);

    eventStreamService.sendEvent(eventStreamEvents.changeLanguage, {
      userId: authenticatedUser.id,
      newSupportedLocaleCode: supportedLocale.locale,
      previousSupportedLocaleCode: previousSupportedLocale.locale.locale
    });
  }

  handleNativeLanguageChange(event) {
    const { supportedLocales } = this.state;
    const selectedLocaleCode = event.target.value;
    const selectedSupportedLocale = supportedLocales.find(supportedLocale => {
      return supportedLocale.locale.locale === selectedLocaleCode;
    });
    this.handleLanguageChange(selectedSupportedLocale);
  }

  getDefaultSelector() {
    const { supportedLocales, userLocale, isLocaleUpdateInProgress } = this.state;
    const dropdownOptions = supportedLocales.map(supportedLocale => {
      return (
        <Dropdown.Item
          key={supportedLocale.locale.id}
          onClick={() => this.handleLanguageChange(supportedLocale)}>
          {getLocaleLabel(supportedLocale)}
        </Dropdown.Item>
      );
    });

    const dropdownLabel = getLocaleLabel(userLocale);

    return (
      <Dropdown
        currSelectionLabel={dropdownLabel}
        id='language-switcher'
        icon='icon-globe'
        disabled={isLocaleUpdateInProgress}>
        {dropdownOptions}
      </Dropdown>
    );
  }

  getNativeSelector() {
    const { supportedLocales, userLocale } = this.state;
    const dropdownOptions = supportedLocales.map(supportedLocale => {
      return {
        value: supportedLocale.locale.locale,
        key: supportedLocale.locale.id,
        label: getLocaleLabel(supportedLocale)
      };
    });

    const userLocaleCode = userLocale.locale && userLocale.locale.locale;

    return (
      dropdownOptions.length > 0 && (
        <NativeDropdown
          id='language-switcher'
          selectionItems={dropdownOptions}
          onChange={this.handleNativeLanguageChange}
          selectedItemvalue={userLocaleCode}
        />
      )
    );
  }

  setUserLocaleByLocaleCode(localeCode) {
    const selectedLocale = this.findSupportedLocaleByLocaleCode(localeCode);
    this.setState({
      userLocale: {
        ...selectedLocale
      }
    });

    if (!selectedLocale.isEnabledForFullExperience) {
      this.showUnsupportedLocaleMessage();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  sortSupportedLocalesByFullExperience(unsortedLocales) {
    if (Array.isArray(unsortedLocales)) {
      const fullExperienceLocales = unsortedLocales
        .filter(locale => locale.isEnabledForFullExperience)
        .sort((a, b) => {
          return a.locale.nativeName > b.locale.nativeName ? 1 : -1;
        });
      const unsupportedLocales = unsortedLocales
        .filter(locale => !locale.isEnabledForFullExperience)
        .sort((a, b) => {
          return a.locale.nativeName > b.locale.nativeName ? 1 : -1;
        });

      return [...fullExperienceLocales, ...unsupportedLocales];
    }
    return unsortedLocales;
  }

  // eslint-disable-next-line class-methods-use-this
  filterLocalesBySeoSupport(unsortedLocales) {
    if (Array.isArray(unsortedLocales)) {
      return unsortedLocales
        .filter(
          // SEO doesn't support extended language codes such as 'zh-hans' for now.
          locale =>
            locale.isEnabledForFullExperience && locale.locale.language.languageCode.length === 2
        )
        .sort((a, b) => {
          return a.locale.nativeName > b.locale.nativeName ? 1 : -1;
        });
    }
    return unsortedLocales;
  }

  findSupportedLocaleByLocaleCode(localeCode) {
    const { supportedLocales } = this.state;
    return supportedLocales.find(supportedLocale => {
      return supportedLocale.locale.locale === localeCode;
    });
  }

  loadSupportedLocales() {
    localeDataStore.getLocalesWithCache(cacheConstants.getLocalesCacheTimeoutInMs).then(
      response => {
        const { hideSeoUnsupportedLocales } = this.props;

        if (hideSeoUnsupportedLocales) {
          this.setState({
            supportedLocales: this.filterLocalesBySeoSupport(response.data)
          });
        } else {
          this.setState({
            supportedLocales: this.sortSupportedLocalesByFullExperience(response.data)
          });
        }

        this.loadUserLocale();
      },
      error => {
        console.debug(error);
      }
    );
  }

  loadUserLocale() {
    const localeCode = urlService.getQueryParam(queryParamName);
    if (localeCode) {
      this.setUserLocaleByLocaleCode(localeCode);
    } else {
      const { isAuthenticatedUser } = this.props;
      localeDataStore.getUserLocale().then(
        response => {
          const userLocaleCode = isAuthenticatedUser
            ? response.data.ugc.locale
            : response.data.signupAndLogin.locale;
          this.setUserLocaleByLocaleCode(userLocaleCode);
        },
        error => {
          console.debug(error);
        }
      );
    }
  }

  showUnsupportedLocaleModal(supportedLocale) {
    const { showWarningModalForUnsupportedLocale } = this.props;
    if (showWarningModalForUnsupportedLocale) {
      this.setState({
        showUnsupportedModal: true
      });
      eventStreamService.sendEvent(eventStreamEvents.changeLanguageModal, {
        userId: authenticatedUser.id,
        newSupportedLocaleCode: supportedLocale.locale
      });
    }
  }

  hideUnsupportedModal() {
    const { onLanguageChange } = this.props;
    const { userLocale } = this.state;
    onLanguageChange(userLocale);
  }

  showUnsupportedLocaleMessage() {
    const { showWarningMessageForUnsupportedLocale } = this.props;
    if (showWarningMessageForUnsupportedLocale) {
      this.setState({
        isUserLocaleUnsupported: true
      });
    }
  }

  render() {
    const { translate, isNative } = this.props;
    const {
      showUnsupportedModal,
      isUserLocaleUnsupported,
      supportedLocales,
      userLocale
    } = this.state;

    return (
      <React.Fragment>
        {supportedLocales.length > 0 && userLocale.locale ? (
          <div className='language-selector-wrapper'>
            {isNative ? this.getNativeSelector() : this.getDefaultSelector()}
          </div>
        ) : (
          <Loading />
        )}
        <SimpleModal
          title={translate('Heading.UnsupportedLanguage')}
          body={translate('Description.UnsupportedLanguage')}
          show={showUnsupportedModal}
          neutralButtonText={translate('Action.Ok')}
          onNeutral={this.hideUnsupportedModal}
        />
        {isUserLocaleUnsupported && (
          <div className='row'>
            <span className='text text-error'>{translate('Description.UnsupportedLanguage')}</span>
          </div>
        )}
      </React.Fragment>
    );
  }
}

LanguageSelector.defaultProps = {
  onLanguageChange: () => {},
  isAuthenticatedUser: false,
  isNative: false,
  showWarningModalForUnsupportedLocale: true,
  showWarningMessageForUnsupportedLocale: true,
  hideSeoUnsupportedLocales: false
};

LanguageSelector.propTypes = {
  isAuthenticatedUser: PropTypes.bool,
  onLanguageChange: PropTypes.func,
  isNative: PropTypes.bool,
  showWarningModalForUnsupportedLocale: PropTypes.bool,
  showWarningMessageForUnsupportedLocale: PropTypes.bool,
  translate: PropTypes.func.isRequired,
  hideSeoUnsupportedLocales: PropTypes.bool
};

export default LanguageSelector;
