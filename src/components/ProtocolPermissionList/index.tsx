/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback, useContext } from 'react'
import {
  List,
  ListItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  ListSubheader,
  Divider
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import style from './style'
import CloseIcon from '@mui/icons-material/Close'
import { toast } from 'react-toastify'
import ProtoChip from '../ProtoChip'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import AppChip from '../AppChip'
import CounterpartyChip from '../CounterpartyChip'
import sortPermissions from './sortPermissions'
import { formatDistance } from 'date-fns/formatDistance'
import sortPermissionsForProtocols from './sortPermissionsForProtocols'
import { WalletContext } from '../../UserInterface'
import { PermissionToken } from '@bsv/wallet-toolbox-client'

const useStyles = makeStyles(style, {
  name: 'ProtocolPermissionList'
})

/**
 * A component for displaying a list of protocol permissions as apps with access to a protocol, or protocols an app can access.
 *
 * @param {Object} obj - An object containing the following parameters:
 * @param {string} obj.app - The application context or configuration.
 * @param {number} obj.limit - The maximum number of permissions to display.
 * @param {string} obj.protocol - The protocol name for which permissions are being displayed.
 * @param {number} [obj.securityLevel] - The protocol securityLevel for which permissions are being displayed (optional).
 * @param {string} [obj.itemsDisplayed='protocols'] - The type of items to display ('protocols' or 'apps', 'protocols' by default).
 * @param {boolean} [obj.canRevoke=true] - Indicates whether permissions can be revoked (true by default).
 * @param {boolean} [obj.displayCount=true] - Indicates whether to display the count of permissions (true by default).
 * @param {string} [obj.listHeaderTitle] - The title for the list header.
 * @param {boolean} [obj.showEmptyList=false] - Indicates whether to show an empty list message or remove it (false by default).
 */
const ProtocolPermissionList = ({ app, limit, protocol, securityLevel, counterparty, itemsDisplayed = 'protocols', canRevoke = false, displayCount = true, listHeaderTitle, showEmptyList = false, onEmptyList = () => { } }) => {
  // TODO: determine if this is necessary! Validate params
  // if (itemsDisplayed === 'apps' && app) {
  //   const e = new Error('Error in ProtocolPermissionList: apps cannot be displayed when providing an app param! Please provide a valid protocol instead.')
  //   throw e
  // }
  // if (itemsDisplayed === 'protocols' && protocol) {
  //   const e = new Error('Error in ProtocolPermissionList: protocols cannot be displayed when providing a protocol param! Please provide a valid app domain instead.')
  //   throw e
  // }

  const { managers } = useContext(WalletContext)
  const [perms, setPerms] = useState<PermissionToken[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentPerm, setCurrentPerm] = useState<PermissionToken | null>(null)
  const [currentApp, setCurrentApp] = useState(null)
  const [dialogLoading, setDialogLoading] = useState(false)

  const classes = useStyles()
  const history = useHistory()
  // const theme = useTheme()

  const refreshPerms = useCallback(async () => {
    // Get the current permission grants
    const result = await managers.permissionsManager.listProtocolPermissions({
      originator: app
      // targetProtocolName: protocol,
      // targetProtocolSecurityLevel: securityLevel,
      // targetCounterparty: counterparty,
      // limit
    })

    // Filter permissions by counterparty and domain if items are displayed as apps
    if (itemsDisplayed === 'apps') {
      const results = sortPermissions(result)
      setPerms(results)
      if (results.length === 0) {
        onEmptyList()
      }
    } else {
      const results = sortPermissionsForProtocols(result)
      setPerms(results)
      if (results.length === 0) {
        onEmptyList()
      }
    }
  }, [app, protocol])

  // Handle revoking permissions (for an app, or a particular counterparty permission grant)
  const revokePermission = async perm => {
    setCurrentPerm(perm)
    setDialogOpen(true)
  }
  const revokeAllPermissions = async (app) => {
    setCurrentApp(app)
    setDialogOpen(true)
  }

  // Handle revoke dialog confirmation
  const handleConfirm = async () => {
    try {
      setDialogLoading(true)
      if (currentPerm) {
        await managers.permissionsManager.revokePermission(currentPerm)
      } else {
        if (!currentApp || !currentApp.permissions) {
          const e = new Error('Unable to revoke permissions!')
          throw e
        }
        for (const permission of currentApp.permissions) {
          try {
            await managers.permissionsManager.revokePermission(permission.permissionGrant)
          } catch (error) {
            console.error(error)
          }
        }
        setCurrentApp(null)
      }

      setCurrentPerm(null)
      setDialogOpen(false)
      setDialogLoading(false)
      refreshPerms()
    } catch (e) {
      toast.error('Permission may not have been revoked: ' + e.message)
      refreshPerms()
      setCurrentPerm(null)
      setDialogOpen(false)
      setDialogLoading(false)
    }
  }

  const handleDialogClose = () => {
    setCurrentPerm(null)
    setDialogOpen(false)
  }

  useEffect(() => {
    refreshPerms()
  }, [refreshPerms])

  // Determines if an empty list showed be shown or just removed
  if (perms.length === 0 && !showEmptyList) {
    return (<></>)
  }

  return (
    <>
      <Dialog
        open={dialogOpen}
      >
        <DialogTitle color='textPrimary'>
          Revoke Permission?
        </DialogTitle>
        <DialogContent>
          <DialogContentText color='textSecondary'>
            You can re-authorize this permission next time you use this app.
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
      <List>
        {listHeaderTitle && (
          <ListSubheader>
            {listHeaderTitle}
          </ListSubheader>
        )}
        {perms.map((permObject, i) => (
          <React.Fragment key={i}>

            {/* Counterparties listed just below the header */}
            {itemsDisplayed === 'apps' && (
              <div className={classes.appList}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '1em', alignItems: 'center' }}>
                  <AppChip
                    backgroundColor='default'
                    label={permObject.originator} showDomain onClick={(e) => {
                      e.stopPropagation()
                      history.push({
                        pathname: `/dashboard/app/${encodeURIComponent(permObject.originator)}`,
                        state: {
                          domain: permObject.originator
                        }
                      })
                    }}
                  />
                  {canRevoke &&
                    <>
                      {permObject.permissions.length > 0 && permObject.permissions[0].counterparty
                        ? <Button onClick={() => { revokeAllPermissions(permObject) }} color='secondary' className={classes.revokeButton}>
                          Revoke All
                        </Button>
                        : <IconButton edge='end' onClick={() => revokePermission(permObject.permissions[0].permissionGrant)} size='large'>
                          <CloseIcon />
                        </IconButton>}
                    </>}
                </div>

                <ListItem elevation={4}>
                  <div className={classes.counterpartyContainer}>
                    {permObject.permissions.filter(x => x.counterparty).map((permission, idx) => (
                      <div className={classes.gridItem} key={idx}>
                        <CounterpartyChip
                          backgroundColor='default'
                          counterparty={permission.counterparty}
                          size={1.1}
                          expires={formatDistance(new Date(permission.permissionGrant.expiry * 1000), new Date(), { addSuffix: true })}
                          onCloseClick={() => revokePermission(permission.permissionGrant)}
                          clickable
                          canRevoke={canRevoke}
                          history
                        />
                      </div>
                    ))}
                  </div>
                </ListItem>

              </div>
            )}

            {itemsDisplayed !== 'apps' && (
              <div className={classes.appList}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '1em', alignItems: 'center' }}>
                  <ProtoChip
                    backgroundColor='default'
                    protocolID={permObject.permissions[0].permissionGrant.protocol}
                    securityLevel={permObject.permissions[0].permissionGrant.securityLevel}
                    originator={permObject.permissions[0].permissionGrant.originator}
                    clickable
                    canRevoke={false}
                    history
                  // onCloseClick={() => revokePermission(permObject.permissionGrant)}
                  />
                  {canRevoke &&
                    <>
                      {permObject.permissions.length > 0 && permObject.permissions[0].counterparty
                        ? <Button onClick={() => { revokeAllPermissions(permObject) }} color='secondary' className={classes.revokeButton}>
                          Revoke All
                        </Button>
                        : <Button onClick={() => { revokePermission(permObject.permissions[0].permissionGrant) }} className={classes.revokeButton}>
                          Revoke
                        </Button>}
                    </>}
                </div>

                <ListItem elevation={4}>
                  <div className={classes.counterpartyContainer}>
                    {permObject.permissions.filter(x => x.counterparty).map((permission, idx) => (
                      <div className={classes.gridItem} key={idx}>
                        {!counterparty &&
                          <CounterpartyChip
                            backgroundColor='default'
                            counterparty={permission.counterparty}
                            size={1.1}
                            expires={formatDistance(new Date(permission.permissionGrant.expiry * 1000), new Date(), { addSuffix: true })}
                            onCloseClick={() => revokePermission(permission.permissionGrant)}
                            canRevoke={canRevoke}
                            clickable
                          />}
                        {counterparty &&
                          <AppChip
                            backgroundColor='default'
                            label={permission.permissionGrant.domain} showDomain onClick={(e) => {
                              e.stopPropagation()
                              history.push({
                                pathname: `/dashboard/app/${encodeURIComponent(permission.permissionGrant.domain)}`,
                                state: {
                                  domain: permission.permissionGrant.domain
                                }
                              })
                            }}
                            onCloseClick={() => revokePermission(permission.permissionGrant)}
                          />}
                      </div>
                    ))}
                  </div>
                </ListItem>
                <Divider />

              </div>
            )}
          </React.Fragment>
        ))}
      </List>

      {displayCount &&
        <center>
          <Typography
            color='textSecondary'
          >
            <i>Total Protocol Grants: {perms.length}</i>
          </Typography>
        </center>}

    </>
  )
}

export default ProtocolPermissionList
