const withTM = require('next-transpile-modules')([
  '@fullcalendar/common',
  '@fullcalendar/react',
  '@fullcalendar/daygrid',
  '@fullcalendar/timegrid',
  '@fullcalendar/list',
  '@fullcalendar/interaction'
])

module.exports = withTM({})
