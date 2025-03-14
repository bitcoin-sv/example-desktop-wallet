import { useState, useRef, useEffect, useContext } from 'react'
import { useTheme } from '@emotion/react'
import { useBreakpoint } from '../../utils/useBreakpoints'
import { Switch, Route, useHistory, Redirect } from 'react-router-dom'
import style from './style.js'
import { makeStyles } from '@mui/styles'
import {
  Apps as BrowseIcon,
  Settings as SettingsIcon,
  School as SchoolIcon,
  Menu as MenuIcon,
  Badge as IdentityIcon
} from '@mui/icons-material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
  , IconButton, Drawer, Toolbar
} from '@mui/material'
import Profile from '../../components/Profile.jsx'
import { WalletContext } from '../../UserInterface'
import PageLoading from '../../components/PageLoading.js'

// pages

import AppAccess from './AppAccess/index.jsx'
import Trust from './Trust/index.js'
import MyIdentity from './MyIdentity/index.js'
import Apps from './Apps/index'
import App from './App/index'
import Settings from './Settings/index'
// import BasketAccess from './BasketAccess/index.jsx'
// import CertificateAccess from './CertificateAccess/index.jsx'
// import ProtocolAccess from './ProtocolAccess/index.jsx'
// import CounterpartyAccess from './CounterpartyAccess/index.jsx'

const useStyles = makeStyles(style as any, {
  name: 'Dashboard'
})

/**
 * Renders the Apps page and menu by default
 */
const Dashboard = () => {
  const breakpoints = useBreakpoint()
  const classes = useStyles({ breakpoints })
  const theme = useTheme()
  const history = useHistory()
  const { appName, appVersion, managers, adminOriginator } = useContext(WalletContext)
  const [pageLoading, setPageLoading] = useState(true)
  const [myIdentityKey, setMyIdentityKey] = useState('self')
  const [menuOpen, setMenuOpen] = useState(true)
  const menuRef = useRef(null)

  // Helper functions
  const handleDrawerToggle = () => {
    setMenuOpen(!menuOpen)
  }
  const getMargin = () => {
    if (menuOpen && !(breakpoints as any).sm) {
      return '16em'
    }
    return '0em'
  }

  // History.push wrapper
  const navigation = {
    push: (path) => {
      if ((breakpoints as any).sm) {
        setMenuOpen(false)
      }
      history.push(path)
    }
  }

  // First useEffect to handle breakpoint changes
  useEffect(() => {
    if (!(breakpoints as any).sm) {
      setMenuOpen(true)
    } else {
      setMenuOpen(false)
    }
  }, [breakpoints])

  // Second useEffect to handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  useEffect(() => {
    (async () => {
      if (managers.walletManager!.authenticated) {
        setPageLoading(false)
        const { publicKey } = await managers.permissionsManager!.getPublicKey({ identityKey: true }, adminOriginator)
        setMyIdentityKey(publicKey)
      }
    })()
  }, [history])

  if (pageLoading) {
    return <PageLoading />
  }
  return (
    <div className={classes.content_wrap} style={{ marginLeft: getMargin() }}>
      <div style={{ marginLeft: 0, width: menuOpen ? 'calc(100vw - 16em)' : '100vw', transition: 'margin .3s' }}>
        {(breakpoints as any).sm &&
          <div style={{ padding: '0.5em 0 0 0.5em' }} ref={menuRef}>
            <Toolbar>
              <IconButton edge='start' onClick={handleDrawerToggle} aria-label='menu'>
                <MenuIcon style={{ color: 'textPrimary', height: '1.25em', width: '1.25em' }} />
              </IconButton>
            </Toolbar>
          </div>}
      </div>
      <Drawer anchor='left' open={menuOpen} variant='persistent' onClose={handleDrawerToggle}>
        <div className={classes.list_wrap}>
          <Profile />
          <List>
            <ListItemButton
              onClick={() => navigation.push('/dashboard/apps')}
              selected={history.location.pathname === '/dashboard/apps'}
            >
              <ListItemIcon>
                <BrowseIcon />
              </ListItemIcon>
              <ListItemText>
                Apps
              </ListItemText>
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                navigation.push({
                  pathname: '/dashboard/identity'
                })
              }}
              selected={history.location.pathname === '/dashboard/identity'}
            >
              <ListItemIcon>
                <IdentityIcon />
              </ListItemIcon>
              <ListItemText>
                My Identity
              </ListItemText>
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                navigation.push({
                  pathname: '/dashboard/trust'
                })
              }}
              selected={history.location.pathname === '/dashboard/trust'}
            >
              <ListItemIcon>
                <VerifiedUserIcon />
              </ListItemIcon>
              <ListItemText>
                Trust Network
              </ListItemText>
            </ListItemButton>
            <ListItemButton
              onClick={() => navigation.push('/dashboard/settings')}
              selected={
                history.location.pathname === '/dashboard/settings'
              }
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText>
                Settings
              </ListItemText>
            </ListItemButton>

            <ListItemButton
              onClick={() => {
                window.open('https://projectbabbage.com/docs', '_blank')
              }}
            >
              <ListItemIcon>
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText style={{ color: (theme as any).palette.primary.secondary }}>
                Learn MetaNet Tech
              </ListItemText>
            </ListItemButton>

          </List>

          <center className={classes.sig_wrap}>
            <Typography
              variant='caption'
              color='textSecondary'
              className={classes.signature}
              align='center'
            >
              {appName} v{appVersion}<br /><br />
              Made with love by<br /><i>the Babbage Team</i>
            </Typography>
          </center>
        </div>
      </Drawer>
      <div className={classes.page_container}>
        <Switch>
          <Redirect from='/dashboard/counterparty/self' to={`/dashboard/counterparty/${myIdentityKey}`} />
          <Redirect from='/dashboard/counterparty/anyone' to='/dashboard/counterparty/0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' />
          <Route
            path='/dashboard/manage-app/:originator'
            component={AppAccess}
          />
          <Route
            path='/dashboard/app/:app'
            component={App}
          />
          <Route
            path='/dashboard/settings'
            component={Settings}
          />
          {/*<Route
            default
            path='/dashboard/apps'
            component={Apps}
          />*/}
          <Route
            path='/dashboard/identity'
            component={MyIdentity}
          />
          <Route
            path='/dashboard/trust'
            component={Trust}
          />
          {/*
          <Route
            path='/dashboard/basket/:basketId'
            component={BasketAccess}
          />
          <Route
            path='/dashboard/protocol/:protocolId'
            component={ProtocolAccess}
          />
          <Route
            path='/dashboard/counterparty/:counterparty'
            component={CounterpartyAccess}
          />
          <Route
            path='/dashboard/certificate/:certType'
            component={CertificateAccess}
          /> */}
          <Route
            path='/dashboard/apps'
            component={Apps}
          />
          <Route
            component={() => {
              return (
                <div className={classes.full_width} style={{ padding: '1em' }}>
                  <br />
                  <br />
                  <Typography align='center' color='textPrimary'>Use the menu to select a page</Typography>
                </div>
              )
            }}
          />
        </Switch>
      </div>
    </div>
  )
}

export default Dashboard
