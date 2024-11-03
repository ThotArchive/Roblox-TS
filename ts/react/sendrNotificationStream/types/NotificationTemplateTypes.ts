export enum VisualItemType {
  Button = 'button',
  TextBody = 'textBody',
  Thumbnail = 'thumbnail',
  MetaAction = 'metaAction',
  MetaActionsButton = 'metaActionsButton'
}

export enum ThumbnailType {
  User = 'userThumbnail',
  Game = 'gameThumbnail',
  Group = 'groupThumbnail',
  Asset = 'assetThumbnail',
  Bundle = 'bundleThumbnail',
  Icon = 'icon'
}

export enum ButtonStyle {
  Primary = 'Primary',
  Secondary = 'Secondary',
  Alert = 'Alert',
  Growth = 'Growth'
}

export enum ActionType {
  ReportNotification = 'reportNotification',
  Deeplink = 'deeplink',
  NotificationAPI = 'notificationAPI',
  Dismiss = 'dismiss',
  Reload = 'reload',
  None = 'none'
}

export enum NotificationLayoutType {
  Default = 'Default'
}

export type Action = {
  actionType: ActionType;
  path?: string;
  nextState?: string;
  fallbackState?: string;
};

export type HandleActionCallback = (visualItem: InteractibleVisualItem) => void;

export type HandleBundleDismissCallback = (dismissedIndex: number) => void;

export type HandleEventStreamEventCallback = (
  eventName: string,
  visualItemType: VisualItemType,
  params?: Record<string, string>,
  visualItemName?: string,
  bundlePosition?: number,
  bundleId?: string
) => void;

export type StyleElement = {
  styledElementType: string;
  offset: number;
  length: number;
};

export type StyledText = {
  text: string;
  styledElements?: Array<StyleElement>;
};

export type VisualItemThumbnail = {
  id: string;
  idType: ThumbnailType;
};

export type VisualItemText = {
  visualItemType: VisualItemType;
  visualItemName?: string;
  title?: StyledText;
  label?: StyledText;
  actions?: Array<Action>;
  eventName?: string;
  clientEventsPayload?: Record<string, string>;
};

export type VisualItemButton = {
  label: StyledText;
  actions: Array<Action>;
  buttonStyle: ButtonStyle;
  visualItemType: VisualItemType;
  visualItemName: string;
  eventName?: string;
  clientEventsPayload?: Record<string, string>;
};

export type VisualItemMetaAction = {
  visualItemType: VisualItemType;
  label: StyledText;
  actions: Array<Action>;
  visualItemName?: string;
  eventName?: string;
  actionIcon?: string;
  clientEventsPayload?: Record<string, string>;
};

export type InteractibleVisualItem = VisualItemText | VisualItemButton | VisualItemMetaAction;
export type VisualItem = InteractibleVisualItem | VisualItemThumbnail;

export type PageState = {
  layoutKey: NotificationLayoutType;
  visualItems: {
    [VisualItemType.Button]?: Array<VisualItemButton>;
    [VisualItemType.TextBody]?: Array<VisualItemText>;
    [VisualItemType.Thumbnail]?: Array<VisualItemThumbnail>;
    [VisualItemType.MetaAction]?: Array<VisualItemMetaAction>;
  };
};

export type NotificationContent = {
  currentState: string;
  states: { [stateName: string]: PageState };
  minVersion: number;
  timeBeforeRefresh: number;
  notificationType: string;
};

export type NotificationData = {
  id: string;
  notificationSourceType: string;
  eventDate: string;
  isInteracted?: boolean;
  eventCount?: number;
  content: NotificationContent;
  bundleIndex?: number;
  bundleId?: string;
  isReadOnly?: boolean;
  handleBundleDismiss?: HandleBundleDismissCallback;
};

export type NotificationsBundle = {
  title?: string;
  bundleKey?: string;
  bundleId?: string;
  notificationSourceType: string;
  eventDate: string;
  notifications: Array<NotificationData>;
};

export type NotificationTemplateProps = {
  currentState: PageState;
  eventTime: string;
  handleActions?: HandleActionCallback;
  handleEventStreamClickEvent: HandleEventStreamEventCallback;
  toggleMetaActions: () => void;
  isMetaActionsOverlay?: boolean;
  isReadOnly?: boolean;
};

export type ButtonRowProps = {
  buttonList: Array<VisualItemButton>;
  handleActions?: HandleActionCallback;
};

export type SendrNotificationProps = {
  notificationData: NotificationData;
};

export type SendrNotificationsBundleProps = {
  notificationsBundle: NotificationsBundle;
};

export type NotificationActionApiResponse = {
  content?: NotificationContent;
};

export type ReportAbuseConfigResponse = {
  displayDsaLink: boolean;
};
