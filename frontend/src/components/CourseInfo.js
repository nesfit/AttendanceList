import {assoc, dissoc, map, pipe, reduce} from 'ramda';

import React from 'react';

import Typography from "@material-ui/core/Typography";
import {withStyles} from '@material-ui/core/styles';

import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import SubdirectoryArrowRight from '@material-ui/icons/SubdirectoryArrowRight';

import store from '../store';

import {loadItemInfo} from '../actions';

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
        width: theme.typography.display1.fontSize,
        height: theme.typography.display1.fontSize
    },
    row: {
        '&:hover': {
            background: '#CCC',
        }
    }
});

const transformVariant = item => variant => pipe(
    assoc('max', item.max),
    assoc('child', true)
)(variant);

const flattenCourseItems = reduce((items, item) => {
    const variants = item.variants || [];
    const newVariants = map(transformVariant(item), variants);
    const newItem = dissoc('variants', item);

    return [...items, newItem, ...newVariants];
}, []);

const courseItemSelected = (courseId, itemId) => {
    store.dispatch(loadItemInfo(courseId, itemId));
};

const CourseInfo = (props) => {
    const {classes} = props;
    const {course} = store.getState();

    const rows = flattenCourseItems(course.items);

    return (
        <main className={classes.content}>
            <div className={classes.appBarSpacer}/>
            <Typography variant="h4" gutterBottom component="h2"> {`${course.abbrv}: ${course.title}`} </Typography>
            <Typography component="div" className={classes.chartContainer}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Item name</TableCell>
                            <TableCell align="left">Points</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map(row => (
                            <TableRow key={row.id} className={classes.row} onClick={() => courseItemSelected(course.id, row.id)}>
                                <TableCell component="th" scope="row">
                                    <Typography variant="body1">
                                        {row.child ? <SubdirectoryArrowRight className={classes.icon} /> : ''}
                                        {row.title}
                                    </Typography>
                                </TableCell>
                                <TableCell align="left">{row.max}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Typography>
        </main>
    );
};

export default withStyles(styles)(CourseInfo);
