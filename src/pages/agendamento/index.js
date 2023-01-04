/* eslint-disable no-use-before-define */
/* eslint-disable indent */
import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import * as Icon from 'react-icons/fa'
import Menu from '../../components/Menu'
import { api, ws } from '../../services/api'
import { debounceEvent, getCookie, returnPage } from '../../utils'
import dynamic from 'next/dynamic'
import {
  useAgendamentoStore,
  useAgendarStore,
  usePayloadStore,
  useMenuStore,
  useAtestadoStore,
  useReceitaStore,
  createLogger,
  useDeclaracaoStore,
  useProntuarioStore
} from '../../hooks/store'
import { useFetch } from '../../hooks/useFetch'
import Modal from '../../components/Modal'
import Relatorios from '../relatorios'
import { addDays, format, parseISO } from 'date-fns'
import swal from '@sweetalert/with-react'
import * as htmlToImage from 'html-to-image'

const FullCalendar = dynamic(() => import('../../components/FullCalendar'), {
  ssr: false
})

const Select = dynamic(() => import('react-select'), {
  ssr: false
})

export default function Agendamento(props) {
  const logger = createLogger()
  const [buscar, setBuscar] = useState(false)
  const [open, setOpen] = useState(false)
  const [calendarApi, setCalendarApi] = useState()
  const { fetch, remove } = useFetch()
  const { setStateLoading } = useMenuStore(state => state)
  const { setModelosAtestado } = useAtestadoStore(state => state)
  const { setModelosReceita } = useReceitaStore(state => state)
  const { setModelosProntuarios } = useProntuarioStore(state => state)
  const { setModelosDeclaracoes } = useDeclaracaoStore(state => state)
  const {
    agendamentos,
    setAgendamentos,
    setConfiguracoes,
    setScreen,
    setAgendamento,
    setShowAgendamento,
    configuracoes
  } = useAgendamentoStore(state => state)
  const {
    medicos,
    medico,
    showAgendar,
    procedimento,
    setShowAgendar,
    setMedicos,
    setProcedimentos,
    setConvenios,
    setBloqueio,
    setMedico,
    setPaciente,
    setInicio,
    setFim
  } = useAgendarStore(state => state)

  const { payload } = usePayloadStore(state => state)

  useEffect(() => {
    handleFetch()
    setAgendamentos(props.agendamentos)
    setMedicos(props.medicos)
    setProcedimentos(props.procedimentos)
    setConvenios(props.convenios)
    setConfiguracoes(props.configuracoes)
  }, [
    props.agendamentos,
    props.medicos,
    props.procedimentos,
    props.convenios,
    props.configuracoes
  ])

  useEffect(() => {
    if (!showAgendar) {
      setPaciente()
      setTimeout(() => {
        getByController()
      }, 1000)
      console.error(showAgendar)
    }
  }, [showAgendar])

  useEffect(() => {
    if (calendarApi) {
      handleLoadByControllers()
    }
  }, [calendarApi])

  useEffect(() => {
    ws.on('create agendamento', () => handleFetch())
    ws.on('update agendamento', () => handleFetch())
    ws.on('remove agendamento', () => handleFetch())
    return () => {
      ws.off('create agendamento')
      ws.off('update agendamento')
      ws.off('remove agendamento')
    }
  }, [])
  async function handleFetch() {
    await getByController()

    const [modelosReceitas, errorModelosReceitas] = await fetch(
      '/modelos?tipo=Receita'
    )
    const [modelosAtestados, errorModelosAtestados] = await fetch(
      '/modelos?tipo=Atestado'
    )
    const [modelosDeclaracoes, errorModelosDeclaracoes] = await fetch(
      '/modelos?tipo=Declaracao'
    )
    const [modelosProntuario, errorModelosProntuario] = await fetch(
      '/modelos?tipo=Prontuario'
    )
    if (
      errorModelosReceitas ||
      errorModelosAtestados ||
      errorModelosDeclaracoes ||
      errorModelosProntuario
    ) {
      swal('Erro', 'Erro ao carregar dados', 'error', {
        button: false,
        timer: 3000
      })
      logger.error('Erro ao carregar dados', {
        module: 'Agendamento - handleFetch'
      })
      return
    }
    setModelosReceita(modelosReceitas)
    setModelosAtestado(modelosAtestados)
    setModelosDeclaracoes(modelosDeclaracoes)
    setModelosProntuarios(modelosProntuario)
  }

  async function handleLoadAgendamento(_id) {
    setStateLoading(true)
    const [data, error] = await fetch(`/agendamentos/${_id}`)
    if (error) return
    if (data.bloqueio) {
      if (!payload.grupo?.bloqueiaHorario && !payload.developer) {
        return setStateLoading(false)
      }
      return swal({
        title: 'Espera ai!',
        text: 'Deseja realmente excluir o registro ?',
        icon: 'warning',
        buttons: {
          sim: {
            text: 'Sim',
            value: true
          },
          cancel: 'Não'
        }
      }).then(response => {
        if (!response) return setStateLoading(false)
        handleDeleteAgendamento(_id)
      })
    }
    setScreen('Agendamento')
    setAgendamento(data)
    setShowAgendamento(true)

    setStateLoading(false)
  }

  async function handleDeleteAgendamento(id) {
    const [data] = await remove(`/agendamentos/${id}`)
    if (!data) return setStateLoading(false)
    setAgendamentos(agendamentos.filter(agendamento => agendamento._id !== id))
    swal('Sucesso!', 'Agendamento removido com sucesso', 'success', {
      timer: 3000,
      buttons: false
    })
    setShowAgendamento(false)
    setStateLoading(false)
  }

  const getRange = async () => {
    const { start, end } = calendarApi.state.dateProfile.renderRange

    await handleLoadDate(addDays(start, 1), end)
  }

  const getDay = async () => {
    await handleLoadDate(calendarApi.state.dateProfile.currentRange.end)
  }

  const getByController = async () => {
    switch (calendarApi?.state.viewType) {
      case 'timeGridDay': {
        await getDay()
        break
      }
      case 'timeGridWeek': {
        await getRange()
        break
      }
      case 'dayGridMonth': {
        await getRange()
        break
      }
    }
  }

  async function handleLoadByControllers() {
    const prevButton = document.querySelector('.fc-prev-button')
    const nextButton = document.querySelector('.fc-next-button')
    const todayButton = document.querySelector('.fc-today-button')
    const timeGridDayButton = document.querySelector('.fc-timeGridDay-button')
    const timeGridWeekButton = document.querySelector('.fc-timeGridWeek-button')
    const dayGridMonthButton = document.querySelector('.fc-dayGridMonth-button')

    const DELAY = 50

    if (
      [
        prevButton,
        nextButton,
        todayButton,
        timeGridDayButton,
        timeGridWeekButton,
        dayGridMonthButton
      ].some(el => !el)
    ) {
      return
    }

    prevButton.onclick = debounceEvent(getByController, DELAY)
    nextButton.onclick = debounceEvent(getByController, DELAY)
    timeGridDayButton.onclick = debounceEvent(() => {
      handleLoadDate(calendarApi.getDate())
    }, DELAY)
    timeGridWeekButton.onclick = debounceEvent(getRange, DELAY)
    dayGridMonthButton.onclick = debounceEvent(getRange, DELAY)
    todayButton.onclick = debounceEvent(() => {
      switch (calendarApi?.state.viewType) {
        case 'timeGridDay': {
          handleLoadDate(new Date())
          break
        }
        case 'timeGridWeek': {
          getRange()
          break
        }
        case 'dayGridMonth': {
          getRange()
          break
        }
      }
    }, DELAY)
  }

  async function handleLoadDate(start, end) {
    setStateLoading(true)
    if (!end) {
      try {
        const response = await api.get(
          payload?.linked?._id
            ? `/agendamentos?linked=${payload?.linked?._id}&day=${format(
                start,
                'yyyy-MM-dd'
              )}`
            : `/agendamentos?day=${format(start, 'yyyy-MM-dd')}`
        )
        setAgendamentos(response.data)
        setStateLoading(false)
      } catch (err) {
        console.log(err)
      }
      setStateLoading(false)
      return
    }
    try {
      const response = await api.get(
        payload?.linked?._id
          ? `/agendamentos?linked=${payload?.linked?._id}&day=${format(
              start,
              'yyyy-MM-dd'
            )}&end=${format(end, 'yyyy-MM-dd')}`
          : `/agendamentos?day=${format(start, 'yyyy-MM-dd')}&end=${format(
              end,
              'yyyy-MM-dd'
            )}`
      )
      setAgendamentos(response.data)
    } catch (err) {
      console.log(err)
    }
    setStateLoading(false)
  }

  async function print() {
    const agenda = document.querySelector(
      `.fc-${calendarApi.state.viewType}-view`
    )

    htmlToImage.toPng(agenda, { quality: 0 }).then(function (dataUrl) {
      setStateLoading(true)
      // eslint-disable-next-line new-cap
      const folha = document.getElementById('printSessionCloud').contentWindow
      folha.document.open()
      folha.document.write(`
        <img src="${dataUrl}" style="width: 100%" />
      `)
      setTimeout(() => {
        setStateLoading(false)
        folha.window.print()
      }, 500)
    })
  }

  return (
    <Menu withBreadcumbs={false} title="Agendamento">
      <div className="flex justify-between !z-50 xl:justify-end px-5 xl:px-10 pt-8 gap-2 mb-10 items-center w-full">
        <Select
          isClearable
          cacheOptions
          placeholder="Selecione a agenda"
          className={`${payload?.linked?._id && 'hidden'} w-full z-50 `}
          options={medicos?.map(medico => ({
            ...medico,
            value: medico._id,
            label: (
              <div className="flex items-center justify-start gap-4">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: medico.cor }}
                />{' '}
                {medico.nome}
              </div>
            )
          }))}
          value={medico}
          filterOption={() => true}
          onInputChange={medicoSelected => {
            if (!medicoSelected) {
              return setMedicos(props.medicos)
            }
            setMedicos(
              props.medicos.filter(medico =>
                medico.nome.match(new RegExp(medicoSelected, 'gim'))
              )
            )
          }}
          styles={{
            control: (styles, props) => {
              return {
                ...styles,
                borderColor: '#00A8B3'
              }
            }
          }}
          noOptionsMessage={() => 'Nenhum médico encontrado'}
          loadingMessage={() => 'Procurando...'}
          onChange={medico => {
            setMedico(medico)
          }}
        />
        <div className="flex justify-between xl:justify-end gap-2 items-center w-full">
          {open ? (
            <Icon.FaChevronUp
              onClick={() => setOpen(false)}
              className="text-primary xl:hidden"
            />
          ) : (
            <Icon.FaChevronDown
              onClick={() => setOpen(true)}
              className="text-primary xl:hidden"
            />
          )}
          <button
            onClick={() => setBuscar(true)}
            className="bg-primary text-white hover:opacity-80 rounded font-semibold p-3 gap-3 flex justify-center items-center text-sm"
          >
            <Icon.FaSearch size={18} />
          </button>
          {!payload.linked?._id && (
            <button
              onClick={() => {
                setBloqueio(false)
                setShowAgendar(true)
              }}
              className={`bg-primary shadow-lg hover:opacity-80 rounded text-white font-semibold p-3 gap-3 flex justify-center items-center text-sm ${
                payload.linked?._id && 'hidden'
              }`}
            >
              <Icon.FaPlus size={18} /> Agendar
            </button>
          )}
          <button
            onClick={() => {
              setBloqueio(true)
              setShowAgendar(true)
            }}
            className={`bg-[#bd5872] shadow-lg hover:opacity-80 rounded text-white font-semibold p-3 gap-3 flex justify-center items-center text-sm ${
              !payload.grupo?.bloqueiaHorario && !payload.developer
                ? 'hidden'
                : ''
            }`}
          >
            <Icon.FaCalendarAlt size={18} /> Bloquear
          </button>

          <div className="xl:flex grid gap-2">
            <button
              onClick={() => print()}
              className="text-sm flex justify-center hover:opacity-80 items-center gap-2 font-normal bg-[#eb9266] shadow-lg text-white xl:p-3 p-3 rounded-md"
            >
              <Icon.FaPrint size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex  flex-col justify-center w-full gap-4 px-5 xl:px-10">
        <div className="w-full pb-20">
          <FullCalendar
            businessHours={{
              daysOfWeek: medico?.diasDaSemana.reduce(
                (acc, dia) => [...acc, dia + 1],
                []
              ),
              startTime: configuracoes.inicio,
              endTime: configuracoes.fim
            }}
            selectConstraint="businessHours"
            selectable
            dateClick={props => {
              setBloqueio(false)
              setInicio(parseISO(props.dateStr))
              if (props.allDay) {
                const encaixe = document.querySelector('[name="encaixe"]')
                encaixe.checked = true
              }
              setShowAgendar(true)
            }}
            selectMinDistance={1}
            select={props => {
              setBloqueio(true)
              setInicio(parseISO(props.startStr))
              setFim(parseISO(props.endStr))
              setShowAgendar(true)
            }}
            dayRender={handleLoadByControllers}
            setApi={setCalendarApi}
            eventClick={({ event }) => {
              handleLoadAgendamento(event.id)
            }}
            events={agendamentos
              ?.filter(agendamento =>
                medico?.value ? agendamento.medico?._id === medico?.value : true
              )
              ?.filter(agendamento =>
                procedimento?.value
                  ? agendamento.procedimento?._id === procedimento?.value
                  : true
              )
              ?.map(agendamento => {
                return {
                  id: agendamento._id,
                  title: agendamento.bloqueio
                    ? [
                        'BLOQUEIO',
                        agendamento.medico.nome,
                        agendamento.observacao
                      ]
                        .filter(data => data)
                        .join(' - ')
                        .toUpperCase()
                    : agendamento.encaixe
                    ? [
                        format(parseISO(agendamento.inicio), 'HH:mm'),
                        agendamento.medico.nome,
                        agendamento.paciente.nome
                      ]
                        .filter(data => data)
                        .join(' - ')
                        .toUpperCase()
                    : [
                        agendamento.paciente?.nome,
                        agendamento.procedimento?.descricaoProcedimento,
                        agendamento.observacao
                      ]
                        .filter(data => data)
                        .join(' - ')
                        .toUpperCase(),
                  start: agendamento.inicio,
                  end: agendamento.fim,
                  backgroundColor: agendamento.bloqueio
                    ? '#efefef'
                    : agendamento.medico?.cor,
                  borderColor: agendamento.medico?.cor,
                  textColor: agendamento.bloqueio
                    ? agendamento.medico?.cor
                    : '#fff',
                  allDay: agendamento.encaixe
                }
              })}
            eventRender={props => {
              const agendamento = agendamentos.find(
                agendamento => agendamento?._id === props.event.id
              )
              const iconStatus =
                agendamento?.status === 'Confirmado'
                  ? 'FaCheck'
                  : agendamento?.status === 'Chegou'
                  ? 'FaUserCheck'
                  : agendamento?.status === 'Cancelado'
                  ? 'FaTimesCircle'
                  : agendamento?.status === 'Realizado'
                  ? 'FaCheckDouble'
                  : 'FaExclamationCircle'

              if (agendamento?.bloqueio) {
                ReactDOM.render(
                  <div>
                    <div className="text-sm text-black">
                      {format(parseISO(agendamento.inicio), 'HH:mm')}{' '}
                      {format(parseISO(agendamento.fim), 'HH:mm')}
                    </div>
                    <div className="flex items-center justify-start gap-2">
                      <div
                        className="w-4 h-4 rounded border bg-transparent"
                        style={{ backgroundColor: agendamento?.medico?.cor }}
                      />
                      <div className="text-sm text-black">
                        {agendamento?.medico?.nome} - Motivo:{' '}
                        {agendamento?.observacao || 'Não informado'}
                      </div>
                    </div>
                  </div>,

                  props.el.querySelector('.fc-content')
                )
                return props.el
              }

              ReactDOM.render(
                <div
                  className={`flex has-tooltip cursor-pointer items-center text-xs justify-start gap-2 px-2 ${
                    agendamento?.status === 'Cancelado' && 'line-through'
                  }`}
                >
                  <div className="tooltip -mt-20">
                    <span className="rounded shadow-lg p-5 flex justify-center items-center gap-4 bg-black bg-opacity-70 text-white ">
                      {Icon[iconStatus]({ size: 16 })}
                      {agendamento?.status}
                      <br />
                      {agendamento?.observacao}
                    </span>
                  </div>
                  <div>
                    {Icon[iconStatus]({
                      size: 16,
                      className:
                        (agendamento.status === 'Chegou' && 'animate-ping') ||
                        (agendamento.status === 'Realizado' && 'text-green-400')
                    })}
                  </div>
                  <span>
                    {agendamento.status === 'Realizado' ? 'REALIZADO-' : ''}
                    {format(parseISO(agendamento.inicio), 'HH:mm')} -{' '}
                    {props.event.title}
                  </span>
                </div>,
                props.el.querySelector('.fc-content')
              )
              return props.el
            }}
          />
        </div>
      </div>
      <Modal
        classNameModal="!z-50"
        className="z-50"
        closeWithEsc
        open={buscar}
        setOpen={setBuscar}
      >
        <div className="bg-slate-100 grid h-screen scrollbar max-h-[800px] overflow-auto w-full max-w-[1300px] gap-4 p-5 !z-50 rounded-md">
          <div className="flex mb-2 justify-end items-center pr-2">
            <Icon.FaTimes
              size={20}
              className="cursor-pointer text-gray-400"
              onClick={() => setBuscar(false)}
            />
          </div>
          <Relatorios modal {...props} />
        </div>
      </Modal>
    </Menu>
  )
}

export async function getServerSideProps(ctx) {
  const payload = getCookie(ctx, 'payload')
  if (!payload) {
    return returnPage(ctx)
  }
  try {
    const { data: agendamentos } = await api.get(
      payload?.linked?._id
        ? `/agendamentos?linked=${payload?.linked?._id}&day=${format(
            new Date(),
            'yyyy-MM-dd'
          )}`
        : `/agendamentos?day=${format(new Date(), 'yyyy-MM-dd')}`
    )
    const { data: medicos } = await api.get('/medicos')
    const { data: procedimentos } = await api.get('/procedimentos')
    const { data: configuracoes } = await api.get('/configuracoes')
    const { data: convenios } = await api.get('/convenios')

    return {
      props: {
        medicos,
        convenios,
        agendamentos,
        procedimentos,
        configuracoes
      }
    }
  } catch (err) {
    console.log(err)
    return {
      props: {
        data: []
      }
    }
  }
}
