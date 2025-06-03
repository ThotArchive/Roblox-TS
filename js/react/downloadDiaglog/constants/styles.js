import { makeStyles } from '@rbx/ui';

const headingStyle = theme => ({ ...theme.typography.h2 });
const subHeadingStyle = theme => ({
  ...theme.typography.h5,
  fontSize: '16px',
  paddingBottom: '8px'
});
const paragraphStyle = { width: '268px', paddingBottom: '24px', fontSize: '14px' };
const spanStyle = { display: 'block', width: '285px' };
const listItemStyle = { listStyleType: 'decimal', listStylePosition: 'outside' };

const messageStyle = theme => ({
  ...theme.typography.h5,
  fontSize: '20px',
  color: theme.palette.content.standard
});

const iconButtonStyle = {
  position: 'absolute',
  left: '12px',
  top: '10px'
};

const useStyles = makeStyles()(theme => ({
  container: {
    display: 'flex',
    width: '729px',
    padding: '54.5px 40px 40px 40px',
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: theme.palette.surface[200],
    a: {
      textDecoration: 'underline'
    }
  },
  paragraph: {
    alignSelf: 'stretch',
    width: '589px',
    paddingBottom: '40px'
  },
  columnWrapper: {
    width: '649px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '56px',
    alignSelf: 'stretch',
    flexDirection: 'row'
  },
  column: {
    flex: 1,
    width: '268px'
  },
  columnRight: {
    width: '268px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  borderRight: {
    borderRight: '1px solid #333',
    paddingRight: '24px',
    display: 'flex',
    flexDirection: 'column'
  },
  list: {
    listStyleType: 'decimal',
    listStylePosition: 'inside',
    paddingLeft: '20px',
    display: 'inline-grid',
    gap: '20px',
    fontSize: '14px'
  },
  qrBox: {
    display: 'flex',
    width: '268px',
    height: '190px',
    padding: '20px',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    alignSelf: 'stretch',
    borderRadius: '8px',
    background: 'rgba(208, 217, 251, 0.04)'
  },
  qrImage: {
    width: '100px',
    height: '100px',
    objectFit: 'contain',
    border: '8px solid white',
    borderRadius: '12px'
  },
  message: {}
}));

const useDialogContainerStyles = makeStyles()(theme => ({
  root: {
    width: '350px',
    height: '284px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: 600,
    padding: '54px 24px 24px',
    backgroundColor: theme.palette.surface[200]
  },
  logoBox: {
    width: '72px'
  },
  logoImage: {
    width: '72px',
    height: '72px'
  },
  message: {
    lineHeight: '120%',
    letterSpacing: '-0.2px',
    padding: '24px'
  },
  button: {
    width: '302px',
    height: '40px',
    fontSize: '14px'
  }
}));

const useNewDialogStyles = makeStyles()(theme => ({
  foreground: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: theme.palette.content.standard,
    color: theme.palette.content.inverse
  }
}));
export {
  useStyles,
  useDialogContainerStyles,
  useNewDialogStyles,
  headingStyle,
  subHeadingStyle,
  paragraphStyle,
  spanStyle,
  listItemStyle,
  messageStyle,
  iconButtonStyle
};
