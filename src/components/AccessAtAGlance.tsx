/* eslint-disable react/prop-types */
import { useState } from 'react'
import { Typography, Button, LinearProgress, List, ListSubheader, Divider, Box } from '@mui/material'
import ProtocolPermissionList from './ProtocolPermissionList'
import CertificateAccessList from './CertificateAccessList'

/**
 * Displays recent access for a particular app using chip associated components
 * @param {object} obj - all params given in an object
 * @param {string} obj.originator - app name
 * @param {boolean} obj.loading - the state of fetching app transactions
 * @param {function} obj.setRefresh - setter for refresh state variable which determines if the UI should be rerendered
 * @param {Router} obj.history - Allows React to navigate to different pages
 * @returns component chips to be displayed
 */
const AccessAtAGlance = ({ originator, loading, setRefresh, history }) => {
  const [protocolIsEmpty, setProtocolIsEmpty] = useState(false)
  const [certificateIsEmpty, setCertificateIsEmpty] = useState(false)

  return (
    <div style={{ paddingTop: '1em' }}>
      <Typography variant='h3' color='textPrimary' gutterBottom style={{ paddingBottom: '0.2em' }}>
        Access At A Glance
      </Typography>
      <List sx={{ bgcolor: 'background.paper', borderRadius: '0.25em', padding: '1em', minHeight: '13em' }}>
        <ProtocolPermissionList app={originator} limit={1} canRevoke={false} displayCount={false} listHeaderTitle='Most Recent Protocol' onEmptyList={() => setProtocolIsEmpty(true)} />
      </List>
      <Box sx={{ bgcolor: 'background.paper', borderRadius: '0.25em', minHeight: '13em' }}>
        <CertificateAccessList app={originator} limit={1} canRevoke={false} displayCount={false} listHeaderTitle='Most Recent Certificate' onEmptyList={() => setCertificateIsEmpty(true)} />
        {certificateIsEmpty && protocolIsEmpty &&
          <Typography color='textSecondary' align='center' style={{ paddingTop: '5em' }}>
            No recent access
          </Typography>}
      </Box>

      {loading && <LinearProgress />}
      <center style={{ padding: '1em' }}>

        <Button
          onClick={() => {
            history.push({
              pathname: `/dashboard/manage-app/${encodeURIComponent(originator)}`,
              state: {
              }
            })
          }}
          selected={
            history.location.pathname === `/dashboard/manage-app/${encodeURIComponent(originator)}`
          }
        >
          View App Access
        </Button>
      </center>
    </div>
  )
}

export default AccessAtAGlance
