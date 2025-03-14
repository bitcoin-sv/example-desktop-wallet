/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback, useContext } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  ListSubheader
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import style from './style'
import { toast } from 'react-toastify'
import BasketChip from '../BasketChip'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import AppChip from '../AppChip'
import { formatDistance } from 'date-fns/formatDistance'
import { WalletContext } from '../../UserInterface'
import { PermissionToken } from '@bsv/wallet-toolbox-client'

const useStyles = makeStyles(style, {
  name: 'BasketAccessList'
})

/**
 * A component for displaying a list of basket permissions as apps with access to a basket, or baskets an app can access.
 *
 * @param {Object} obj - An object containing the following parameters:
 * @param {string} obj.app - The application context or configuration.
 * @param {number} obj.limit - The maximum number of permissions to display.
 * @param {string} obj.basket - The basket name for which permissions are being displayed.
 * @param {number} [obj.securityLevel] - The basket securityLevel for which permissions are being displayed (optional).
 * @param {string} [obj.itemsDisplayed='baskets'] - The type of items to display ('baskets' or 'apps', 'baskets' by default).
 * @param {boolean} [obj.canRevoke=true] - Indicates whether permissions can be revoked (true by default).
 * @param {boolean} [obj.displayCount=true] - Indicates whether to display the count of permissions (true by default).
 * @param {string} [obj.listHeaderTitle] - The title for the list header.
 * @param {boolean} [obj.showEmptyList=false] - Indicates whether to show an empty list message or remove it (false by default).
 */
const BasketAccessList = ({ app, basket, limit, itemsDisplayed = 'baskets', canRevoke = false, displayCount = true, listHeaderTitle, showEmptyList = false, onEmptyList = () => { } }) => {
  const { managers } = useContext(WalletContext)
  // Validate params
  if (itemsDisplayed === 'apps' && app) {
    const e = new Error('Error in BasketAccessList: apps cannot be displayed when providing an app param! Please provide a valid basket instead.')
    throw e
  }
  if (itemsDisplayed === 'baskets' && basket) {
    const e = new Error('Error in BasketAccessList: baskets cannot be displayed when providing a basket param! Please provide a valid app domain instead.')
    throw e
  }
  const [currentApp, setCurrentApp] = useState(null)
  const [grants, setGrants] = useState<PermissionToken[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentAccessGrant, setCurrentAccessGrant] = useState(null)
  const [dialogLoading, setDialogLoading] = useState(false)
  const classes = useStyles()
  const history = useHistory()

  const refreshGrants = useCallback(async () => {
    const result = await managers.permissionsManager.listBasketAccess({
      originator: app,
      // targetBasket: basket,
      // limit
    })
    setGrants(result)
    if (result.length === 0) {
      onEmptyList()
    }
  }, [app, basket])

  const revokeAccess = async grant => {
    setCurrentAccessGrant(grant)
    setDialogOpen(true)
  }

  const handleConfirm = async () => {
    try {
      setDialogLoading(true)
      if (currentAccessGrant) {
        await managers.permissionsManager.revokePermission(currentAccessGrant)
      } else {
        if (!currentApp || !currentApp.grant) {
          const e = new Error('Unable to revoke permissions!')
          throw e
        }
        for (const permission of currentApp.grants) {
          try {
            await managers.permissionsManager.revokePermission(permission.permissionGrant)
          } catch (error) {
            console.error(error)
          }
        }
        setCurrentApp(null)
      }

      // setGrants(oldAccessGrant =>
      //   oldAccessGrant.filter(x =>
      //     x.accessGrantID !== currentAccessGrant.accessGrantID
      //   )
      // )

      setCurrentAccessGrant(null)
      setDialogOpen(false)
      setDialogLoading(false)
      refreshGrants()
    } catch (e) {
      toast.error('Access may not have been revoked: ' + e.message)
      refreshGrants()
      setCurrentAccessGrant(null)
      setDialogOpen(false)
      setDialogLoading(false)
    }
  }

  const handleDialogClose = () => {
    setCurrentAccessGrant(null)
    setDialogOpen(false)
  }

  useEffect(() => {
    refreshGrants()
  }, [refreshGrants])

  if (grants.length === 0 && !showEmptyList) {
    return (<></>)
  }

  return (
    <>
      <Dialog
        open={dialogOpen}
      >
        <DialogTitle color='textPrimary'>
          Revoke Access?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can re-authorize this access grant next time you use this app.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color='primary'
            disabled={dialogLoading}
            onClick={handleDialogClose}
          >
            Cancel
          </Button>
          <Button
            color='primary'
            disabled={dialogLoading}
            onClick={handleConfirm}
          >
            Revoke
          </Button>
        </DialogActions>
      </Dialog>
      {/* <List> */}
      {listHeaderTitle && (
        <ListSubheader>
          {listHeaderTitle}
        </ListSubheader>
      )}
      <div className={classes.basketContainer}>
        {grants.map((grant, i) => (
          <React.Fragment key={i}>
            {itemsDisplayed === 'apps' && (
              <div className={classes.basketContainer}>
                <AppChip
                  label={grant.domain} showDomain onClick={(e) => {
                    e.stopPropagation()
                    history.push({
                      pathname: `/dashboard/app/${encodeURIComponent(grant.domain)}`,
                      state: {
                        domain: grant.domain
                      }
                    })
                  }}
                  canRevoke={canRevoke}
                  onCloseClick={() => { revokeAccess(grant) }}
                  backgroundColor='default'
                  expires={formatDistance(new Date(grant.expiry * 1000), new Date(), { addSuffix: true })}
                />
              </div>
            )}

            {itemsDisplayed !== 'apps' && (
              <div style={{ marginRight: '0.4em' }}>
                <BasketChip
                  basketId={grant.basket}
                  counterparty={grant.counterparty}
                  domain={grant.domain}
                  clickable
                  expires={formatDistance(new Date(grant.expiry * 1000), new Date(), { addSuffix: true })}
                  onCloseClick={() => revokeAccess(grant)}
                  canRevoke={canRevoke}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      {displayCount &&
        <center>
          <Typography
            color='textSecondary'
          >
            <i>{itemsDisplayed === 'baskets' ? 'Total Basket Access Grants' : 'Total Apps with Access'}: {grants.length}</i>
          </Typography>
        </center>}
    </>
  )
}

export default BasketAccessList
