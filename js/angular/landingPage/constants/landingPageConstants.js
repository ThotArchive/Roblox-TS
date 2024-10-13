import landingPageModule from '../landingPageModule';

const landingPageConstants = {
    templates: {
        landingPage: "landing"
    },
     experimentLayer: "Website.LandingPage",
    urls: {
        login: "/login",
        metadata: "/v1/metadata",
        // Note that metatdata api needs to be updated for v2.
        privacy: "/info/privacy",
        contentRatingLogoPolicy: "/v1/behaviors/content-rating-logo/content",
        brazilContentRatingGuide: "https://www.justica.gov.br/seus-direitos/classificacao/guia-pratico",
        italyContentRatingGuide: "https://pegi.info/",
        koreaIdVerification: '/id-verification/korea/login'
    },
    urlQueryNames: {
        locale: "locale"
    },
    modalConstants: {
        modalDarkTheme: "transparent-background dark-theme",
        actionButtonTheme: "btn-cta-md",
    },
    context: "Multiverse",
    mainShowSignupButtonEvent: "mainShowSignup",
    topShowSignupButtonEvent: "topShowSignup",
    hideSignupButtonEvent: "hideSignup",
    appButtonClickEvent: "AppLink",
    resolutionEvent: "resolutionMetadata",
    ftuxAvatarTestAvatarV1ContextV1Variation: 2,
    ftuxAvatarTestAvatarV2ContextV1Variation: 3,
    ftuxAvatarTestAvatarV1ContextV2Variation: 4,
    ftuxAvatarTestAvatarV2ContextV2Variation: 5
};

landingPageModule.constant("landingPageConstants", landingPageConstants);

export default landingPageConstants;
