import { getFieldsValue } from '@doxa-code/utils'
import {
  addMinutes,
  format,
  isAfter,
  isBefore,
  parseISO,
  setDate,
  setMonth,
  setYear
} from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import {
  useAgendamentoStore,
  useAgendarStore,
  useMenuStore,
  usePayloadStore
} from '../../../../hooks/store'
import { useFetch } from '../../../../hooks/useFetch'
import DatePicker from 'react-datepicker'
import { api } from '../../../../services/api'
import * as Icon from 'react-icons/fa'
import Select from 'react-select'
import swal from '@sweetalert/with-react'

export default function FormBloqueio() {
  const { create } = useFetch()
  const {
    inicio,
    fim,
    bloqueio,
    setInicio,
    setFim,
    setBloqueio,
    setShowAgendar,
    medico,
    medicos
  } = useAgendarStore()
  const { configuracoes } = useAgendamentoStore()
  const { payload } = usePayloadStore()
  const [diasOcupados, setDiasOcupados] = useState([])
  const [registros, setRegistros] = useState([])
  const [horariosOcupados, setHorariosOcupados] = useState([])
  const [medicosList, setMedicosList] = useState([])
  const medicoSelectRef = useRef(null)
  const { setStateLoading } = useMenuStore()
  const [medicoBloqueio, setMedicoBloqueio] = useState()
  
  useEffect(() => {
    setMedicosList(handleMapMedicos(medicos))
  }, [medicos])
  
  useEffect(() => {
    if (medico?._id) {
      setMedicoBloqueio(medico)
    }
  }, [medico])

  const handleMapMedicos = data =>
    data?.map(item => ({
      label: (
        <div className="flex items-center justify-start gap-4">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: item.cor }}
          />{' '}
          {item.nome}
        </div>
      ),
      value: item?._id,
      diasDaSemana: item?.diasDaSemana || []
    }))

  async function getHorarioOcupados(query) {
    try {
      const response = await api.post('/agendamentos/search', query)
      return response.data.reduce((acc, agendamento) => {
        const dates = [agendamento.inicio]
        while (!dates.includes(agendamento.fim)) {
          const newDate = format(
            addMinutes(parseISO(dates[dates.length - 1]), 1),
            'yyyy-MM-dd HH:mm:ss'
          )
          dates.push(newDate)
        }
        dates.pop()

        return [...acc, ...dates]
      }, [])
    } catch (err) {
      console.log(err.message)
      return []
    }
  }

  async function handleSubmit() {
    setStateLoading(true)
    setShowAgendar(false)
    try {
      // eslint-disable-next-line no-unused-vars
      const errors = await Promise.all(
        registros.map(async registro => {
          const [_, error] = await create('/agendamentos', registro)
          return error
        })
      )
      if (errors.some(err => err)) {
        throw new Error('Erro ao processar o cadastro!')
      }
      swal('Bloqueio realizado com sucesso!', ' ', 'success', {
        buttons: false,
        timer: 2000
      })
      setBloqueio(false)
      setInicio('')
      setFim('')
      setStateLoading(false)
    } catch (err) {
      setStateLoading(false)
      swal('Ops', ` ${err.response?.data || err.message} `, 'error')
    }
  }

  function addRegistro(e) {
    e.preventDefault()
    const fields = getFieldsValue(e)
    if ([inicio, fim, fields.medico].some(value => !value)) return

    setRegistros([
      ...registros,
      {
        id: registros.length + 1,
        ...fields,
        bloqueio,
        inicio: format(inicio, 'yyyy-MM-dd HH:mm:ss'),
        fim: format(fim, 'yyyy-MM-dd HH:mm:ss'),
        responsavel: payload.nome
      }
    ])

    setInicio('')
    setFim('')

    e.target.reset()
  }

  return (
    <div>
      <form className="grid gap-4" onSubmit={addRegistro}>
        <div className="flex flex-col gap-2">
          <label className="text-gray-500">Médico</label>
          <Select
            ref={medicoSelectRef}
            isClearable
            name="medico"
            cacheOptions
            placeholder="Nenhum médico selecionado!"
            options={medicosList}
            noOptionsMessage={() => 'Nenhum médico encontrado'}
            loadingMessage={() => 'Procurando...'}
            defaultValue={medico}
            filterOption={() => true}
            onInputChange={medicoSelected => {
              if (!medicoSelected) {
                return setMedicosList(handleMapMedicos(medicos))
              }
              setMedicosList(
                handleMapMedicos(
                  medicos.filter(medico =>
                    medico.nome.match(new RegExp(medicoSelected, 'gim'))
                  )
                )
              )
            }}
            onChange={async medico => {
              if (!medico) {
                setInicio('')
                setFim('')
                return
              }
              setMedicoBloqueio(medico)
              setDiasOcupados(medico?.diasDaSemana)
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-gray-500">Observação</label>
          <textarea
            className="border rounded-md border-gray-300 outline-none p-2"
            name="observacao"
          />
        </div>
        <div className="flex flex-col xl:flex-row justify-center items-center gap-4">
          <div className="flex flex-col w-full gap-2">
            <label className="text-gray-500">Inicio</label>
            <DatePicker
              autoComplete="off"
              className="border rounded-md w-full border-gray-300 outline-none p-2"
              showTimeSelect
              showDisabledMonthNavigation
              timeCaption="Horário"
              timeIntervals={medicoBloqueio?.bloco || configuracoes.bloco || 1}
              name="inicio"
              placeholderText="dd/mm/aaaa hh:mm"
              dateFormat="dd'/'MM'/'yyyy' às 'HH:mm "
              timeFormat="HH:mm"
              locale="pt-BR"
              onChange={async value => {
                setInicio(value)
              }}
              selected={inicio}
              filterDate={date =>
                diasOcupados?.includes(parseInt(format(date, 'i')) - 1)
              }
              filterTime={time =>
                inicio &&
                !horariosOcupados.includes(format(time, 'yyyy-MM-dd HH:mm:ss'))
              }
              minDate={new Date()}
              timeClassName={e => {
                const minTime = parseISO(
                  `2022-01-01 ${configuracoes?.inicio || '08:00'}`
                )
                const maxTime = parseISO(
                  `2022-01-01 ${configuracoes?.fim || '19:00'}`
                )
                const time = setYear(setMonth(setDate(e, 1), 0), 2022)
                const date = format(e, 'yyyy-MM-dd HH:mm:ss')
                if (horariosOcupados.includes(date)) return 'bg-red-500'
                if (isBefore(time, minTime) || isAfter(time, maxTime))
                  return 'hidden'
                return ''
              }}
              minTime={parseISO(
                `2022-01-01 ${configuracoes?.inicio || '08:00'}`
              )}
              maxTime={parseISO(`2022-01-01 ${configuracoes?.fim || '19:00'}`)}
            />
          </div>
          <div className="flex flex-col w-full gap-2">
            <label className="text-gray-500">Fim</label>
            <DatePicker
              autoComplete="off"
              className="border rounded-md w-full border-gray-300 outline-none p-2"
              showTimeSelect
              showDisabledMonthNavigation
              timeCaption="Horário"
              timeIntervals={medicoBloqueio?.bloco || configuracoes.bloco || 1}
              name="fim"
              placeholderText="dd/mm/aaaa hh:mm"
              dateFormat="dd'/'MM'/'yyyy' às 'HH:mm "
              timeFormat="HH:mm"
              locale="pt-BR"
              onChange={async value => {
                setFim(value)
                const data = format(value, 'yyyy-MM-dd')
                const horariosOcupados = await getHorarioOcupados({
                  medico: medico?.value,
                  inicio: {
                    $gte: `${data} 00:00:00`,
                    $lte: `${data} 23:59:59`
                  }
                })
                setHorariosOcupados(horariosOcupados)
              }}
              selected={fim}
              filterDate={date =>
                diasOcupados?.includes(parseInt(format(date, 'i')) - 1)
              }
              filterTime={time =>
                fim &&
                !horariosOcupados.includes(format(time, 'yyyy-MM-dd HH:mm:ss'))
              }
              minDate={inicio}
              timeClassName={e => {
                const minTime = parseISO(
                  `2022-01-01 ${configuracoes?.inicio || '08:00'}`
                )
                const maxTime = parseISO(
                  `2022-01-01 ${configuracoes?.fim || '19:00'}`
                )
                const time = setYear(setMonth(setDate(e, 1), 0), 2022)
                const date = format(e, 'yyyy-MM-dd HH:mm:ss')
                if (horariosOcupados.includes(date)) return 'bg-red-500'
                if (isBefore(time, minTime) || isAfter(time, maxTime))
                  return 'hidden'
                return ''
              }}
              minTime={
                inicio ||
                parseISO(`2022-01-01 ${configuracoes?.inicio || '08:00'}`)
              }
              maxTime={parseISO(`2022-01-01 ${configuracoes?.fim || '19:00'}`)}
            />
          </div>
        </div>
        <div className="flex justify-end items-center">
          <button className="flex gap-4 justify-center text-sm items-center bg-primary p-3 text-white rounded-md">
            <Icon.FaSave size={18} />
            Adicionar Bloqueio
          </button>
        </div>
      </form>
      <table
        className={`w-full mt-5 border-separate ${
          registros.length <= 0 && 'hidden'
        }`}
      >
        <thead>
          <tr className="w-full bg-zinc-200 text-zinc-600">
            <td className="p-1 text-center"></td>
            <td className="p-1 text-center">Médico</td>
            <td className="p-1 text-center">Observação</td>
            <td className="p-1 text-center">Inicio</td>
            <td className="p-1 text-center">Fim</td>
            <td className="p-1 text-center">Ação</td>
          </tr>
        </thead>
        <tbody>
          {registros.length > 0 ? (
            registros.map(registro => {
              const medico = medicos.find(
                medico => medico._id === registro.medico
              )
              return (
                <tr className="bg-zinc-50">
                  <td className="p-1 text-center">{registro.id}</td>
                  <td className="p-1 text-center">{medico.nome}</td>
                  <td className="p-1 text-center">
                    <p className="w-80 truncate">{registro.observacao}</p>
                  </td>
                  <td className="p-1 text-center">
                    {format(parseISO(registro.inicio), "dd/MM/yyyy 'às' HH:mm")}
                  </td>
                  <td className="p-1 text-center">
                    {format(parseISO(registro.fim), "dd/MM/yyyy 'às' HH:mm")}
                  </td>
                  <td className="p-1 text-center">
                    <button
                      onClick={() => {
                        setRegistros(
                          registros.filter(reg => reg.id !== registro.id)
                        )
                      }}
                      className="bg-red-400 text-white p-2 rounded-full"
                    >
                      <Icon.FaTrash size={15} />
                    </button>
                  </td>
                </tr>
              )
            })
          ) : (
            <tr className="bg-zinc-50">
              <td className="text-center text-zinc-400 text-sm p-2" colSpan={6}>
                Não há registros
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="pt-4 flex justify-end items-center">
        <button
          onClick={handleSubmit}
          className={`flex gap-4 justify-center text-sm items-center bg-green-500 p-3 text-white rounded-md ${
            registros.length <= 0 && 'hidden'
          }`}
        >
          <Icon.FaSave size={18} />
          Salvar Bloqueios
        </button>
      </div>
    </div>
  )
}
