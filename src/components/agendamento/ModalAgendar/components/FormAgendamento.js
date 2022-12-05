/* eslint-disable indent */
/* eslint-disable react/display-name */
import { formatMoney, getFieldsValue, setFieldsValue } from '@doxa-code/utils'
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
import { ToggleButtonController } from '../../../Form'
import { useFetch } from '../../../../hooks/useFetch'
import DatePicker from 'react-datepicker'
import { api } from '../../../../services/api'
import * as Icon from 'react-icons/fa'
import Select, { components } from 'react-select'
import SelectSearch from '../../../SelectSearch'
import swal from '@sweetalert/with-react'
import { debounceEvent, formatPacienteSearch } from '../../../../utils'

export default function FormBloqueio() {
  const {
    inicio,
    bloqueio,
    medicos,
    medico: medicoSelectedAgenda,
    pacientes,
    convenios,
    paciente,
    agendamentoEdit,
    setInicio,
    setShowAgendar,
    setShowModalCadastroPaciente,
    setPaciente,
    showModalCadastroPaciente
  } = useAgendarStore()

  const { setStateLoading } = useMenuStore()
  const { configuracoes } = useAgendamentoStore()
  const { payload } = usePayloadStore()
  const { fetch, update, create } = useFetch()
  const [diasOcupados, setDiasOcupados] = useState([])
  const [horariosOcupados, setHorariosOcupados] = useState([])
  const [pacientesList, setPacientesList] = useState([])
  const [medicosList, setMedicosList] = useState([])
  const [pacienteName, setPacienteName] = useState('')
  const [conveniosList, setConveniosList] = useState([])
  const [convenio, setConvenio] = useState({})
  const [procedimentosSelected, setProcedimentosSelected] = useState([])
  const [procedimentosList, setProcedimentosList] = useState([])
  const [agendamentoId, setAgendamentoId] = useState()
  const [medico, setMedico] = useState()
  const [fieldsError, setFieldsError] = useState([])

  const formAgendamento = useRef(null)
  const formProcedimentos = useRef(null)
  const medicoSelectRef = useRef(null)
  const convenioSelectRef = useRef(null)
  const procedimentoSelectRef = useRef(null)
  const caraterAtendimentoSelectRef = useRef(null)
  const caraterAtendimento = [
    { label: 'Eletivo', value: 1 },
    { label: 'Urgência/Emergência', value: 2 }
  ]

  useEffect(() => {
    if (Object.values(agendamentoEdit).length <= 0) return

    setProcedimentosSelected([
      {
        _id: agendamentoEdit._id,
        convenio: agendamentoEdit.convenio?._id,
        fim: agendamentoEdit.fim,
        inicio: agendamentoEdit.inicio,
        medico: agendamentoEdit.medico?._id,
        procedimento: agendamentoEdit.procedimento?._id,
        responsavel: agendamentoEdit.responsavel,
        valor: agendamentoEdit.valor,
        caraterAtendimento: agendamentoEdit.caraterAtendimento,
        encaixe: agendamentoEdit.encaixe,
        observacao: agendamentoEdit.observacao || ''
      }
    ])
    setMedico(agendamentoEdit.medico)
  }, [agendamentoEdit])

  useEffect(() => {
    if (medicoSelectedAgenda?._id) {
      setDiasOcupados(medicoSelectedAgenda?.diasDaSemana)
      setInicio()
      setMedico(medicoSelectedAgenda)
      const inputTime = document.querySelector("input[name='time']")
      inputTime.value = medicoSelectedAgenda?.bloco || configuracoes?.bloco
    }
  }, [medicoSelectedAgenda])

  useEffect(() => {
    setPacientesList(
      pacientes?.map(item => ({
        label: formatPacienteSearch(item.paciente),
        value: item._id
      }))
    )
    setConveniosList(
      convenios?.map(item => ({
        label: item.nome,
        value: item._id,
        carteirinha: item.carteirinha,
        geraRecibo: item.geraRecibo
      }))
    )
    setMedicosList(handleMapMedicos(medicos))
  }, [pacientes, convenios, medicos])

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
      diasDaSemana: item?.diasDaSemana || [],
      bloco: item?.bloco
    }))

  async function handleSubmit() {
    setStateLoading(true)
    try {
      const fields = getFieldsValue({ target: formAgendamento.current }, false)

      if (!fields.paciente && !bloqueio) {
        setStateLoading(false)
        return swal('Erro', 'Selecione um paciente', 'warning')
      }

      if (procedimentosSelected.length <= 0 && !bloqueio) {
        setStateLoading(false)
        return swal('Erro', 'Selecione ao menos um procedimento', 'warning')
      }

      procedimentosSelected.map(async procedimento => {
        const convenio = convenios.find(
          item => item._id === procedimento.convenio
        )
        const procedimentoSelected = convenio.procedimentos.find(
          item => item._id?._id === procedimento.procedimento
        )

        if (agendamentoId) {
          return await update(`/agendamentos/${agendamentoId}`, {
            ...fields,
            ...procedimento,
            procedimentoHonorario: procedimentoSelected.valorHonorario,
            procedimentoFilme: procedimentoSelected.valorFilme
          })
        }
        delete procedimento._id
        await create('/agendamentos', {
          ...fields,
          ...procedimento,
          procedimentoHonorario: procedimentoSelected.valorHonorario,
          procedimentoFilme: procedimentoSelected.valorFilme
        })
      })

      setProcedimentosSelected([])

      swal('Agendamento realizado com sucesso!', ' ', 'success', {
        buttons: false,
        timer: 2000
      })
      setShowAgendar(false)
      setStateLoading(false)
      setPaciente({})
    } catch (err) {
      swal('Ops', ` ${err.response?.data || err.message} `, 'error')
      setStateLoading(true)
    }
  }

  async function handleSearchPaciente(value) {
    setPacienteName(value)
    if (value === '') {
      return
    }
    const response = await api.get(
      `/pacientes/search?q=${value.toLowerCase()}&noCount=true`
    )
    setPacientesList(
      response.data.pacientes.map(paciente => ({
        label: formatPacienteSearch(paciente),
        value: paciente._id
      }))
    )
  }

  async function handleOpenEditPaciente(id) {
    const [paciente, error] = await fetch(`/pacientes/${id}`)
    if (error) return
    setPaciente(paciente)
    setShowModalCadastroPaciente(true)
  }

  async function handleAddProcedimento() {
    try {
      const body = getFieldsValue({
        target: formProcedimentos.current
      })
      if (agendamentoId) {
        body._id = agendamentoId
      }
      body.encaixe = Boolean(body.encaixe)
      const requiredFields = [
        'convenio',
        'procedimento',
        'medico',
        'valor',
        'inicio',
        'caraterAtendimento'
      ]

      if (convenio.carteirinha) {
        requiredFields.push('numeroCarteira')
        requiredFields.push('validadeCarteira')
      }

      const missingFields = requiredFields.filter(field => !body[field])

      if (missingFields.length > 0) {
        setFieldsError(missingFields)
        throw new Error('Preencha todos os campos')
      }

      const { inicio, time, caraterAtendimento, ...fields } = body
      const horario = inicio.trim().split(' às ')
      const data = horario[0].split('/').reverse().join('-')

      setProcedimentosSelected(procedimentosSelected => [
        ...procedimentosSelected.filter(item =>
          body._id ? item._id !== body._id : true
        ),
        {
          ...fields,
          inicio: `${data} ${horario[1]}:00`,
          fim: `${data} ${format(
            addMinutes(parseISO(`${data} ${horario[1]}:00`), time),
            'HH:mm'
          )}:00`,
          responsavel: payload.nome,
          caraterAtendimento: parseInt(caraterAtendimento)
        }
      ])
      formProcedimentos.current.reset()

      procedimentoSelectRef.current.clearValue()
      formProcedimentos.current.querySelector('[name="numeroCarteira"]').value =
        fields.numeroCarteira
      
      formProcedimentos.current.querySelector('[name="observacao"]').value =
        fields.observacao

      formProcedimentos.current.querySelector(
        '[name="validadeCarteira"]'
      ).value = fields.validadeCarteira

      setFieldsError([])
      procedimentoSelectRef.current.focus()
    } catch (err) {
      swal('Ops', ` ${err.response?.data || err.message} `, 'error')
    }
  }

  async function getHorarioOcupados(query) {
    try {
      const response = await api.post('/agendamentos/search', query)
      return [...response.data].reduce((acc, agendamento) => {
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

  return (
    <form
      onSubmit={e => e.preventDefault()}
      ref={formAgendamento}
      className="grid gap-4 text-sm z-50"
    >
      <div className="flex flex-col gap-2">
        <label className="text-gray-500">Paciente</label>
        <SelectSearch
          name="paciente"
          placeholder="Nenhum paciente selecionado!"
          data={pacientesList}
          components={{
            DropdownIndicator: props => (
              <components.DropdownIndicator {...props}>
                <Icon.FaPlus
                  size={16}
                  className="cursor-pointer"
                  onClick={() => {
                    setShowModalCadastroPaciente(true)
                    setPaciente({
                      nome: pacienteName
                    })
                  }}
                />
              </components.DropdownIndicator>
            ),
            ClearIndicator: props => (
              <components.ClearIndicator {...props} innerProps={null}>
                <Icon.FaEdit
                  size={16}
                  className="cursor-pointer"
                  onClick={() => {
                    if (!props.getValue()?.[0].value) {
                      return console.log(props.getValue()?.[0])
                    }
                    handleOpenEditPaciente(props.getValue()?.[0].value)
                  }}
                />
              </components.ClearIndicator>
            )
          }}
          loadOptions={(_, callback) => {
            setTimeout(() => {
              callback(pacientesList)
            }, 600)
          }}
          onInputChange={debounceEvent(handleSearchPaciente, 300)}
          defaultValue={
            paciente?._id
              ? [
                  {
                    label: formatPacienteSearch(paciente),
                    value: paciente?._id
                  }
                ]
              : agendamentoEdit.paciente?._id
              ? [
                  {
                    label: formatPacienteSearch(agendamentoEdit.paciente),
                    value: agendamentoEdit.paciente._id
                  }
                ]
              : []
          }
          valueRefresh={showModalCadastroPaciente}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              convenioSelectRef.current.focus()
            }
          }}
        />
      </div>
      <div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <form
            className="xl:col-span-2 flex flex-col xl:grid xl:grid-cols-1 gap-3"
            ref={formProcedimentos}
          >
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-gray-500">Médico</label>
                <Select
                  ref={medicoSelectRef}
                  isClearable
                  name="medico"
                  cacheOptions
                  placeholder="Selecione o médico"
                  options={medicosList}
                  noOptionsMessage={() => 'Nenhum médico encontrado'}
                  loadingMessage={() => 'Procurando...'}
                  onChange={medico => {
                    setDiasOcupados(medico?.diasDaSemana)
                    setInicio()
                    setMedico(medico)
                    const inputTime =
                      document.querySelector("input[name='time']")
                    inputTime.value = medico?.bloco || configuracoes?.bloco
                  }}
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
                  defaultValue={
                    medicoSelectedAgenda && {
                      label: medicoSelectedAgenda?.nome,
                      value: medicoSelectedAgenda?._id
                    }
                  }
                  styles={{
                    control: styles => {
                      return {
                        ...styles,
                        borderColor: fieldsError.includes('medico') && 'red'
                      }
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label className="text-gray-500">Convênio</label>
                <Select
                  ref={convenioSelectRef}
                  isClearable
                  cacheOptions
                  name="convenio"
                  placeholder="Selecione o convênio"
                  options={conveniosList}
                  onChange={item => {
                    setConvenio(item)
                    if (!item?.value) {
                      return setProcedimentosList([])
                    }
                    const convenio = convenios.find(
                      convenio => convenio._id === item?.value
                    )
                    setProcedimentosList(
                      convenio.procedimentos.map(procedimento => {
                        return {
                          codigo: procedimento?._id?.codigoProcedimento,
                          label: [
                            procedimento?._id?.descricaoProcedimento,
                            procedimento?._id?.codigoProcedimento
                          ]
                            .filter(Boolean)
                            .join(' - '),
                          value: procedimento?._id?._id,
                          price:
                            parseInt(procedimento.valorHonorario || '0') +
                            parseInt(procedimento.valorFilme || '0')
                        }
                      })
                    )
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      procedimentoSelectRef.current.focus()
                    }
                  }}
                  noOptionsMessage={() => 'Nenhum convênio encontrado'}
                  loadingMessage={() => 'Procurando...'}
                  styles={{
                    control: (styles, props) => {
                      return {
                        ...styles,
                        borderColor: fieldsError.includes('convenio') && 'red'
                      }
                    },
                    menuList: styles => {
                      return {
                        ...styles,
                        height: '180px'
                      }
                    }
                  }}
                />
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label className="text-gray-500">Procedimento</label>
                <Select
                  ref={procedimentoSelectRef}
                  isClearable
                  name="procedimento"
                  cacheOptions
                  placeholder="Selecione o procedimento"
                  options={procedimentosList}
                  noOptionsMessage={() => 'Nenhum procedimento encontrado'}
                  loadingMessage={() => 'Procurando...'}
                  onChange={item => {
                    const inputValor = document.querySelector(
                      "input[name='valor']"
                    )
                    if (!item) {
                      inputValor.value = ''
                      return
                    }
                    inputValor.value = item.price
                    inputValor.default = item.price
                  }}
                  filterOption={({ data: { codigo, label } }, value) => {
                    if (value) {
                      return (
                        codigo?.toLowerCase()?.includes(value.toLowerCase()) ||
                        label?.toLowerCase()?.includes(value.toLowerCase())
                      )
                    }
                    return !value
                  }}
                  styles={{
                    control: (styles, props) => {
                      return {
                        ...styles,
                        borderColor:
                          fieldsError.includes('procedimento') && 'red'
                      }
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const horarioInput =
                        document.querySelector("[name='inicio']")
                      horarioInput.focus()
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 whitespace-nowrap">
                  Encaixe ?
                </label>
                <ToggleButtonController name="encaixe" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col  w-[60px] gap-1">
                <label className="text-gray-500">Qtd</label>
                <input
                  className="border rounded-md border-gray-300 outline-none p-2 w-full"
                  type="number"
                  placeholder="1"
                  min={1}
                  defaultValue={1}
                  name="quantidade"
                  onChange={e => {
                    const qtd = parseInt(e.target.value)
                    const inputValor = document.querySelector(
                      "input[name='valor']"
                    )
                    const valor = parseInt(inputValor.default)
                    if (isNaN(qtd) || isNaN(valor) || qtd === 0)
                      return (inputValor.value = inputValor.default)

                    return (inputValor.value = qtd * valor)
                  }}
                />
              </div>
              <div
                className={`flex-col w-[80px] gap-1 ${
                  convenio?.geraRecibo ? 'flex' : 'hidden'
                }`}
              >
                <label className="text-gray-500">Valor</label>
                <input
                  className={`border rounded-md ${
                    fieldsError.includes('valor')
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } outline-none p-2 w-full`}
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  name="valor"
                  defaultValue={0}
                />
              </div>
              <div className="flex flex-col gap-1 w-44">
                <label className="text-gray-500">Horário</label>
                <DatePicker
                  autoComplete="off"
                  className={`border rounded-md w-full ${
                    fieldsError.includes('inicio')
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } outline-none p-2`}
                  showTimeSelect
                  showDisabledMonthNavigation
                  timeCaption="Horário"
                  timeIntervals={medico?.bloco || configuracoes.bloco || 1}
                  name="inicio"
                  placeholderText="dd/mm/aaaa hh:mm"
                  dateFormat="dd'/'MM'/'yyyy' às 'HH:mm "
                  timeFormat="HH:mm"
                  locale="pt-BR"
                  onChange={async value => {
                    setInicio(value)
                    if (!agendamentoEdit._id) {
                      const data = format(value, 'yyyy-MM-dd')
                      const horariosOcupados = await getHorarioOcupados({
                        $and: [
                          {
                            $or: [
                              {
                                medico:
                                  medicoSelectRef.current.getValue()[0]?.value
                              },
                              {
                                procedimento:
                                  procedimentoSelectRef.current.getValue()[0]
                                    ?.value
                              }
                            ]
                          },
                          {
                            inicio: {
                              $gte: `${data} 00:00:00`,
                              $lte: `${data} 23:59:59`
                            }
                          }
                        ]
                      })
                      setHorariosOcupados(horariosOcupados)
                    }
                  }}
                  selected={inicio}
                  filterDate={date =>
                    diasOcupados?.includes(parseInt(format(date, 'i')) - 1)
                  }
                  filterTime={time =>
                    inicio &&
                    !horariosOcupados.includes(
                      format(time, 'yyyy-MM-dd HH:mm:ss')
                    )
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
                  maxTime={parseISO(
                    `2022-01-01 ${configuracoes?.fim || '19:00'}`
                  )}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      caraterAtendimentoSelectRef.current.focus()
                    }
                  }}
                />
              </div>
              <div className="flex flex-col w-60 gap-1">
                <label className="text-gray-500">Caráter Atend.</label>
                <Select
                  ref={caraterAtendimentoSelectRef}
                  isClearable
                  name="caraterAtendimento"
                  cacheOptions
                  placeholder="Selecione o tipo"
                  options={caraterAtendimento}
                  noOptionsMessage={() => 'Nenhum tipo encontrado'}
                  loadingMessage={() => 'Procurando...'}
                  styles={{
                    control: (styles, props) => {
                      return {
                        ...styles,
                        borderColor:
                          fieldsError.includes('caraterAtendimento') && 'red'
                      }
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const numeroCarteiraInput = document.querySelector(
                        "[name='numeroCarteira']"
                      )
                      numeroCarteiraInput.focus()
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-1 w-60">
                <label className="text-gray-500">Número da Carteirinha</label>
                <input
                  className={`border rounded-md ${
                    fieldsError.includes('numeroCarteira')
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } outline-none p-2 w-full `}
                  name="numeroCarteira"
                  type="number"
                  min="0"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const validadeCarteiraInput = document.querySelector(
                        "[name='validadeCarteira']"
                      )
                      validadeCarteiraInput.focus()
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-[0.25rem]">
                <label className="text-gray-500">Validade da Carteirinha</label>
                <input
                  className={`border rounded-md ${
                    fieldsError.includes('validadeCarteira')
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } outline-none p-[7px]  w-full `}
                  type="date"
                  name="validadeCarteira"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const addButton =
                        document.querySelector("[name='addButton']")
                      addButton.focus()
                    }
                  }}
                />
              </div>
              <div className="flex justify-end items-end">
                <button
                  type="button"
                  onClick={handleAddProcedimento}
                  name="addButton"
                  className="flex gap-2 text-xs justify-center items-center bg-primary px-3 py-3 whitespace-nowrap text-white rounded-md"
                >
                  {agendamentoEdit._id ? (
                    <Icon.FaEdit size={14} />
                  ) : (
                    <Icon.FaPlus size={14} />
                  )}
                </button>
              </div>
              <div className="flex-col gap-1 hidden">
                <label className="text-gray-500">Duração</label>
                <input
                  type="number"
                  className="border p-2 w-full outline-none rounded"
                  defaultValue={configuracoes.bloco || 1}
                  name="time"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2"></div>
            <div className="flex gap-2">
              <div className="flex flex-col col-span-2 gap-2 w-full">
                <label className="text-gray-500">Observação</label>
                <input
                  maxLength={60}
                  className="border rounded-md border-gray-300 outline-none p-2"
                  name="observacao"
                />
              </div>
              <div className="flex gap-2 justify-end items-end">
                <button
                  type="button"
                  onClick={() =>
                    swal({
                      title: 'Confirma o agendamento ?',
                      text: '',
                      icon: 'warning',
                      buttons: {
                        sim: {
                          text: 'Sim',
                          value: true
                        },
                        cancel: 'Não'
                      }
                    }).then(response => {
                      if (!response) return
                      handleSubmit()
                    })
                  }
                  className="flex gap-4 justify-center items-center bg-green-500 p-3 text-white rounded-md"
                >
                  <Icon.FaSave size={18} />
                </button>
              </div>
            </div>
          </form>

          {procedimentosSelected.length > 0 && (
            <div className="col-span-2 w-full overflow-auto py-4">
              <table className="w-full text-center rounded text-[13px]">
                <thead>
                  <tr className="bg-teal-500 text-white  rounded">
                    <td className="px-3 py-2 truncate">Médico</td>
                    <td className="px-3 py-2 truncate !w-1">Procedimento</td>
                    <td className="px-3 py-2 truncate">Qtd</td>
                    <td className="px-3 py-2 truncate">Horário</td>
                    <td className="px-3 py-2 truncate">Encaixe?</td>
                    <td className="px-3 py-2 truncate">Caráter atend.</td>
                    <td className="px-3 py-2 truncate">Ação</td>
                  </tr>
                </thead>
                <tbody>
                  {procedimentosSelected.length > 0 ? (
                    procedimentosSelected.map((item, index) => {
                      const medico = medicos.find(m => m._id === item.medico)
                      const procedimentoSelect = convenios
                        .reduce((acc, c) => [...acc, ...c.procedimentos], [])
                        .find(
                          p => p?._id?._id?.toString() === item.procedimento
                        )

                      return (
                        <tr className="bg-gray-100" key={index}>
                          <td className="p-2 text-gray-700">
                            {medico?.nome.toUpperCase()}
                          </td>
                          <td
                            title={procedimentoSelect?._id?.descricaoProcedimento.toUpperCase()}
                            className="p-2 text-gray-700"
                          >
                            <div className="w-32 truncate">
                              <span className="truncate w-full">
                                {procedimentoSelect?._id?.descricaoProcedimento.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="p-2 text-gray-700">
                            {item.quantidade || 1}
                          </td>
                          <td className="p-2 text-gray-700">
                            {format(
                              parseISO(item.inicio),
                              "dd/MM/yyyy 'às'  HH:mm"
                            )}
                          </td>
                          <td className="p-2 text-gray-700">
                            {item.encaixe ? 'Sim' : 'Não'}
                          </td>
                          <td className="p-2 text-gray-700">
                            {item.caraterAtendimento === 1
                              ? 'Eletivo'
                              : 'Urgência/Emergência'}
                          </td>
                          <td className="p-2 flex justify-center items-center gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                const convenio = convenios.find(
                                  c => c._id === item.convenio
                                )
                                const procedimento =
                                  convenio?.procedimentos.find(
                                    p => p._id?._id === item.procedimento
                                  )
                                convenioSelectRef.current.setValue({
                                  label: convenio?.nome,
                                  value: convenio?._id
                                })
                                procedimentoSelectRef.current.setValue({
                                  label:
                                    procedimento?._id?.descricaoProcedimento,
                                  value: procedimento?._id?._id
                                })
                                medicoSelectRef.current.setValue(
                                  medicosList.find(m => m.value === item.medico)
                                )
                                caraterAtendimentoSelectRef.current.setValue(
                                  caraterAtendimento.find(
                                    c => c.value === item.caraterAtendimento
                                  )
                                )
                                formProcedimentos.current.querySelector(
                                  '[name="valor"]'
                                ).value = item.valor

                                formProcedimentos.current.querySelector(
                                  '[name="observacao"]'
                                ).value = item.observacao

                                formProcedimentos.current.querySelector(
                                  '[name="encaixe"]'
                                ).checked = item.encaixe

                                setAgendamentoId(item._id)
                                setInicio(parseISO(item.inicio))
                              }}
                              className={`${
                                agendamentoEdit._id ? 'flex' : 'hidden'
                              } justify-center items-center bg-blue-600 px-3 py-3 text-white rounded-md`}
                            >
                              <Icon.FaEdit size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setProcedimentosSelected(
                                  procedimentosSelected.filter(
                                    (_, k) => k !== index
                                  )
                                )
                              }
                              className="flex justify-center items-center bg-red-600 px-3 py-3 text-white rounded-md"
                            >
                              <Icon.FaTrash size={14} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr className="bg-gray-100">
                      <td
                        className="italic p-2 text-center text-gray-400 text-light"
                        colSpan="100%"
                      >
                        Não há procedimentos adicionados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
