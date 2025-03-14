/* eslint-disable react/prop-types */
import { Typography, Button, IconButton } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import makeStyles from '@mui/styles/makeStyles'
import style from './style'
// import { Img } from 'uhrp-react'
// import confederacyHost from '../../utils/confederacyHost'

const useStyles = makeStyles(style, { name: 'pageHeader' })

const PageHeader = ({ title, subheading, icon, buttonTitle, buttonIcon, onClick, history, showButton = true, showBackButton = true }) => {
  const classes = useStyles()
  return (
    <div>
      <div className={classes.top_grid}>
        {showBackButton &&
          <div>
            <IconButton
              className={classes.back_button}
              onClick={() => history.go(-1)}
              size='large'
            >
              <ArrowBack />
            </IconButton>
          </div>}
        <div>
          <img
            className={classes.app_icon}
            src={icon}
            alt={title}
          // poster={title}
          />
        </div>
        <div>
          <Typography variant='h1' color='textPrimary'>
            {title}
          </Typography>
          {typeof subheading === 'string'
            ? <Typography color='textSecondary'>
              {subheading}
            </Typography>
            : <div style={{ height: '3em' }}>{subheading}</div>}
        </div>
        <div>
          {showButton &&
            <Button
              className={classes.action_button}
              variant='contained'
              color='primary'
              size='large'
              endIcon={buttonIcon}
              onClick={onClick}
            >
              {buttonTitle}
            </Button>}

        </div>
      </div>
    </div>
  )
}
export default PageHeader
