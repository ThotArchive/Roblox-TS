import React, { useMemo } from 'react';
import {
  AttributionRow,
  HeroUnit as HeroUnitContainer,
  OverlayPill
} from '@rbx/discovery-sdui-components';
import { THeroUnitAsset, TSduiCommonProps } from '../system/SduiTypes';

export type TSduiGradient = {
  startColor: string;
  endColor: string;
  startOpacity: number;
  endOpacity: number;
  degree: number;
};

type THeroUnitProps = {
  title: string;
  subtitle: string;

  bottomRowComponent?: { string: React.ReactNode };

  gradient: TSduiGradient;

  // Component containing the foreground image
  foregroundImage: React.ReactNode;

  // Component containing the background image
  backgroundImage: React.ReactNode;

  onActivated?: () => void;

  badgeText?: string;

  asset?: THeroUnitAsset;

  ctaButtonComponent?: React.ReactNode;

  /**
  TODO https://roblox.atlassian.net/browse/CLIGROW-2197:
  Add additional supported props to match App

  enableBackgroundAnimation?: boolean;

  aspectRatio?: number;
  backgroundImageFrameHeight?: number;
  cornerRadius?: number;
  hideSubtitle?: boolean;
  foregroundOverflow?: number;
  backgroundOverflow?: number;
  foregroundAspectRatio?: number;

  foregroundHeightPercent?: number;

  contentPadding?: number;

  gradientHeightPercent?: number;
  */
} & TSduiCommonProps & {
    children: React.ReactNode[];
  };

const HeroUnit = ({
  title,
  subtitle,

  bottomRowComponent,
  gradient,
  foregroundImage,
  backgroundImage,
  onActivated,
  badgeText,
  asset,
  ctaButtonComponent,

  children
}: THeroUnitProps): JSX.Element => {
  const attributionRow = useMemo(() => {
    if (asset) {
      return (
        <AttributionRow
          title={asset.title}
          subtitle={asset.subtitle}
          leftAssetComponent={asset.image}
          rightButtonComponent={ctaButtonComponent}
        />
      );
    }

    return <React.Fragment />;
  }, [asset, ctaButtonComponent]);

  const overlayComponent = useMemo(() => {
    if (badgeText) {
      return <OverlayPill pillText={badgeText} />;
    }

    return <React.Fragment />;
  }, [badgeText]);

  const heroUnit = useMemo(() => {
    return (
      <HeroUnitContainer
        title={title}
        subtitle={subtitle}
        foregroundImageComponent={foregroundImage}
        backgroundImageComponent={backgroundImage}
        gradient={gradient}
        overlayPillComponent={overlayComponent}
        backgroundClickAction={onActivated}
        bottomRowComponent={bottomRowComponent ?? attributionRow}>
        {children}
      </HeroUnitContainer>
    );
  }, [
    backgroundImage,
    onActivated,
    bottomRowComponent,
    attributionRow,
    foregroundImage,
    gradient,
    subtitle,
    title,
    children,
    overlayComponent
  ]);

  return heroUnit;
};

export default HeroUnit;
