import React, { useState, useEffect, useCallback, useContext } from 'react'
import {
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  ListSubheader,
  IconButton
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import style from './style'
import { formatDistance } from 'date-fns/formatDistance'
import { toast } from 'react-toastify'
import CertificateChip from '../CertificateChip'
import sortPermissions from './sortPermissions'
import AppChip from '../AppChip'
import CloseIcon from '@mui/icons-material/Close'
import { useHistory } from 'react-router-dom'
import { WalletContext } from '../../UserInterface'
import type { PermissionToken } from '@bsv/wallet-toolbox-client'

const useStyles = makeStyles(style, {
  name: 'CertificateAccessList'
})

const CertificateAccessList = ({
  app,
  itemsDisplayed,
  counterparty,
  type,
  limit,
  displayCount = true,
  listHeaderTitle,
  showEmptyList = false,
  canRevoke = false,
  onEmptyList = () => { }
}) => {
  const { managers } = useContext(WalletContext)
  const [grants, setGrants] = useState<PermissionToken[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentAccessGrant, setCurrentAccessGrant] = useState<PermissionToken | null>(null)
  const [currentApp, setCurrentApp] = useState(null)
  const [dialogLoading, setDialogLoading] = useState(false)
  const classes = useStyles()
  const history = useHistory()

  const refreshGrants = useCallback(async () => {
    const result = await managers.permissionsManager.listCertificateAccess({
      originator: app
      // verifierPublicKey: counterparty,
      // targetCertificateType: type,
      // limit
    })

    // Filter permissions by counterparty and domain if items are displayed as apps
    if (itemsDisplayed === 'apps') {
      const results = sortPermissions(result)
      setGrants(results)
    } else {
      setGrants(result)
    }

    if (result.length === 0) {
      onEmptyList()
    }
  }, [app, type])

  const revokeAccess = async grant => {
    setCurrentAccessGrant(grant)
    setDialogOpen(true)
  }

  // TODO: test this more exhaustively!
  const revokeAllAccess = async (app) => {
    setCurrentApp(app)
    setDialogOpen(true)
  }

  // Handle revoke dialog confirmation
  const handleConfirm = async () => {
    try {
      setDialogLoading(true)
      if (currentAccessGrant) {
        await managers.permissionsManager.revokePermission(currentAccessGrant)
      } else {
        if (!currentApp || !currentApp.permissions) {
          const e = new Error('Unable to revoke permissions!')
          throw e
        }
        for (const permission of currentApp.permissions) {
          try {
            await managers.permissionsManager.revokePermission(permission)
          } catch (error) {
            console.error(error)
          }
        }
        setCurrentApp(null)
      }

      setCurrentAccessGrant(null)
      setDialogOpen(false)
      setDialogLoading(false)
      refreshGrants()
    } catch (e) {
      toast.error('Certificate access grant may not have been revoked: ' + e.message)
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

  // Only render the list if there is items to display
  if (grants.length === 0 && !showEmptyList) {
    return (<></>)
  }

  return (
    <>
      <Dialog
        open={dialogOpen}
      >
        <DialogTitle>
          Revoke Access?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can re-authorize this certificate access grant next time you use this app.
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
        {listHeaderTitle &&
          <ListSubheader>
            {listHeaderTitle}
          </ListSubheader>}
        {grants.map((grant, i) => (
          <React.Fragment key={i}>

            {/* Counterparties listed just below the header */}
            {itemsDisplayed === 'apps' && (
              <div className={classes.appList}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '1em', alignItems: 'center' }}>
                  <AppChip
                    label={grant.originator} showDomain onClick={(e) => {
                      e.stopPropagation()
                      history.push({
                        pathname: `/dashboard/app/${encodeURIComponent(grant.originator)}`,
                        state: {
                          domain: grant.originator
                        }
                      })
                    }}
                  />
                  {canRevoke &&
                    <>
                      {grant && grant.originator
                        ? <Button onClick={() => { revokeAllAccess(grant) }} color='secondary' className={classes.revokeButton}>
                          Revoke All
                        </Button>
                        : <IconButton edge='end' onClick={() => revokeAccess(grant.permissions[0].permissionGrant)} size='large'>
                          <CloseIcon />
                        </IconButton>}
                    </>}
                </div>
                <ListItem elevation={4}>
                  <div className={classes.counterpartyContainer}>
                    {grant.permissions.map((permission, idx) => (
                      <div className={classes.gridItem} key={idx}>
                        <CertificateChip
                          certType={permission.type}
                          lastAccessed={permission.lastAccessed}
                          issuer={permission.issuer}
                          onIssuerClick={permission.onIssuerClick}
                          verifier={permission.verifier}
                          onVerifierClick={permission.onVerifierClick}
                          onClick={permission.onClick}
                          fieldsToDisplay={permission.fields}
                          history
                          clickable={permission.clickable}
                          size={1.3}
                          expires={formatDistance(new Date(permission.expiry * 1000), new Date(), { addSuffix: true })}
                          onCloseClick={() => revokeAccess(permission)}
                          canRevoke={canRevoke}
                        />
                      </div>
                    ))}
                  </div>
                </ListItem>
              </div>
            )}
            {itemsDisplayed !== 'apps' &&
              <ListItem className={classes.action_card} elevation={4}>
                <CertificateChip
                  certType={grant.type}
                  lastAccessed={grant.lastAccessed}
                  issuer={grant.issuer}
                  onIssuerClick={grant.onIssuerClick}
                  verifier={grant.verifier}
                  onVerifierClick={grant.onVerifierClick}
                  onClick={grant.onClick}
                  fieldsToDisplay={grant.fields}
                  history
                  clickable={grant.clickable}
                  size={1.3}
                  expires={formatDistance(new Date(grant.expiry * 1000), new Date(), { addSuffix: true })}
                  onCloseClick={() => revokeAccess(grant)}
                  canRevoke={canRevoke}
                />
              </ListItem>}

          </React.Fragment>
        ))}
      </List>

      {displayCount &&
        <center>
          <Typography
            color='textSecondary'
          >
            <i>Total Certificate Access Grants: {grants.length}</i>
          </Typography>
        </center>}

    </>
  )
}

export default CertificateAccessList
