export default theme => ({
  appList: {
    backgroundColor: theme.palette.background.leftMenu,
    padding: '1em 0 0 1em'
  },
  counterparty: {
    size: 0.2
  },
  revokeButton: {
    marginRight: '1em',
    '@media (max-width: 400px)': {
      marginRight: '4em'
    }
  },
  icon: {
    backgroundColor: theme.palette.primary.main
  },
  gridItem: {
    marginRight: '0.4em'
  },
  counterpartyContainer: {
    ...theme.templates.boxOfChips
  }
})
