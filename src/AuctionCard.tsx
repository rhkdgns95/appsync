import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';


interface IProps {
    name: string;
    price: number;
    title?: string | null;
}

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
});



const AuctionCard: React.FC<IProps> = ({
    name,
    price,
    title
}) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h5" component="h2">
          { name }
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          ${ price }
        </Typography>
        <Typography variant="body2" component="p">
          { title }
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">BID</Button>
      </CardActions>
    </Card>
  );
};

export default AuctionCard;