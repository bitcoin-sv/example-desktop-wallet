/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import { Accordion, AccordionSummary, AccordionDetails, Typography, IconButton, Grid, Snackbar, Alert } from '@mui/material'
import { useTheme, makeStyles } from '@mui/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import CheckIcon from '@mui/icons-material/Check'
import AmountDisplay from './AmountDisplay'

const useStyles = makeStyles({
  txid: {
    fontFamily: 'monospace',
    color: 'textSecondary',
    userSelect: 'all',
    fontSize: '1em',
    '@media (max-width: 1000px) and (min-width: 401px)': {
      fontSize: '0.75em'
    },
    '@media (max-width: 400px) and (min-width: 0px)': {
      fontSize: '0.7em'
    }
  }
}, {
  name: 'RecentActions'
})

/**
 * Transaction Component for displaying information about an Action that happened
 * @param {object} props
 * @param {string} props.txid - the id of transaction associated with the action being displayed
 * @param {string} props.description - action description to display
 * @param {string} props.amount - amount of this transaction formatted with + or - depending on debit / credit
 * @param {object} props.inputs - the inputs to this transaction
 * @param {object} props.outputs - the outputs to this transaction
 * @param {object} props.fees - the sum of transaction fee and commission fee
 * @param {string} props.timestamp - transaction date formatted in standard ISO 8601 datetime format
 * @param {function} [props.onClick] - callback function to call when this component is clicked
 * @param {boolean} [props.isExpanded] - allows a parent page to override the expanded property of the accordion display the transaction details
 * @returns
 */
const Transaction = ({
  txid,
  description,
  amount,
  inputs,
  outputs,
  fees,
  timestamp,
  onClick,
  isExpanded
}) => {
  const [expanded, setExpanded] = useState(isExpanded || false)
  const [copied, setCopied] = useState(false)
  const theme = useTheme()
  const classes = useStyles()

  // Dynamically figure out if the amount is a credit or debit
  // Note: assumes standard amount string starting with + or -
  const determineAmountColor = (amount) => {
    const amountAsString = amount.toString()[0]
    if (amountAsString !== '-' && !isNaN(amountAsString)) {
      return 'green'
    } else if (amountAsString === '-') {
      return 'red'
    } else {
      return 'black'
    }
  }

  // Allow parent accordion override
  const handleExpand = () => {
    if (isExpanded !== undefined) {
      setExpanded(isExpanded)
    } else {
      setExpanded(!expanded)
    }
    if (onClick) {
      onClick()
    }
  }

  // Copies the TXID and timeouts the checkmark icon
  const handleCopy = () => {
    navigator.clipboard.writeText(txid)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  // Splits the txid into two evenly sized strings for displaying
  const splitString = (str, length) => {
    if (str === undefined || str === null) {
      str = ''
    }
    const firstLine = str.slice(0, length)
    const secondLine = str.slice(length)
    return [firstLine, secondLine]
  }
  const [firstLine, secondLine] = splitString(txid, 32)

  // Gets time ago assuming standard ISO 8601 time format
  const getTimeAgo = (timestamp) => {
    try {
      const currentTime = new Date()
      const diff = currentTime - new Date(timestamp)

      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      const years = Math.floor(days / 365)

      // Format the message to display
      if (years > 0) {
        return years === 1 ? `${years} year ago` : `${years} years ago`
      } else if (days > 0) {
        return days === 1 ? `${days} day ago` : `${days} days ago`
      } else if (hours > 0) {
        return hours === 1 ? `${hours} hour ago` : `${hours} hours ago`
      } else if (minutes > 0) {
        return minutes === 1 ? `${minutes} minute ago` : `${minutes} minutes ago`
      } else {
        if (isNaN(minutes)) {
          return 'Unknown'
        }
        return 'Just now'
      }
    } catch (error) {
      return 'Unknown'
    }
  }

  return (
    <Accordion expanded={expanded} onChange={handleExpand}>
      <AccordionSummary
        style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
        expandIcon={<ExpandMoreIcon />}
        aria-controls='transaction-details-content'
        id='transaction-details-header'
      >
        <Grid container direction='column'>
          <Grid item>
            <Typography variant='h5' style={{ color: 'textPrimary', wordBreak: 'break-all' }}>{description}</Typography>
          </Grid>
          <Grid item>
            <Grid container justifyContent='space-between'>
              <Grid item>
                <Typography variant='h6' style={{ color: determineAmountColor(amount) }}>
                  <AmountDisplay showPlus>{amount}</AmountDisplay>
                </Typography>
              </Grid>
              <Grid item paddingRight='1em'>
                <Typography variant='body2' style={{ color: 'textSecondary' }}>{getTimeAgo(timestamp)}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails style={{ padding: '1.5em', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <div>
          <Typography>TXID</Typography>
          <Grid container direction='row'>
            <Grid item sx={9} style={{ paddingRight: '0.5em' }}>
              <div><Typography variant='body' className={classes.txid}>{firstLine}</Typography></div>
              <div><Typography variant='body' className={classes.txid}>{secondLine}</Typography></div>
            </Grid>
            <Grid item sx={3}>
              <IconButton onClick={handleCopy} disabled={copied}>
                {copied ? <CheckIcon /> : <FileCopyIcon />}
              </IconButton>
            </Grid>
          </Grid>
          <Snackbar
            open={copied}
            autoHideDuration={2000}
            onClose={() => setCopied(false)}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            style={{ paddingRight: '1em' }}
          >
            <Alert severity='success'>
              Copied!
            </Alert>
          </Snackbar>
          {(inputs && inputs.length !== 0) ? <Typography variant='h6'>Inputs</Typography> : <></>}
          <div style={{ marginLeft: '0.5em' }}>
            <Grid container direction='column' style={{ padding: '0.5em' }}>
              {inputs.map((input, index) => (
                <div key={index}>
                  <Grid container direction='row'>
                    <Grid item style={{ paddingRight: '0.6em' }}>
                      <Typography variant='h6'>{`${index + 1}.`}</Typography>
                    </Grid>
                    <Grid item maxWidth='22em'>
                      <Typography variant='body' style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>
                        {input.description}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item style={{ marginLeft: '1.7em', paddingRight: '1em' }}>
                    <Typography variant='body2'>
                      <AmountDisplay description={input.description}>{input.amount}</AmountDisplay>
                    </Typography>
                  </Grid>
                </div>
              ))}
            </Grid>
          </div>
          {(outputs && outputs.length !== 0) ? <Typography variant='h6'>Outputs</Typography> : <></>}
          <div style={{ marginLeft: '0.5em' }}>
            <Grid container direction='column' style={{ padding: '0.5em' }}>
              {outputs.map((output, index) => (
                <div key={index}>
                  <Grid container>
                    <Grid item style={{ paddingRight: '0.6em' }}>
                      <Typography variant='h6'>{`${index + 1}.`}</Typography>
                    </Grid>
                    <Grid item maxWidth='22em'>
                      <Typography variant='body' style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>
                        {output.description}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item style={{ marginLeft: '1.7em', paddingRight: '1em' }}>
                    <Typography variant='body2'>
                      <AmountDisplay description={output.description}>{output.amount}</AmountDisplay>
                    </Typography>
                  </Grid>
                </div>
              ))}
            </Grid>
          </div>
          {(fees) ? <Typography variant='h6'>Fees</Typography> : <></>}
          <div style={{ marginLeft: '0.5em' }}>
            <Typography variant='body2'>
              <AmountDisplay description={'Transaction and commission fees'}>{fees}</AmountDisplay>
            </Typography>
          </div>
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

export default Transaction
