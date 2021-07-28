import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
  })
);

export default function Inputs(props: { value: string; onChange: (e: any) => void; onKeyPress: (e: any) => void }) {
  const classes = useStyles();

  return (
    <form className={classes.root} noValidate autoComplete="off">
      <Input
        placeholder="username"
        inputProps={{ 'aria-label': 'description', onChange: props.onChange, onKeyPress: props.onKeyPress }}
        autoFocus
      />
    </form>
  );
}
