import React, { useEffect, useRef } from 'react'
import Calendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useAgendamentoStore, useAgendarStore } from '../hooks/store'
import ReactDOM from 'react-dom'

export default function FullCalendar({ setApi = () => {}, ...props }) {
  const calendarRef = useRef()
  const { configuracoes } = useAgendamentoStore(state => state)
  const { medico } = useAgendarStore()
  useEffect(() => {
    setApi(calendarRef.current?.getApi() || {})
  }, [calendarRef.current])

  useEffect(() => {
    calendarRef.current
      .getApi()
      .setOption('slotDuration', formatSlotDuration(configuracoes?.bloco || 15))
  }, [medico])

  const formatSlotDuration = bloco =>
    bloco
      ? bloco > 60
        ? `${bloco / 60 < 10 ? `0${bloco / 60}` : bloco / 60}:${
            bloco % 60 < 10 ? `0${bloco % 60}` : bloco % 60
          }:00`
        : `00:${bloco < 10 ? `0${bloco}` : bloco}:00`
      : '00:15:00'

  return (
    <Calendar
      {...props}
      eventDestroy={info =>
        ReactDOM.unmountComponentAtNode(info.el.querySelector('.fc-content'))
      }
      ref={calendarRef}
      locale="pt-br"
      viewClassNames="mb-20"
      timeZone="Brazil/Sao_Paulo"
      slotDuration={formatSlotDuration(configuracoes?.bloco || 15)}
      minTime={`${configuracoes.inicio}:00` || '08:00:00'}
      maxTime={`${configuracoes.fim}:00` || '19:00:00'}
      allDaySlot={true}
      allDayText="Encaixes"
      header={{
        left: 'title',
        center: '',
        right: 'today timeGridDay timeGridWeek dayGridMonth prev next'
      }}
      buttonText={{
        today: 'Hoje',
        month: 'Mês',
        week: 'Semana',
        day: 'Dia'
      }}
      dayHeaderContent={({ view }) => view.getCurrentData().viewTitle}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      defaultView="timeGridDay"
      eventTimeFormat={{
        hour: '2-digit',
        minute: '2-digit',
        meridiem: false
      }}
      slotLabelFormat={{
        hour: '2-digit',
        minute: '2-digit',
        meridiem: false
      }}
    />
  )
}
