import {assoc, dissoc, find, includes, map, pipe, pluck, reduce} from 'ramda';

import React from 'react';

import Typography from "@material-ui/core/Typography";
import {withStyles} from '@material-ui/core/styles';
import classNames from 'classnames';

import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import TextField from '@material-ui/core/TextField';
import Done from '@material-ui/icons/Done';
import Close from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';

import store from '../store';
import {loadItemInfo, savePointsAward, setItemActive} from '../actions';

const styles = theme => ({
    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        padding: theme.spacing.unit * 3,
        height: '100vh',
        overflow: 'auto',
    },
    tableContainer: {
        height: 320,
    },
    icon: {
        position: "relative",
        top: theme.spacing.unit,
        width: '0.7em',
        height: '0.7em',
        marginLeft: '0.5em',
        marginBottom: 5
    },
    red: {
        color: 'red'
    },
    green: {
        color: 'green'
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    button: {
        backgroundColor: '#00c2ee',
    }
});

// if it is variant, it returns its parent, otherwise equals identity
const getParentItem = (itemId, items) => {
    const getVariantIds = i => pluck('id', i.variants || []);
    const cond = i => i.id === itemId || includes(itemId, getVariantIds(i));

    return find(cond, items);
};

const courseAndIdFromStore = () => {
    const {course, item} = store.getState();
    const parentItem = getParentItem(item.item, course.items);

    return {
        course,
        item,
        parentItem,
        courseId: course.id,
        itemId: item.item
    };
};

const debounceFn = (f, time) => {
    let timeout;

    const fIn = (...p) => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => f(...p), time);
    };

    fIn.clear = () => {
        if (timeout) {
            clearTimeout(timeout);
        }
    };

    return fIn;
};

const sendAwardPoints = debounceFn(
    (course, item, points) => store.dispatch(savePointsAward(course, item, points)),
    2000
);

class ItemInfo extends React.Component {
    constructor(props) {
        super(props);

        const {item} = courseAndIdFromStore();

        this.state = {
            pointsPerItem: item.pointsPerItem,
            isActive: Boolean(item.isActive),
        };
    }

    componentWillMount() {
        const {courseId, itemId} = courseAndIdFromStore();

        this.ticker = setInterval(() => store.dispatch(loadItemInfo(courseId, itemId)), 2000);
    }

    componentWillUnmount() {
        clearInterval(this.ticker);
    }

    handleAwardChange = e => {
        const {itemId, courseId} = courseAndIdFromStore();

        const val = e.target.value;
        const nVal = parseInt(val, 10);

        this.setState({pointsPerItem: Number.isNaN(nVal) ? val : nVal});

        if (!Number.isNaN(nVal)) {
            sendAwardPoints(courseId, itemId, nVal);
        } else {
            sendAwardPoints.clear();
        }
    };

    setItemActive = () => {
        const {course, item, courseId, itemId} = courseAndIdFromStore();
        const newIsActive = !item.isActive;

        this.setState({isActive: newIsActive});

        const data = {
            abbrv: course.abbrv,
            year: course.year,
            sem: course.sem,
            item: itemId,
            course: courseId,
        };

        store.dispatch(setItemActive(data));
    };

    render() {
        const {course, item, parentItem} = courseAndIdFromStore();
        const {classes} = this.props;
        const {students} = item;

        const doneClass = classNames([classes.icon, classes.green]);
        const closeClass = classNames([classes.icon, classes.red]);

        return (
            <main className={classes.content}>
                <div className={classes.appBarSpacer}/>
                <Typography variant="h4" gutterBottom component="h2"> {`${course.abbrv}: ${course.title}`} </Typography>
                <Typography variant="h6" gutterBottom component="h3"> {item.title} </Typography>

                <TextField
                    id="standard-number"
                    label="Points award"
                    type="number"
                    className={classes.textField}
                    InputLabelProps={{shrink: true}}
                    margin="normal"
                    value={this.state.pointsPerItem}
                    onChange={this.handleAwardChange}
                />

                <TextField
                    id="standard-number"
                    label="Max points"
                    type="number"
                    className={classes.textField}
                    InputLabelProps={{shrink: true}}
                    margin="normal"
                    defaultValue={parentItem.max}
                    disabled={true}
                />

                <Button
                    variant="contained"
                    className={classes.button}
                    disabled={this.state.isActive}
                    onClick={this.setItemActive}
                >
                    {this.state.isActive ? 'Item is active' : 'Set as active'}
                </Button>

                <Typography variant="h6" gutterBottom component="h3"> Students </Typography>

                <Typography component="div">
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell align="left">Login</TableCell>
                                <TableCell align="left">Awarded</TableCell>
                                <TableCell align="left">Total points</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map(student => (
                                <TableRow key={student.id}>
                                    <TableCell component="th" scope="row">{student.name}</TableCell>
                                    <TableCell component="th" scope="row">{student.login}</TableCell>
                                    <TableCell align="left">
                                        {student.awardedPoints || 0}
                                        {
                                            (student.awardedPoints && student.awardedPoints === item.pointsPerItem) ?
                                                <Done className={doneClass}/> :
                                                <Close className={closeClass}/>
                                        }
                                    </TableCell>
                                    <TableCell align="left">{student.points}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Typography>
            </main>
        );
    }
}

export default withStyles(styles)(ItemInfo);
