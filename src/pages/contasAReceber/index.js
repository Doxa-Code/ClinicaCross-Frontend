/* eslint-disable new-cap */
import { useState, useRef } from 'react'
import Menu from '../../components/Menu'
import { Header, Item, Span, Input } from '../../components/Form'
import SelectSearch from '../../components/SelectSearch'
import * as Icon from 'react-icons/fa'
import { formatMoney, getFieldsValue, formatPacienteSearch } from '../../utils'
import {
  format,
  isAfter,
  isBefore,
  isEqual,
  isToday,
  isValid,
  parseISO
} from 'date-fns'
import { useFetch } from '../../hooks/useFetch'
import ModalAgendamento from '../../components/agendamento/ModalAgendamento'
import { useAgendamentoStore } from '../../hooks/store'

export default function ContasAReceber() {
  const [resultados, setResultados] = useState([])
  const [pacientesList, setPacientesList] = useState([])
  const { setAgendamento, setScreen, setShowAgendamento } = useAgendamentoStore(
    state => state
  )
  const { create, fetch } = useFetch()
  const pdf = useRef()

  async function handleSubmit(e) {
    e.preventDefault()
    const fields = getFieldsValue(e, false)

    const [response, error] = await create('/agendamentos/financeiro', fields)

    if (error) return setResultados([])
    setResultados(
      response.reduce((acc, item) => {
        item.pagamento
          .filter(pagamento => {
            const data = parseISO(pagamento.dataVencimento)
            const dateIn = parseISO(fields.dateIn)
            const dateOut = parseISO(fields.dateOut)

            console.log(fields)

            return isValid(data) && fields.dateIn && fields.dateOut
              ? (isBefore(data, dateOut) || isEqual(data, dateOut)) &&
                  (isAfter(data, dateIn) || isEqual(data, dateIn))
              : true
          })
          .sort((a, b) => (a.numeroParcela > b.numeroParcela ? 1 : -1))
          .map(pagamento => {
            acc.push({
              ...item,
              ...pagamento,
              agendamentoId: item._id,
              statusAgendamento: item.status
            })
          })
        return acc
      }, [])
    )
  }

  async function handleLoadAgendamento(_id) {
    const [data, error] = await fetch(`/agendamentos/${_id}`)
    if (error) return
    setScreen('Agendamento')
    setAgendamento(data)
    setShowAgendamento(true)
  }

  async function handleSearchPaciente(value) {
    if (value === '') {
      return []
    }
    const [{ pacientes }, error] = await fetch(
      `/pacientes/search?q=${value.toLowerCase()}`
    )
    if (error) return

    return pacientes.map(paciente => ({
      label: formatPacienteSearch(paciente),
      value: paciente._id
    }))
  }

  return (
    <Menu
      title="Contas a receber"
      className="bg-transparent flex flex-col gap-3"
    >
      <div className="rounded-2xl flex justify-center items-center p-5 xl:p-8 bg-white">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col xl:grid xl:grid-cols-2 gap-4 w-full"
        >
          <Item span={2}>
            <Span>Paciente:</Span>
            <SelectSearch
              name="paciente"
              placeholder="Nenhum paciente selecionado!"
              data={pacientesList}
              mutate={setPacientesList}
              handleSearch={handleSearchPaciente}
            />
          </Item>
          <Item className="mt-3">
            <Input type="date" name="dateIn" title="Inicio" />
          </Item>
          <Item className="mt-3">
            <Input type="date" name="dateOut" title="Fim" />
          </Item>
          <div className="flex justify-end col-span-2">
            <button className="bg-primary xl:w-32 w-full shadow-lg hover:opacity-80 rounded-md text-white font-semibold p-3 gap-3 flex justify-center items-center text-sm">
              <Icon.FaSearch size={18} />
              Buscar
            </button>
          </div>
        </form>
      </div>
      <div className="rounded-2xl bg-white p-8 flex flex-col gap-3">
        <Header>
          <div className="flex xl:flex-row flex-col w-full justify-between xl:items-center gap-4">
            <span>Resultados</span>
          </div>
        </Header>
        <div ref={pdf} className="mb-20 overflow-auto">
          <table className="w-full table-striped">
            <thead>
              <tr>
                <th className="w-10 text-gray-dark border text-left px-3 text-sm py-4">
                  #
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Paciente
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Data de vencimento
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Status do Agendamento
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Forma de pagamento
                </th>
                <th className="w-10 text-gray-dark border text-left px-3 text-sm py-4">
                  Nº Parcela
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Valor
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Status da Parcela
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-dark">
              {resultados.length > 0 ? (
                resultados.map((resultado, index) => {
                  const atrasada =
                    isValid(parseISO(resultado.dataVencimento)) &&
                    !isBefore(new Date(), parseISO(resultado.dataVencimento)) &&
                    resultado.status === 'Em aberto' &&
                    !isToday(parseISO(resultado.dataVencimento))

                  let iconStatusAgendamento = (
                    <Icon.FaExclamationCircle size={20} />
                  )
                  let classNameStatusAgendamento = ''

                  switch (resultado.statusAgendamento) {
                    case 'Agendado':
                      iconStatusAgendamento = (
                        <Icon.FaExclamationCircle size={20} />
                      )
                      classNameStatusAgendamento = 'text-slate-400'
                      break
                    case 'Confirmado':
                      iconStatusAgendamento = <Icon.FaCheck size={20} />
                      classNameStatusAgendamento = 'text-primary'
                      break
                    case 'Cancelado':
                      iconStatusAgendamento = <Icon.FaTimesCircle size={20} />
                      classNameStatusAgendamento = 'text-red-500'
                      break
                    case 'Realizado':
                      iconStatusAgendamento = <Icon.FaCheckDouble size={20} />
                      classNameStatusAgendamento = 'text-teal-500'
                      break
                    default:
                      classNameStatusAgendamento = ''
                      iconStatusAgendamento = (
                        <Icon.FaExclamationCircle size={20} />
                      )
                  }
                  return (
                    <tr className="text-center" key={index}>
                      <td className="border text-left text-sm p-3">
                        {index + 1}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {resultado.paciente.nome}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {format(
                          parseISO(resultado.dataVencimento),
                          'dd/MM/yyyy'
                        )}
                      </td>
                      <td
                        className={`border text-left text-sm p-3 ${classNameStatusAgendamento}`}
                      >
                        <div className="flex gap-3">
                          {iconStatusAgendamento}
                          {resultado.statusAgendamento}
                        </div>
                      </td>
                      <td className="border text-left text-sm p-3">
                        {resultado?.formaPagamento?.nome}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {resultado.numeroParcela}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {formatMoney(resultado.valor)}
                      </td>
                      <td
                        className={`px-5 py-2 text-sm font-normal text-left border ${
                          atrasada
                            ? 'bg-red-600 text-white'
                            : resultado.status === 'Em aberto'
                            ? 'bg-yellow-300 text-gray-700'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        {atrasada ? 'Em Atraso' : resultado.status}
                      </td>
                      <td className="border text-left text-sm p-3">
                        <button
                          onClick={() => {
                            handleLoadAgendamento(resultado.agendamentoId)
                          }}
                          className="bg-blue-600 p-2 rounded-full text-white shadow-md"
                        >
                          <Icon.FaEye size={12} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr className="text-center">
                  <td
                    colSpan={8}
                    className="border text-center text-sm p-3 italic"
                  >
                    Não há resultados
                  </td>
                </tr>
              )}
              <tr className="text-center">
                <td colSpan={6} className="border p-3 bg-zinc-200"></td>
                <td
                  colSpan={4}
                  className="border p-3 bg-zinc-50 text-left text-sm"
                >
                  {formatMoney(
                    resultados.reduce(
                      (acc, item) => acc + parseFloat(item.valor),
                      0
                    )
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <ModalAgendamento />
    </Menu>
  )
}
