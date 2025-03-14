/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import { Typography, Button, LinearProgress } from '@mui/material'
import Transaction from './Transaction'

/**
 * Displays recent actions for a particular app
 * @param {object} obj - all params given in an object
 * @param {boolean} obj.loading - the state of fetching app transactions
 * @param {object} obj.appActions - app transactions
 * @param {number} obj.displayLimit - the number of transactions to display
 * @param {function} obj.setDisplayLimit - setter for displayLimit param
 * @param {function} obj.setRefresh - setter for refresh state variable which determines if the UI should be rerendered
 * @returns
 */
const RecentActions = ({ loading, appActions, displayLimit, setDisplayLimit, setRefresh, allActionsShown = false }) => {
  return (
    <div style={{ paddingTop: '1em' }}>
      <Typography variant='h3' color='textPrimary' gutterBottom style={{ paddingBottom: '0.2em' }}>
        Recent Actions
      </Typography>
      {appActions.transactions && appActions.transactions.map((action, index) => {
        const actionToDisplay = {
          txid: action.txid,
          description: action.note,
          amount: `${action.amount}`,
          inputs: action.inputs,
          outputs: action.outputs,
          timestamp: action.created_at
        }
        return (
          <Transaction
            key={index}
            {
            ...actionToDisplay
            }
          />
        )
      })}
      {appActions.transactions && appActions.transactions.length === 0 && <Typography color='textSecondary' align='center' style={{ paddingTop: '6em' }}>
        You haven't made any actions yet.
      </Typography>}
      {loading && <LinearProgress paddingTop='1em' />}
      {appActions.transactions && appActions.transactions.length !== 0 && <center style={{ paddingTop: '1em' }}>
        {allActionsShown
          ? <></>
          : <Button onClick={() => {
            // Note: Consider taking into account max number of txs available
            setDisplayLimit(displayLimit + 10)
            setRefresh(true)
          }}
          >View More Actions
          </Button>

        }

      </center>}
    </div>
  )
}
export default RecentActions
