import PropTypes from "prop-types";
import { connect, Provider } from "react-redux";
import close from "../actions/close";
import STATUS from "../constants/status";
import SimpleModal from "../components/RobloxSimpleModal";

const mapStateToProps = ({ show }) => ({
  show,
});

const mapDispatchToProps = (dispatch, { onAction, onNeutral }) => ({
  onAction() {
    const next = onAction ? onAction() : true;
    if (next) {
      dispatch(close(STATUS.action));
    }
  },
  onNeutral() {
    const next = onNeutral ? onNeutral() : true;
    if (next) {
      dispatch(close(STATUS.neutral));
    }
  },
});

const ConnectedModal = connect(mapStateToProps, mapDispatchToProps)(SimpleModal);

const create = store => {
  function ModalComponent({
    title,
    body,
    actionButtonShow,
    actionButtonText,
    neutralButtonText,
    onAction,
    onNeutral,
    footerText,
    imageUrl,
    thumbnail,
    loading,
    disableActionButton,
    closeable,
    size,
    id,
  }) {
    return (
      <Provider store={store}>
        <ConnectedModal
          {...{
            title,
            body,
            actionButtonShow,
            actionButtonText,
            footerText,
            neutralButtonText,
            imageUrl,
            thumbnail,
            loading,
            onAction,
            onNeutral,
            disableActionButton,
            closeable,
            id,
            size,
          }}
        />
      </Provider>
    );
  }

  ModalComponent.defaultProps = {
    title: "",
    body: null,
    actionButtonShow: false,
    actionButtonText: "",
    footerText: "",
    neutralButtonText: "",
    imageUrl: null,
    thumbnail: null,
    onAction: null,
    onNeutral: null,
    disableActionButton: false,
    loading: false,
    closeable: true,
    id: null,
    size: "sm",
  };

  ModalComponent.propTypes = {
    title: PropTypes.string,
    body: PropTypes.node,
    actionButtonShow: PropTypes.bool,
    actionButtonText: PropTypes.string,
    footerText: PropTypes.string,
    neutralButtonText: PropTypes.string,
    imageUrl: PropTypes.string,
    thumbnail: PropTypes.node,
    onAction: PropTypes.func,
    onNeutral: PropTypes.func,
    disableActionButton: PropTypes.bool,
    loading: PropTypes.bool,
    closeable: PropTypes.bool,
    id: PropTypes.string,
    size: PropTypes.oneOf(["sm", "md", "lg"]),
  };

  return ModalComponent;
};

export default { create };
