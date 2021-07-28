import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { IGameStat } from '../interface/gameInterface';

const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
});

function createData(
  id: number,
  playerLeft: string,
  playerRight: string,
  winner: string,
  playerLeftScore: number,
  playerRightScore: number,
  playTime: number
) {
  return {
    id,
    playerLeft,
    playerRight,
    winner,
    playerLeftScore,
    playerRightScore,
    playTime,
  };
}

function Row(props: { row: ReturnType<typeof createData> }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useRowStyles();

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" align="right">
          {row.id}
        </TableCell>
        <TableCell align="right">{row.playerLeft}</TableCell>
        <TableCell align="right">{row.playerRight}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                History
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    {/* <TableCell>winner</TableCell> */}
                    <TableCell align="right">winner</TableCell>
                    <TableCell align="right">playerLeftScore</TableCell>
                    <TableCell align="right">playerRightScore</TableCell>
                    <TableCell align="right">playTime</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow key={row.id}>
                    {/* <TableCell component="th" scope="row">
                      {row.winner}
                    </TableCell> */}
                    <TableCell align="right">{row.winner}</TableCell>
                    <TableCell align="right">{row.playerLeftScore}</TableCell>
                    <TableCell align="right">{row.playerRightScore}</TableCell>
                    <TableCell align="right">{row.playTime}s</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function CollapsibleTable(props: { userGameHistory: IGameStat[] }) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell align="right">id</TableCell>
            <TableCell align="right">Player1</TableCell>
            <TableCell align="right">Player2</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.userGameHistory.map((history) => {
            const row = createData(
              history.id,
              history.playerLeft,
              history.playerRight,
              history.winner,
              history.playerLeftScore,
              history.playerRightScore,
              history.playTime
            );
            return <Row key={row.id} row={row} />;
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
