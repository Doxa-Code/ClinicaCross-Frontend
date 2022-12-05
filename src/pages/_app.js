import Head from 'next/head'
import '../styles/global.css'
import 'react-calendar/dist/Calendar.css'
import 'react-datepicker/dist/react-datepicker.css'
import ModalAgendamento from '../components/agendamento/ModalAgendamento'
import ModalCadastroPaciente from '../components/agendamento/ModalAgendar/ModalCadastroPaciente'
import ModalAgendar from '../components/agendamento/ModalAgendar'
import '@fullcalendar/core/main.css'
import '@fullcalendar/daygrid/main.css'
import '@fullcalendar/timegrid/main.css'

const App = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Cloud Med</title>
      </Head>
      <iframe className="hidden" id="printSessionCloud"></iframe>
      <Component {...pageProps} />
      <ModalAgendamento />
      <ModalCadastroPaciente />
      <ModalAgendar />
    </>
  )
}

export default App
