import React from 'react';
import PropTypes from 'prop-types';

import InputBase from '@material-ui/core/InputBase';
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CircularProgress from '@material-ui/core/CircularProgress';

import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles';

import store from '../store';

import CourseInfo from './CourseInfo';
import ItemInfo from './ItemInfo';

import {loadCourse, deleteItem, logoutUser} from '../actions';
import Paper from "./SignIn";

const drawerWidth = 240;

const styles = theme => ({
    root: {
        display: 'flex',
    },
    toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 36,
    },
    menuButtonHidden: {
        display: 'none',
    },
    title: {
        flexGrow: 1,
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing.unit * 7,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing.unit * 9,
        },
    },
    h5: {
        marginBottom: theme.spacing.unit * 2,
    },
    inputInput: {
        margin: '10px',
    },
    logout: {
        color: 'white',
        fontSize: '1.5em',
    }
});

const handleSearchKeyDown = e => {
    if (e.key !== 'Enter') {
        return;
    }

    const abbrev = e.target.value;
    store.dispatch(deleteItem());
    store.dispatch(loadCourse(abbrev));
};

const handleDeauthUser = () => {
    console.log('OK');

    store.dispatch(logoutUser());
};

const bodyElement = ({course, item}) => {
    if (course && item) {
        return <ItemInfo/>;
    }

    if (course) {
        return <CourseInfo/>;
    }

    return 'Nothing loaded';
};

class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {searchText: ''};
    }

    searchTextChange = e => {
        const val = e.target.value || '';
        const newText = val.toUpperCase();

        this.setState({searchText: newText});
    };

    render() {
        const {classes} = this.props;
        const {searchText} = this.state;

        const state = store.getState();

        return (
            <div className={classes.root}>
                <CssBaseline/>
                <AppBar position="absolute" className={classNames(classes.appBar)}>
                    <Toolbar className={classes.toolbar}>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            className={classes.title}
                        >
                            Dashboard
                        </Typography>

                        {state.loading ? <CircularProgress className={classes.progress} color="secondary"/> : null}

                        <span className={classNames(classes.logout)} onClick={handleDeauthUser}> Logout </span>

                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" classes={{paper: classNames(classes.drawerPaper)}}>
                    <div className={classes.toolbarIcon}>
                        <IconButton><ChevronLeftIcon/></IconButton>
                    </div>
                    <Divider/>
                    <List><InputBase
                        placeholder="Subject abbreviation"
                        classes={{
                            root: classes.inputRoot,
                            input: classes.inputInput,
                        }}
                        value={searchText}
                        onChange={this.searchTextChange}
                        onKeyDown={handleSearchKeyDown}
                        defaultValue={state.courseSearchAbbrev}
                    /></List>
                </Drawer>
                {bodyElement(state)}
            </div>
        );
    }
}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dashboard);
