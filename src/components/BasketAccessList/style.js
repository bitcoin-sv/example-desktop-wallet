export default theme => ({
  icon: {
    backgroundColor: theme.palette.primary.main
  },
  basketContainer: {
    ...theme.templates.boxOfChips,
    marginTop: '1em'
  }
})
