export default theme => ({
  icon: {
    backgroundColor: theme.palette.primary.main
  },
  root: {
    padding: theme.spacing(2)
  },
  titleSection: {
    padding: theme.spacing(2)
  },
  spendingSection: {
    padding: theme.spacing(2)
  },
  buttonSection: {
    padding: theme.spacing(2)
  },
  title: {
    fontWeight: 'bold'
  },
  revokeButton: {
    color: 'white',
    // '&:hover': {
    //   backgroundColor: 'darkred'
    // }
  },
  increaseButton: {
    // backgroundColor: 'black',
    color: '#5DFF94'
  },
  spendingLimitText: {
    margin: theme.spacing(2, 0)
  },
  spendingLimitValue: {
    fontWeight: 'bold'
  }
})
