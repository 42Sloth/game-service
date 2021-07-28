import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { IGameList } from '../interface/interface';
import '../index.css';
const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  btnWrapper: {
    display: 'flex',
    justifyContent: 'space-around',
  },
});

export default function SimpleCard(props: { game: IGameList; idx: number; handleClick: (e: any) => void }) {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;
  const { game, idx, handleClick } = props;

  return (
    <Card className={classes.root} variant="outlined">
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          {game.type === 'private' ? '🔐' : ''}
          {game.type}
        </Typography>
        <Typography variant="h5" component="h2">
          {game.leftPlayer}
          ㅤvsㅤ
          {game.rightPlayer === 'waiting' ? '...' : game.rightPlayer}
        </Typography>
        {/* <Typography className={classes.pos} color="textSecondary">
          adjective
        </Typography>
        <Typography variant="body2" component="p">
          well meaning and kindly.
          <br />
          {'"a benevolent smile"'}
        </Typography> */}
      </CardContent>
      <CardActions className={classes.btnWrapper}>
        <button
          id={game.roomId}
          name={idx.toString()}
          onClick={handleClick}
          value="selectEnter"
          disabled={game.rightPlayer !== 'waiting'}
        >
          Player mode
        </button>
        <button id={game.roomId} name={idx.toString()} onClick={handleClick} value="spectEnter">
          Spect mode
        </button>
      </CardActions>
    </Card>
  );
}
