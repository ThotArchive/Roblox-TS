import React, { useEffect, useCallback } from 'react';
import { makeStyles, Button } from '@rbx/ui';
import bezier from 'bezier-easing';
import throttle from 'lodash.throttle';
import '@rbx/webfont/styles/index.css';

const HeroUnitGradient = ({ gradient, gradientHeightPercent, gradientWidthPercent }) => {
    const { startColor, endColor, startOpacity, endOpacity, degree } = gradient;
    const [linearGradient, setLinearGradient] = React.useState('');
    const gradientHeightPercentString = `${gradientHeightPercent * 100}%`;
    const gradientWidthPercentString = `${gradientWidthPercent * 100}%`;
    useEffect(() => {
        const grad = `linear-gradient(${degree}deg, ${startColor}${Math.round(startOpacity * 255)
            .toString(16)
            .padStart(2, '0')}, ${endColor}${Math.round(endOpacity * 255)
            .toString(16)
            .padStart(2, '0')})`;
        setLinearGradient(grad);
    }, [startColor, endColor, startOpacity, endOpacity, degree]);
    const { classes: { heroUnitGradient } } = makeStyles()(() => ({
        heroUnitGradient: {
            width: gradientWidthPercentString,
            height: gradientHeightPercentString,
            bottom: '0px',
            left: '0px',
            position: 'absolute'
        }
    }))();
    return React.createElement("div", { style: { background: linearGradient }, className: heroUnitGradient });
};

const foregroundParallaxLarge = 24;
const foregroundParallaxSmall = 16;
const heroUnitContentHeight = 336;
const textDropShadow = '2px 2px 4px rgba(0, 0, 0, 0.15)';

const HeroUnitContent = ({ title, subtitle, heroUnitRef, gradient, gradientHeightPercent, gradientWidthPercent, bottomRowComponent, overlayPillComponent, forceViewportWidth }) => {
    const forceSmallView = forceViewportWidth !== undefined && forceViewportWidth <= 414;
    const forceMediumView = forceViewportWidth !== undefined && forceViewportWidth <= 600 && forceViewportWidth >= 415;
    const forceSmallOrMediumView = forceSmallView || forceMediumView;
    const { classes: { heroUnitContentContainer, heroUnitTitleContainer, heroUnitTitle, heroUnitSubtitle } } = makeStyles()(() => ({
        heroUnitContentContainer: {
            height: `${heroUnitContentHeight}px`,
            width: '100%',
            position: 'relative',
            display: 'flex',
            overflow: 'hidden',
            borderRadius: '8px',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '20px',
            ...(forceSmallOrMediumView
                ? {
                    padding: '16px',
                    aspectRatio: '16 / 9',
                    height: 'auto'
                }
                : {}),
            '@media (max-width: 600px)': {
                padding: '16px',
                aspectRatio: '16 / 9',
                height: 'auto'
            }
        },
        heroUnitTitleContainer: {
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
        },
        heroUnitTitle: {
            color: 'white',
            position: 'relative',
            textShadow: `${textDropShadow}`,
            fontFamily: 'Builder Sans',
            fontSize: '40px',
            fontWeight: 700,
            lineHeight: '48px',
            ...(forceSmallOrMediumView
                ? {
                    lineHeight: '28.8px'
                }
                : {}),
            ...(forceSmallView
                ? {
                    fontSize: '24px'
                }
                : {}),
            ...(forceMediumView
                ? {
                    fontSize: '28px'
                }
                : {}),
            '@media (max-width: 600px)': {
                lineHeight: '28.8px'
            },
            '@media (min-width: 415px) and (max-width: 600px)': {
                fontSize: '24px'
            },
            '@media (max-width: 414px)': {
                fontSize: '28px'
            }
        },
        heroUnitSubtitle: {
            color: 'white',
            textShadow: `${textDropShadow}`,
            marginTop: '2px',
            position: 'relative',
            fontFamily: 'Builder Sans',
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '24px',
            ...(forceSmallOrMediumView
                ? {
                    display: 'none'
                }
                : {
                    '@media (max-width: 600px)': {
                        display: 'none'
                    }
                })
        }
    }))();
    return (React.createElement("div", { className: heroUnitContentContainer, ref: heroUnitRef },
        React.createElement(HeroUnitGradient, { gradient: gradient, gradientHeightPercent: gradientHeightPercent, gradientWidthPercent: gradientWidthPercent }),
        overlayPillComponent,
        React.createElement("div", { className: heroUnitTitleContainer },
            React.createElement("span", { className: heroUnitTitle }, title),
            React.createElement("span", { className: heroUnitSubtitle }, subtitle)),
        bottomRowComponent));
};

const HeroUnitBackground = ({ backgroundImageComponent, forceViewportWidth }) => {
    const forceSmallOrMediumView = forceViewportWidth !== undefined && forceViewportWidth <= 600;
    const { classes: { heroUnitBackgroundWindow, heroUnitBackgroundContainer } } = makeStyles()(() => ({
        heroUnitBackgroundWindow: {
            height: `${heroUnitContentHeight}px`,
            width: '100%',
            position: 'absolute',
            top: '24px',
            overflow: 'hidden',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            ...(forceSmallOrMediumView
                ? {
                    aspectRatio: '16 / 9',
                    height: 'auto',
                    top: '16px'
                }
                : {}),
            '@media (max-width: 600px)': {
                aspectRatio: '16 / 9',
                height: 'auto',
                top: '16px'
            }
        },
        heroUnitBackgroundContainer: {
            '--parallax-scale': '100',
            minWidth: 'max(100%, 1320px)',
            height: '436px',
            display: 'flex',
            flexDirection: 'column',
            transform: 'translateY(calc(var(--parallax-scale) * ((var(--scroll) * 1px) - 0.5px)))',
            // Disable parallax effect for users that prefer reduced motion
            '@media (prefers-reduced-motion)': {
                transform: 'translateY(0.5px)'
            },
            '@media (min-width: 1320px)': {
                height: 'auto'
            },
            ...(forceSmallOrMediumView
                ? {
                    minHeight: 'calc(100% + 66px)',
                    width: 'auto',
                    '--parallax-scale': '66'
                }
                : {}),
            '@media (max-width: 600px)': {
                minHeight: 'calc(100% + 66px)',
                width: 'auto',
                '--parallax-scale': '66'
            }
        }
    }))();
    return (React.createElement("div", { className: heroUnitBackgroundWindow },
        React.createElement("div", { className: heroUnitBackgroundContainer }, backgroundImageComponent)));
};

/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/**
 * HeroUnit component
 *
 * This component renders a hero unit section with a background image, foreground image,
 * title, subtitle, badge text, gradient, experience information and a call-to-action button.
 * It also includes a parallax effect for the background and foreground images based on the
 * scroll position.
 *
 * @param {HeroUnitProps} props - The properties for the HeroUnit component.
 * @param {string} props.title - The title text for the hero unit.
 * @param {string} props.subtitle - The subtitle text for the hero unit.
 * @param {React.ReactNode} props.foregroundImageComponent - The foreground image component. Can be img or <Thumbnail2d>
 * @param {React.ReactNode} props.backgroundImageComponent - The background image component. Can be img or <Thumbnail2d>
 * @param {Gradient} props.gradient - The gradient overlay for the hero unit.
 * @param {number} [props.gradientHeightPercent=0.5] - The height of the gradient overlay as a percentage of the hero unit height.
 * @param {number} [props.gradientWidthPercent=1] - The width of the gradient overlay as a percentage of the hero unit width.
 * @param {() => void} [props.backgroundClickAction] - The action to perform when the background is clicked.
 * @param {React.ReactNode} props.bottomRowComponent - The component to render in the bottom row.
 * @param {React.ReactNode} props.overlayPillComponent - The component to render as an overlay pill.
 * @param {number} [props.minForegroundHeightPercent=0.8] - The minimum height of the foreground image as a percentage of the hero unit height.
 * @param {number} [props.maxForegroundHeightPercent=1] - The maximum height of the foreground image as a percentage of the hero unit height.
 * @param {boolean} [props.forceViewportWidth] - Forces the hero unit to render as if the screen was this width.
 *
 * @returns {JSX.Element} The rendered HeroUnit component.
 */
const HeroUnit = ({ title, subtitle, foregroundImageComponent, backgroundImageComponent, gradient, gradientHeightPercent = 0.5, gradientWidthPercent = 1, backgroundClickAction: onBackgroundClick, bottomRowComponent, overlayPillComponent, minForegroundHeightPercent = 0.8, maxForegroundHeightPercent = 1, forceViewportWidth }) => {
    const isMidpointPositionFinalizedRef = React.useRef(false);
    const [normalizedInitialMidpointPosition, setNormalizedInitialMidpointPosition] = React.useState(1);
    const forceSmallOrMediumView = forceViewportWidth !== undefined && forceViewportWidth <= 600;
    const heroUnitContentRef = React.useRef(null);
    const heroUnitContainerRef = React.useRef(null);
    const minForegroundHeightPercentString = `${Math.round(minForegroundHeightPercent * 100)}%`;
    const maxForegroundHeightPercentString = `${Math.round(maxForegroundHeightPercent * 100)}%`;
    // this is the difference in pixels between the min and max foreground height. we use foreground parallax large because
    // this variable is only in use when screen width is between 600 and 1140px
    const foregroundScaleFactor = (maxForegroundHeightPercent - minForegroundHeightPercent) *
        (heroUnitContentHeight + foregroundParallaxLarge);
    const { classes: { heroUnitContainer, heroUnitForegroundContainer, heroUnitTopSpacer } } = makeStyles()(() => ({
        heroUnitContainer: {
            width: '100%',
            position: 'relative',
            display: 'flex',
            overflow: 'hidden',
            alignItems: 'center',
            flexDirection: 'column',
            cursor: 'pointer',
            margin: 'none',
            // image containers need images to fill them, so we set the width and height to 100%
            '& img': {
                width: '100%',
                height: '100%'
            },
            ...(forceViewportWidth
                ? {
                    maxWidth: `${forceViewportWidth}px`
                }
                : {})
        },
        heroUnitForegroundContainer: {
            height: maxForegroundHeightPercentString,
            aspectRatio: '1',
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            top: '0px',
            '--parallax-scale': `${foregroundParallaxLarge * 2}`,
            transform: 'translateY(calc(var(--parallax-scale) * ((var(--scroll) * -1px) + 1px)))',
            '@media (prefers-reduced-motion)': {
                // Disable parallax effect for users that prefer reduced motion
                transform: 'translateY(0px)'
            },
            ...(forceSmallOrMediumView
                ? {
                    height: minForegroundHeightPercentString,
                    '--parallax-scale': `${foregroundParallaxSmall * 2}`
                }
                : {}),
            '@media (max-width: 600px)': {
                height: minForegroundHeightPercentString,
                '--parallax-scale': `${foregroundParallaxSmall * 2}`
            },
            '@media (min-width: 601px) and (max-width: 1140px)': {
                height: `calc(${minForegroundHeightPercentString} + ((${foregroundScaleFactor} * (100vw - 600px)) / 540))`
            }
        },
        heroUnitTopSpacer: {
            height: `${foregroundParallaxLarge}px`,
            ...(forceSmallOrMediumView ? { height: `${foregroundParallaxSmall}px` } : {}),
            '@media (max-width: 600px)': {
                height: `${foregroundParallaxSmall}px`
            }
        }
    }))();
    // used to calculate the distance from top of hero unit to the bottom of the window, which
    // is used to calculate the transform of the background and foreground images for parallax
    const updateParallaxCss = useCallback(() => {
        const easeInOut = bezier(0.2, 0, 0.8, 1);
        if (!heroUnitContentRef.current || !window.innerHeight) {
            return;
        }
        let newNormalizedInitialMidpointPosition = normalizedInitialMidpointPosition;
        // if the midpoint position has not been finalized, calculate it on the fly
        if (!isMidpointPositionFinalizedRef.current) {
            // distance of hero unit midpoint to top of viewport
            const initialMidpointPosition = heroUnitContentRef.current.getBoundingClientRect().top + heroUnitContentHeight / 2;
            if (initialMidpointPosition <= 0) {
                // if the unit starts offscreen, parallax formula will be incorrect
                return;
            }
            newNormalizedInitialMidpointPosition =
                Math.min(initialMidpointPosition, window.innerHeight) / window.innerHeight;
            // bound to range [0, viewportHeight], then normalize to [0,1]
            setNormalizedInitialMidpointPosition(newNormalizedInitialMidpointPosition);
        }
        const rect = heroUnitContentRef.current.getBoundingClientRect();
        const normalizedDistanceFromTop = rect.top / window.innerHeight;
        // map normalized distance from top from [0, normalizedInitialMidpointPosition] to [0, 1]
        const scrollProgress = (newNormalizedInitialMidpointPosition - normalizedDistanceFromTop) /
            newNormalizedInitialMidpointPosition;
        // clamp to [0,1]
        const clampedScrollProgress = Math.max(Math.min(scrollProgress, 1), 0);
        const bezierEasied = easeInOut(clampedScrollProgress);
        if (heroUnitContainerRef.current) {
            heroUnitContainerRef.current.style.setProperty('--scroll', bezierEasied.toString());
        }
    }, [heroUnitContentRef, isMidpointPositionFinalizedRef, normalizedInitialMidpointPosition]);
    // initial load of mutation observer and scroll/resize listeners
    useEffect(() => {
        // want to throttle the observer function because we don't care about smoothness like we do on scroll
        const updateParallaxCssThrottled = throttle(updateParallaxCss, 100);
        // until first scroll, listen for dom changes to recalculate parallax effect
        const observer = new MutationObserver(updateParallaxCssThrottled);
        // if first scroll hasn't happened yet, observe body to indirectly detect hero unit position change
        if (document.body && !isMidpointPositionFinalizedRef.current) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        // inital parallax update
        updateParallaxCss();
        // finalize midpoint position after first scroll event
        const updateParallaxCssAndFinalizeMidpoint = () => {
            updateParallaxCss();
            isMidpointPositionFinalizedRef.current = true;
            observer.disconnect();
        };
        window.addEventListener('scroll', updateParallaxCssAndFinalizeMidpoint);
        window.addEventListener('resize', updateParallaxCssAndFinalizeMidpoint);
        // it's ok to return a cleanup function here but not in the early return above
        // eslint-disable-next-line consistent-return
        return () => {
            window.removeEventListener('scroll', updateParallaxCssAndFinalizeMidpoint);
            window.removeEventListener('resize', updateParallaxCssAndFinalizeMidpoint);
            observer.disconnect();
        };
    }, [isMidpointPositionFinalizedRef, updateParallaxCss]);
    return (React.createElement("div", { ref: heroUnitContainerRef, className: heroUnitContainer, onClick: onBackgroundClick, "data-testid": 'hero-unit' },
        React.createElement("div", { className: heroUnitTopSpacer }),
        React.createElement(HeroUnitBackground, { backgroundImageComponent: backgroundImageComponent, forceViewportWidth: forceViewportWidth }),
        React.createElement("div", { className: heroUnitForegroundContainer }, foregroundImageComponent),
        React.createElement(HeroUnitContent, { title: title, subtitle: subtitle, heroUnitRef: heroUnitContentRef, gradient: gradient, gradientHeightPercent: gradientHeightPercent, gradientWidthPercent: gradientWidthPercent, bottomRowComponent: bottomRowComponent, overlayPillComponent: overlayPillComponent, forceViewportWidth: forceViewportWidth })));
};

/**
 * AttributionRow component displays a row with a thumbnail, title, subtitle, and a button.
 *
 * @component
 * @param {string} title - The title text to be displayed.
 * @param {string} subtitle - The subtitle text to be displayed.
 * @param {React.ReactNode} leftAssetComponent - The component to be displayed on the left
 * @param {React.ReactNode} rightButtonComponent - The component to be displayed as the button on the right.
 *
 * @returns {JSX.Element} The rendered attribution row component.
 *
 * @example
 * <AttributionRow
 *   title="Sample Title"
 *   subtitle="Sample Subtitle"
 *   thumbnailComponent={<img src="thumbnail.jpg" alt="thumbnail" />}
 *   rightButtonComponent={<button>Join</button>}
 * />
 */
const AttributionRow = ({ title, subtitle, leftAssetComponent: thumbnailComponent, rightButtonComponent }) => {
    const { classes: { attributionRowContainer, attributionRowThumbnailContainer, attributionRowTextContainer, attributionRowButtonContainer, assetTitle, assetSubtitle } } = makeStyles()(() => ({
        attributionRowContainer: {
            display: 'flex',
            position: 'relative',
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            height: '40px'
        },
        attributionRowThumbnailContainer: {
            height: '100%',
            aspectRatio: `1`,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px',
            overflow: 'hidden'
        },
        attributionRowTextContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            height: '100%',
            marginLeft: '12px'
        },
        attributionRowButtonContainer: {
            marginLeft: 'auto'
        },
        assetTitle: {
            color: 'white',
            fontFamily: 'Builder Sans',
            fontSize: '14px',
            fontWeight: 700,
            lineHeight: '19.6px',
            textShadow: `${textDropShadow}`
        },
        assetSubtitle: {
            marginTop: 'auto',
            color: 'white',
            fontFamily: 'Builder Sans',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '19.6px',
            textShadow: `${textDropShadow}`
        }
    }))();
    return (React.createElement("div", { className: attributionRowContainer },
        React.createElement("div", { className: attributionRowThumbnailContainer }, thumbnailComponent),
        React.createElement("div", { className: attributionRowTextContainer },
            React.createElement("span", { className: assetTitle }, title),
            React.createElement("span", { className: assetSubtitle }, subtitle)),
        React.createElement("div", { className: attributionRowButtonContainer }, rightButtonComponent)));
};

/**
 * CtaButton component renders a styled button that triggers a callback function when clicked.
 *
 * @component
 * @param {Object} props - The properties object.
 * @param {Function} props.onButtonClick - The callback function to be called when the button is clicked.
 * @param {boolean} [props.forceCompactView] - Optional flag to force the button to use a compact view.
 *
 * @returns {JSX.Element} The rendered button component.
 *
 * @example
 * // Example usage:
 * // <CtaButton onButtonClick={() => console.log('Button clicked!')} />
 *
 */
const CtaButton = ({ onButtonClick, forceCompactView = false }) => {
    const { classes: { ctaButton } } = makeStyles()(() => ({
        ctaButton: {
            color: 'white',
            backgroundColor: '#335FFF',
            '&:hover': {
                backgroundColor: '#335FFF'
            },
            width: '188px',
            borderRadius: '8px',
            ...(forceCompactView
                ? {
                    width: '60px'
                }
                : {}),
            '@media (max-width: 600px)': {
                width: '60px'
            },
            height: '40px'
        }
    }))();
    return (React.createElement(Button, { className: ctaButton, onClick: onButtonClick }, "Join"));
};

const OverlayPill = ({ pillText }) => {
    const { classes: { heroUnitPill, heroUnitPillText } } = makeStyles()(() => ({
        heroUnitPill: {
            width: '76px',
            height: '24px',
            borderRadius: '16px',
            backgroundColor: 'white',
            color: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'auto'
        },
        heroUnitPillText: {
            fontFamily: 'Builder Sans',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '12px'
        }
    }))();
    return (React.createElement("div", { className: heroUnitPill },
        React.createElement("span", { className: heroUnitPillText }, pillText)));
};

export { AttributionRow, CtaButton, HeroUnit, OverlayPill };
