// Direct imports from `react-bootstrap` (should ideally be avoided unless we
// don't have a wrapper component available for a given purpose, but this is
// still better than importing from `react-bootstrap` directly in your app):
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ModalDialog from 'react-bootstrap/lib/ModalDialog';
import ModalTitle from 'react-bootstrap/lib/ModalTitle';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
// Wrapped imports:
import ItemCard from '../../../ts/react/itemCard/components/ItemCard';
import ItemCardUtils from '../../../ts/react/itemCard/utils/itemCardUtils';
import AvatarCardButtonGroup from '../avatarCard/components/AvatarButtonGroup';
import AvatarCardCaption from '../avatarCard/components/AvatarCaption';
import AvatarCardItem from '../avatarCard/components/AvatarCardItem';
import AvatarCardList from '../avatarCard/components/AvatarCardList';
import AvatarCardContent from '../avatarCard/components/AvatarContent';
import AvatarCardHeadshot from '../avatarCard/components/AvatarHeadshot';
import AvatarCardMenu from '../avatarCard/components/AvatarMenu';
import AvatarCardMenuItem from '../avatarCard/components/AvatarMenuItem';
import Banner from '../../../ts/react/banner/components/Banner';
import Button from '../button/components/Button';
import IconButton from '../button/components/IconButton';
import DatePicker from '../../../ts/react/datePicker/components/DatePicker';
import NativeDropdown from '../dropdown/components/NativeDropdown';
import Dropdown from '../dropdown/components/RobloxDropdown';
import FileUpload from '../fileUpload/components/FileUpload';
import FilterSelect from '../filterSelect/components/FilterSelect';
import Form from '../form';
import Image from '../image/containers/Image';
import Link from '../link/components/Link';
import Loading from '../loaders/components/Loading';
import Modal from '../modal/components/RobloxModal';
import ModalBody from '../modal/components/RobloxModalBody';
import ModalFooter from '../modal/components/RobloxModalFooter';
import ModalHeader from '../modal/components/RobloxModalHeader';
import SimpleModal from '../modal/components/RobloxSimpleModal';
import createModal from '../modal/utils/createModal';
import Pagination from '../pagination/components/Pagination';
import Popover from '../popover/components/Popover';
import ScrollBar from '../scrollBar/scrollBar';
import Section from '../section/components/Section';
import SystemFeedback from '../systemFeedback/components/SystemFeedbackContainer';
import createSystemFeedback from '../systemFeedback/utils/createSystemFeedback';
import useSystemFeedback from '../systemFeedback/utils/hooks/useSystemFeedback';
import { SystemFeedbackProvider } from '../systemFeedback/components/SystemFeedbackProvider';
import SimpleTab from '../tabs/components/SimpleTab';
import SimpleTabs from '../tabs/components/SimpleTabs';
import Tabs from '../tabs/components/Tabs';
import Toast from '../toast/component/Toast';
import Toggle from '../toggle/components/Toggle';
import Tooltip from '../tooltip/components/Tooltip';
import TextFormField from '../form/components/TextFormField';

Modal.Title = ModalTitle;
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Dialog = ModalDialog;

window.ReactStyleGuide = {
  // Components:
  AvatarCardItem: {
    Default: AvatarCardItem,
    Headshot: AvatarCardHeadshot,
    Content: AvatarCardContent,
    ButtonGroup: AvatarCardButtonGroup,
    Caption: AvatarCardCaption,
    Menu: AvatarCardMenu,
    MenuItem: AvatarCardMenuItem
  },
  AvatarCardList,
  Banner,
  Button,
  DatePicker,
  Dropdown,
  FileUpload,
  FilterSelect,
  Form,
  FormControl,
  FormGroup,
  IconButton,
  Image,
  ItemCard,
  Link,
  Loading,
  Modal,
  NativeDropdown,
  Pagination,
  Popover,
  ProgressBar,
  ScrollBar,
  Section,
  SimpleModal,
  SimpleTab,
  SimpleTabs,
  SystemFeedback,
  Tabs,
  TextFormField,
  Toast,
  Toggle,
  Tooltip,
  // Utilities:
  createSystemFeedback,
  useSystemFeedback,
  SystemFeedbackProvider,
  createModal,
  ItemCardUtils
};
