import { useState, useEffect, useRef } from 'react'
import * as Icon from 'react-icons/fa'
import {
  parseISO,
  format,
  addMonths,
  isValid,
  isBefore,
  isToday
} from 'date-fns'
import { formatMoney, getFieldsValue } from '../../../../../utils'
import { Input, Select } from '../../../../Form'
import swal from '@sweetalert/with-react'
import {
  useReciboStore,
  useAgendamentoStore,
  useFormasDePagamentoStore,
  usePayloadStore
} from '../../../../../hooks/store'
import { useFetch } from '../../../../../hooks/useFetch'

export default function Financeiro() {
  const { formasDePagamento, setFormasDePagamento } = useFormasDePagamentoStore(
    state => state
  )
  const { agendamento, setAgendamento, screen } = useAgendamentoStore(
    state => state
  )
  const { payload, setPayload } = usePayloadStore(state => state)
  const { fetch, update, remove, create } = useFetch()
  const { setRecibo, setShowRecibo, setReadOnly } = useReciboStore(
    state => state
  )
  const [valorLancado, setValorLancado] = useState(0)
  const [valorEmAberto, setValorEmAberto] = useState(0)
  const [pagamentos, setPagamentos] = useState(agendamento.pagamento || [])
  const [divide, setDivide] = useState(false)
  const [open, setOpen] = useState(false)
  const form = useRef()

  useEffect(() => {
    if (!open) {
      form.current.reset()
      setDivide(false)
    }
  }, [open])

  useEffect(() => {
    const valor =
      pagamentos?.reduce(
        (acc, parcela) => acc + parseFloat(parcela.valor),
        0
      ) || 0

    setValorEmAberto(parseFloat(agendamento.valor) - valor)
    setValorLancado(valor)
  }, [pagamentos])

  useEffect(() => {
    handleLoad()
  }, [])

  async function handleLoad() {
    const [data, error] = await fetch('/formaDePagamentos')
    if (error) return
    setFormasDePagamento(data)
  }

  async function handleStatus(id, status) {
    const [data, error] = await update(
      `/agendamentos/pagamento/${agendamento._id}/${id}`,
      { status }
    )
    if (error) return

    setPagamentos(data)
    setAgendamento({ ...agendamento, pagamento: data })
  }

  async function handleDelete(id) {
    const [data, error] = await remove(
      `/agendamentos/pagamento/${agendamento._id}/${id}`
    )
    if (error) return

    setPagamentos(data)
    setAgendamento({ ...agendamento, pagamento: data })
  }

  async function handleLancamento(e) {
    e.preventDefault()
    const fields = getFieldsValue(e)
    Array.from({ length: fields.qtdParcelas }).forEach(async (_, index) => {
      const [data, error] = await create(
        `/agendamentos/pagamento/${agendamento._id}`,
        {
          ...fields,
          numeroParcela: index + 1,
          qtdParcelas: parseInt(fields.qtdParcelas),
          valor: parseFloat(fields.valor) / parseInt(fields.qtdParcelas),
          dataVencimento: format(
            addMonths(parseISO(fields.dataVencimento), index),
            'yyyy-MM-dd'
          ),
          status: 'Em aberto',
          responsavel: payload._id
        }
      )
      if (error) return
      setPagamentos(data)
      setAgendamento({ ...agendamento, pagamento: data })
    })
    setOpen(false)
  }
  async function handleTransacao(valor, tipo) {
    if (!valor) {
      return swal('Erro', 'Valor não informado', 'error')
    }

    const data = {
      valor:
        tipo === 'add'
          ? payload.valor + parseFloat(valor)
          : payload.valor - parseFloat(valor),
      transacoes: [
        ...payload.transacoes,
        {
          valor,
          tipo: tipo === 'add' ? 'Receita' : 'Despesa',
          mensagem:
            tipo === 'add'
              ? `Recebimento agendamento ${format(
                  parseISO(agendamento.inicio),
                  'dd/MM/yyyy HH:mm'
                )} ${agendamento.paciente.nome}`
              : `Recebimento cancelado ${format(
                  parseISO(agendamento.inicio),
                  'dd/MM/yyyy HH:mm'
                )}`,
          destinatario: payload._id,
          remetente: payload._id,
          data: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        }
      ]
    }
    // eslint-disable-next-line no-unused-vars
    const [_, error] = await update(`/users/${payload._id}`, data)

    if (error) {
      return swal('Erro', error || ' ', 'error')
    }

    const [userData, errorUserData] = await fetch(`/users/${payload._id}`)

    if (errorUserData) {
      return swal('Erro', 'Erro ao atualizar o usuário', 'error')
    }
    setPayload(userData)
  }

  return (
    <div
      className={`px-5 py-8 gap-4 grid ${screen !== 'Financeiro' && 'hidden'}`}
    >
      <div className="grid xl:grid-cols-2 gap-4">
        <div className="px-6 py-4 flex flex-col justify-center items-start  shadow-md rounded-md">
          <span className="font-semibold text-2xl truncate text-red-500">
            {formatMoney(valorEmAberto)}
          </span>
          <span className="font-light text-sm text-gray-500">
            Valor em aberto
          </span>
        </div>
        <div className="px-6 py-4 flex flex-col justify-center items-end  shadow-md rounded-md">
          <span className="font-semibold text-2xl truncate text-green-500">
            {formatMoney(valorLancado)}
          </span>
          <span className="font-light text-sm text-gray-500">
            Valor lançado
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-4 items-end">
        <form
          ref={form}
          onSubmit={handleLancamento}
          className={`${
            open ? 'grid' : 'hidden'
          } grid-cols-3 gap-4 w-full border shadow-md rounded-md p-5 pt-8`}
        >
          <Select
            required
            className={`${!divide ? 'col-span-2' : 'col-span-3'}`}
            onChange={e =>
              setDivide(
                formasDePagamento.find(forma => forma._id === e.target.value)
                  ?.divide
              )
            }
            title="Forma de Pagamento"
            name="formaPagamento"
          >
            {formasDePagamento.map((forma, index) => (
              <option key={index} value={forma._id}>
                {forma.nome}
              </option>
            ))}
          </Select>
          <Input
            className={!divide && 'hidden'}
            title="Quantidades de parcelas"
            type="number"
            defaultValue={1}
            name="qtdParcelas"
          />
          <Input
            className={!divide && 'hidden'}
            title="Data do primeiro vencimento"
            type="date"
            name="dataVencimento"
            defaultValue={format(new Date(), 'yyyy-MM-dd')}
          />
          <Input
            title="Valor"
            type="number"
            step="0.01"
            name="valor"
            max={parseFloat(valorEmAberto)}
            defaultValue={parseFloat(valorEmAberto)}
          />
          <div className="col-span-3 gap-4 flex justify-end items-center">
            <button className="bg-primary text-white flex justify-center items-center px-4 py-3 gap-4 rounded-md">
              <Icon.FaSave className="text-2xl" />
              Lançar
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-red-400 text-white flex justify-center items-center px-4 py-3 gap-4 rounded-md"
            >
              <Icon.FaTimes className="text-2xl" />
              Cancelar
            </button>
          </div>
        </form>
        <button
          disabled={valorEmAberto <= 0}
          onClick={() => valorEmAberto > 0 && setOpen(!open)}
          className={`bg-green-500 ${
            open ? 'hidden' : 'flex'
          } justify-center outline-none items-center text-white p-3 rounded gap-4`}
        >
          <Icon.FaDollarSign size={20} />
          Realizar pagamento
        </button>
      </div>
      <div className="max-h-96 overflow-auto">
        <table className="table-striped w-full overflow-auto border-collapse">
          <thead>
            <tr className="sticky top-0 bg-white shadow-md">
              <th className="px-5 py-2 text-sm text-center border font-semibold text-gray-700">
                Responsável
              </th>
              <th className="px-5 py-2 text-sm text-center border font-semibold text-gray-700">
                Forma de pagamento
              </th>
              <th className="px-5 py-2 text-sm text-center border font-semibold text-gray-700">
                Parcela
              </th>
              <th className="px-5 py-2 text-sm text-center border font-semibold text-gray-700">
                Valor R$
              </th>
              <th className="px-5 py-2 text-sm text-center border font-semibold text-gray-700">
                Data de vencimento
              </th>
              <th
                width={200}
                className="px-5 py-2 text-sm text-center border font-semibold text-gray-700"
              >
                Status
              </th>
              <th className="px-5 py-2 text-sm text-center border font-semibold text-gray-700">
                Ação
              </th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.length > 0 ? (
              pagamentos
                .sort((a, b) => a.numeroParcela - b.numeroParcela)
                .map((item, index) => {
                  const atrasada =
                    isValid(parseISO(item.dataVencimento)) &&
                    !isBefore(new Date(), parseISO(item.dataVencimento)) &&
                    item.status === 'Em aberto' &&
                    !isToday(parseISO(item.dataVencimento))

                  return (
                    <tr key={index}>
                      <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                        {item.responsavel?.nome}
                      </td>
                      <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                        {item.formaPagamento?.nome}
                      </td>
                      <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                        {item.numeroParcela}
                      </td>
                      <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                        {formatMoney(item.valor)}
                      </td>
                      <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                        {isValid(parseISO(item.dataVencimento)) &&
                          format(parseISO(item.dataVencimento), 'dd/MM/yyyy')}
                      </td>
                      <td
                        className={`px-5 py-2 text-sm font-normal text-center border ${
                          atrasada
                            ? 'bg-red-600 text-white'
                            : item.status === 'Em aberto'
                            ? 'bg-yellow-300 text-gray-700'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        {atrasada ? 'Em Atraso' : item.status}
                      </td>
                      <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                        <div className="flex justify-center items-center gap-2">
                          {item.status === 'Em aberto' && (
                            <button
                              onClick={() => {
                                handleStatus(item._id, 'Pago')
                                handleTransacao(item.valor, 'add')
                              }}
                              title="Registrar pagamento"
                              className="bg-green-500 text-white p-2 rounded-full"
                            >
                              <Icon.FaStamp />
                            </button>
                          )}

                          {item.status === 'Pago' && (
                            <>
                              <button
                                onClick={() => {
                                  handleStatus(item._id, 'Em aberto')
                                  handleTransacao(item.valor, 'remove')
                                }}
                                title="Registrar pendencia"
                                className="bg-yellow-400 text-white p-2 rounded-full"
                              >
                                <Icon.FaStamp />
                              </button>
                              <button
                                onClick={() => {
                                  setReadOnly(false)
                                  setShowRecibo(true)
                                  setRecibo({
                                    ...agendamento,
                                    parcela: item
                                  })
                                }}
                                title="Gerar Recibo"
                                className={`bg-blue-400 text-white p-2 rounded-full ${
                                  !agendamento.convenio?.geraRecibo && 'hidden'
                                }`}
                              >
                                <Icon.FaFile />
                              </button>
                            </>
                          )}
                          <button
                            title="Remover parcela"
                            onClick={() => {
                              swal({
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
                                if (!response) return
                                handleDelete(item._id)
                                handleTransacao(item.valor, 'remove')
                              })
                            }}
                            className="bg-red-400 text-white p-2 rounded-full"
                          >
                            <Icon.FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
            ) : (
              <tr>
                <td
                  className="px-5 py-2 text-sm font-light italic text-center text-gray-400 border"
                  colSpan={7}
                >
                  Nenhum agendamento encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
