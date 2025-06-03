import React from "react";
import getOSClass from "../utils/getOSClass";

export interface AppIconProps {
  alt?: string;
  className?: string;
  title?: string,
  style?: React.CSSProperties;
}

// The app icon is used for mobile and desktop platforms]
const AppIcon: React.FC<AppIconProps> = ({ alt = "App Icon", className = "", title = "", style = {}}) => { 
  const osClassPostfix = getOSClass();

  return (
    <div
      className={`app-icon-bluebg app-icon-${osClassPostfix} ${className}`}
      role="img"
      aria-label={alt}
      title={title || alt}
      style={style}
    />
  );
};

export default AppIcon;
export const windowsAppIconClass = () => `app-icon-bluebg app-icon-windows`;
export const macAppIconClass = () => `app-icon-bluebg app-icon-mac`;
export const iosAppIconClass = () => `app-icon-bluebg app-icon-ios`;
export const androidAppIconClass = () => `app-icon-bluebg app-icon-android`;

