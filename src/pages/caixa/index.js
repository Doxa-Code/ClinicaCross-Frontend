/* eslint-disable indent */
import { useState, useEffect } from 'react'
import * as Icon from 'react-icons/fa'
import Menu from '../../components/Menu'
import { api } from '../../services/api'
import { returnPage, getFieldsValue, formatMoney } from '../../utils'
import Modal from '../../components/Modal'
import { Input, Select, Item } from '../../components/Form'
import Cookies from 'next-cookies'
import { useFetch } from '../../hooks/useFetch'
import swal from '@sweetalert/with-react'
import {
  format,
  isValid,
  parseISO,
  isSameDay,
  isAfter,
  isBefore
} from 'date-fns'
import { usePayloadStore, useMenuStore } from '../../hooks/store'

export default function Caixa({ userInitial = {}, users = [] }) {
  const [transacao, setTransacao] = useState('Deposito')
  const [showTransferencia, setShowTransferencia] = useState(false)
  const [showTransacao, setShowTransacao] = useState(false)
  const [showTransacaoSaque, setShowTransacaoSaque] = useState(false)
  const [user, setUser] = useState({})
  const [transacoes, setTransacoes] = useState([])
  const [total, setTotal] = useState([])
  const { update, fetch } = useFetch()
  const { setPayload, payload } = usePayloadStore(state => state)
  const [userCaixa, setUserCaixa] = useState()
  const { setStateLoading } = useMenuStore(state => state)
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [totalReceita, setTotalReceita] = useState([])
  const [totalDespesa, setTotalDespesa] = useState([])

  useEffect(() => {
    setUser(userInitial)
  }, [userInitial])

  useEffect(async () => {
    if (userCaixa) {
      setStateLoading(true)
      const [userData, errorUserData] = await fetch(`/users/${userCaixa}`)
      if (errorUserData) return
      setUser(userData)
      setStateLoading(false)
    }
  }, [userCaixa])

  useEffect(() => {
    setTransacoes(user.transacoes || [])
  }, [user])

  useEffect(() => {
    setTotal(
      transacoes
        .filter(item => item.tipo === 'Receita')
        .reduce((acc, item) => acc + item.valor, 0)
    )
  }, [transacoes])

  useEffect(() => {
    setTotal(
      transacoes
        .filter(item => {
          if (inicio == '') return item
          if (
            isAfter(parseISO(item.data), parseISO(inicio)) ||
            isSameDay(parseISO(item.data), parseISO(inicio))
          )
            return item
        })
        .filter(item => {
          if (fim == '') return item
          if (
            isBefore(parseISO(item.data), parseISO(fim)) ||
            isSameDay(parseISO(item.data), parseISO(fim))
          )
            return item
        })
        .reduce((acc, item) => acc + item.valor, 0)
    )

    setTotalDespesa(
      transacoes
        .filter(item => {
          if (inicio == '') return item
          if (
            isAfter(parseISO(item.data), parseISO(inicio)) ||
            isSameDay(parseISO(item.data), parseISO(inicio))
          )
            return item
        })
        .filter(item => {
          if (fim == '') return item
          if (
            isBefore(parseISO(item.data), parseISO(fim)) ||
            isSameDay(parseISO(item.data), parseISO(fim))
          )
            return item
        })
        .filter(item => item.tipo === 'Despesa')
        .reduce((acc, item) => acc + item.valor, 0)
    )

    setTotalReceita(
      transacoes
        .filter(item => {
          if (inicio == '') return item
          if (
            isAfter(parseISO(item.data), parseISO(inicio)) ||
            isSameDay(parseISO(item.data), parseISO(inicio))
          )
            return item
        })
        .filter(item => {
          if (fim == '') return item
          if (
            isBefore(parseISO(item.data), parseISO(fim)) ||
            isSameDay(parseISO(item.data), parseISO(fim))
          )
            return item
        })
        .filter(item => item.tipo === 'Receita')
        .reduce((acc, item) => acc + item.valor, 0)
    )
  }, [transacoes, inicio, fim])

  function handleSearch(value) {
    if (value === '') {
      return setTransacoes(user.transacoes)
    }
    setTransacoes(
      user.transacoes.filter(
        item =>
          item.createdAt?.toString()?.match(new RegExp(value, 'gim')) ||
          item.valor?.toString()?.match(new RegExp(value, 'gim')) ||
          item.destinatario?.nome
            ?.toString()
            ?.match(new RegExp(value, 'gim')) ||
          item.remetente?.nome?.toString()?.match(new RegExp(value, 'gim')) ||
          item.mensagem?.toString()?.match(new RegExp(value, 'gim'))
      )
    )
  }

  async function handleAddMoney(e) {
    e.preventDefault()
    const { valor } = getFieldsValue(e)
    setStateLoading(true)
    if (!valor) {
      return swal('Erro', 'Valor não informado', 'error')
    }

    const data = {
      valor:
        transacao === 'Deposito'
          ? user.valor + parseFloat(valor)
          : user.valor - parseFloat(valor),
      transacoes: [
        ...user.transacoes,
        {
          valor,
          tipo: transacao === 'Deposito' ? 'Receita' : 'Despesa',
          mensagem:
            transacao === 'Deposito' ? 'Depósito em conta' : 'Saque efetuado',
          destinatario: user._id,
          remetente: user._id,
          data: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        }
      ]
    }
    // eslint-disable-next-line no-unused-vars
    const [_, error] = await update(`/users/${user._id}`, data)

    if (error) {
      return swal('Erro', error || ' ', 'error')
    }

    const [userDataPayload, errorUserDataPayload] = await fetch(
      `/users/${payload._id}`
    )
    if (errorUserDataPayload) {
      return swal('Erro', 'Erro ao atualizar o usuário', 'error')
    }

    setPayload(userDataPayload)
    const [userData, errorUserData] = await fetch(`/users/${user._id}`)

    if (errorUserData) {
      return swal('Erro', 'Erro ao atualizar o usuário', 'error')
    }

    setUser(userData)
    setStateLoading(false)

    setShowTransacao(false)
    setShowTransacaoSaque(false)
    swal('Sucesso!', 'Transação realizada com sucesso', 'success', {
      timer: 3000,
      buttons: false
    })
  }

  async function handleSendMoney(e) {
    e.preventDefault()
    const fields = getFieldsValue(e)
    setStateLoading(true)
    // Pegar o caixa do destinatario, somar o valor e adicionar a transação
    const [destinatario, errorDestinatario] = await fetch(
      `/users/${fields.destinatario}`
    )
    if (errorDestinatario) {
      return swal('Erro', 'Usuário não encontrado', 'error')
    }
    const newDestinatario = {
      ...destinatario,
      valor: destinatario.valor + parseFloat(fields.valor),
      transacoes: [
        ...(destinatario.transacoes || []),
        {
          ...fields,
          mensagem: fields.mensagem || 'Transação realizada com sucesso',
          valor: parseFloat(fields.valor),
          remetente: user._id,
          tipo: 'Receita',
          data: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        }
      ]
    }
    // eslint-disable-next-line no-unused-vars
    const [_updateDestinatario, errorUpdateDestinatario] = await update(
      `/users/${fields.destinatario}`,
      newDestinatario
    )
    if (errorUpdateDestinatario) {
      return swal('Erro', 'Erro ao atualizar o destinatário', 'error')
    }
    // Pegar o caixa do usuario, subtrair o valor e adicionar a transação
    const newUser = {
      ...user,
      valor: user.valor - parseFloat(fields.valor),
      transacoes: [
        ...(user.transacoes || []),
        {
          ...fields,
          mensagem: fields.mensagem || 'Transação realizada com sucesso',
          valor: parseFloat(fields.valor),
          remetente: user._id,
          tipo: 'Despesa',
          data: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        }
      ]
    }
    // eslint-disable-next-line no-unused-vars
    const [_updateUser, errorUpdateUser] = await update(
      `/users/${user._id}`,
      newUser
    )
    if (errorUpdateUser) {
      return swal('Erro', 'Erro ao atualizar o usuário', 'error')
    }

    const [userDataPayload, errorUserDataPayload] = await fetch(
      `/users/${payload._id}`
    )
    if (errorUserDataPayload) {
      return swal('Erro', 'Erro ao atualizar o usuário', 'error')
    }

    setPayload(userDataPayload)
    const [userData, errorUserData] = await fetch(`/users/${user._id}`)

    if (errorUserData) {
      return swal('Erro', 'Erro ao atualizar o usuário', 'error')
    }

    setUser(userData)
    setStateLoading(false)

    setShowTransferencia(false)
    swal('Sucesso!', 'Transação realizada com sucesso', 'success', {
      timer: 3000,
      buttons: false
    })
  }

  return (
    <Menu
      title="Minhas transações"
      className="grid bg-white auto-rows-min rounded-md p-0"
    >
      <div className="pt-8 xl:flex items-center">
        <Select
          className={`${
            payload.grupo?.adm || payload?.developer
              ? 'xl:ml-10'
              : 'xl:ml-10 hidden'
          }`}
          onChange={e => setUserCaixa(e.target.value)}
          title="Usuários"
        >
          {users.map(user => (
            <option key={user._id} value={user._id}>
              {user?.nome}
            </option>
          ))}
        </Select>
        <div className="flex md:mx-10 gap-4 pb-4">
          <Item className="mt-3">
            <Input
              onChange={e => setInicio(e.target.value)}
              type="date"
              name="dateIn"
              title="Inicio"
            />
          </Item>
          <Item className="mt-3">
            <Input
              onChange={e => setFim(e.target.value)}
              type="date"
              name="dateOut"
              title="Fim"
            />
          </Item>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-3 justify-between px-5 xl:px-10 py-8 items-start lg:items-center w-full">
        <div className="flex w-full xl:max-w-md justify-between border rounded-lg">
          <input
            onChange={({ target }) => handleSearch(target.value)}
            placeholder="Pesquisar"
            className="p-2 w-full outline-none rounded-lg"
          />
          <div className="p-3 justify-center items-center">
            <Icon.FaSearch size={15} className="text-gray-400" />
          </div>
        </div>
        <div className="flex flex-col xl:max-w-2xl w-full xl:justify-between  xl:grid xl:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setTransacao('Deposito')
              setShowTransacao(true)
            }}
            className="bg-lime-500 shadow-lg hover:opacity-80 rounded-md text-white font-semibold p-3 gap-3 flex justify-center items-center text-sm"
          >
            <Icon.FaMoneyBill size={18} /> Depositar
          </button>
          <button
            onClick={() => {
              setTransacao('Saque')
              setShowTransacaoSaque(true)
            }}
            className="bg-red-500 shadow-lg hover:opacity-80 rounded-md text-white font-semibold p-3 gap-3 flex justify-center items-center text-sm"
          >
            <Icon.FaMoneyBill size={18} /> Sacar
          </button>
          <button
            onClick={() => {
              setShowTransferencia(true)
            }}
            className="bg-primary shadow-lg hover:opacity-80 rounded-md text-white font-semibold p-3 gap-3 flex justify-center items-center text-sm"
          >
            <Icon.FaChevronRight size={18} /> Nova transferência
          </button>
        </div>
      </div>
      <div className="mx-5 md:mx-10 pb-20 h-[600px] overflow-auto">
        <table className="w-full table-striped">
          <thead>
            <tr>
              <th
                className="text-gray-dark border text-left px-3 text-sm py-4"
                width={50}
              >
                #
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Data
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Valor
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Destinatário
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Remetente
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Mensagem
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-dark">
            {transacoes.length > 0 ? (
              transacoes
                .filter(item => {
                  if (inicio == '') return item
                  if (
                    isAfter(parseISO(item.data), parseISO(inicio)) ||
                    isSameDay(parseISO(item.data), parseISO(inicio))
                  )
                    return item
                })
                .filter(item => {
                  if (fim == '') return item
                  if (
                    isBefore(parseISO(item.data), parseISO(fim)) ||
                    isSameDay(parseISO(item.data), parseISO(fim))
                  )
                    return item
                })
                .map((item, key) => {
                  return (
                    <tr key={key} className="text-center">
                      <td className="border text-left text-sm px-3">
                        {key + 1}
                      </td>
                      <td className="border text-left text-sm px-3">
                        {item?.data
                          ? isValid(parseISO(item?.data)) &&
                            format(parseISO(item?.data), 'dd/MM/yyyy HH:mm')
                          : isValid(parseISO(item?.createdAt)) &&
                            format(
                              parseISO(item.createdAt),
                              'dd/MM/yyyy HH:mm'
                            )}
                      </td>
                      <td className="border text-left text-sm px-3">
                        {item.tipo === 'Receita' ? (
                          <span className="text-lime-500">
                            {formatMoney(item.valor)}
                          </span>
                        ) : (
                          <span className="text-red-500">
                            -{formatMoney(item.valor)}
                          </span>
                        )}
                      </td>
                      <td className="border text-left text-sm px-3">
                        {item.destinatario?.nome}
                      </td>
                      <td className="border text-left text-sm px-3">
                        {item.remetente?.nome}
                      </td>
                      <td className="border text-left text-sm px-3 py-2">
                        {item.mensagem}
                      </td>
                    </tr>
                  )
                })
            ) : (
              <tr>
                <td
                  className="text-center text-sm p-3 bg-gray-100 bg-opacity-40 border text-gray-400 italic"
                  colSpan={6}
                >
                  Não há transações
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="pb-10 w-full flex justify-end pr-10">
        <span className="border text-left text-sm px-3 py-2 text-lime-500">
          Total Receita: {formatMoney(totalReceita)}
        </span>
        <span className="border text-left text-sm px-3 py-2 text-red-500">
          Total Despesa: {formatMoney(totalDespesa)}
        </span>
        <span className="border text-left text-sm px-3 py-2">
          Total: {formatMoney(totalReceita - totalDespesa)}
        </span>
      </div>
      <Modal
        closeWithEsc
        open={showTransferencia}
        setOpen={setShowTransferencia}
        classNameModal="!h-[400px]"
      >
        <div className="w-full h-screen flex justify-center items-center">
          <div className="bg-white w-full max-w-xl p-10 rounded-md grid gap-2">
            <h1 className="text-gray-700 text-2xl font-bold">
              Nova transferência
            </h1>
            <hr />
            <form
              className="w-full mt-3 flex flex-col gap-4"
              onSubmit={handleSendMoney}
            >
              <Select name="destinatario" title="Pra quem?">
                {users
                  .filter(item => item._id !== user._id)
                  .map(item => (
                    <option key={item._id} value={item._id}>
                      {item?.nome}
                    </option>
                  ))}
              </Select>
              <Input title="Mensagem" name="mensagem" />
              <Input
                title="Valor"
                name="valor"
                step="0.01"
                type="number"
                min={0.1}
              />
              <div className="w-full flex justify-end items-center">
                <button className="bg-primary w-full px-3 py-2 rounded-md text-white text-lg flex justify-center items-center gap-4">
                  <Icon.FaChevronRight />
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
      <Modal
        closeWithEsc
        open={showTransacaoSaque}
        setOpen={setShowTransacaoSaque}
        classNameModal="!h-[300px]"
      >
        <div className="w-full h-screen flex justify-center items-center">
          <div className="bg-white w-full max-w-xl p-10 rounded-md grid gap-2">
            <h1 className="text-gray-700 text-2xl font-bold">Novo saque</h1>
            <hr />
            <form
              className="w-full mt-3 flex flex-col gap-4"
              onSubmit={handleAddMoney}
            >
              <Input
                title="Valor"
                name="valor"
                step="0.01"
                type="number"
                min={0.1}
              />
              <div className="w-full flex justify-end items-center">
                <button className="bg-primary w-full px-3 py-2 rounded-md text-white text-lg flex justify-center items-center gap-4">
                  <Icon.FaMoneyCheck />
                  Sacar
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
      <Modal
        classNameModal="!h-[300px]"
        closeWithEsc
        open={showTransacao}
        setOpen={setShowTransacao}
      >
        <div className="w-full h-screen flex justify-center items-center">
          <div className="bg-white w-full max-w-xl p-10 rounded-md grid gap-2">
            <h1 className="text-gray-700 text-2xl font-bold">Novo depósito</h1>
            <hr />
            <form
              className="w-full mt-3 flex flex-col gap-4"
              onSubmit={handleAddMoney}
            >
              <Input
                title="Valor"
                name="valor"
                step="0.01"
                type="number"
                min={0.1}
              />
              <div className="w-full flex justify-end items-center">
                <button className="bg-primary w-full px-3 py-2 rounded-md text-white text-lg flex justify-center items-center gap-4">
                  <Icon.FaMoneyCheck />
                  Depositar
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </Menu>
  )
}

export async function getServerSideProps(ctx) {
  const { payload } = Cookies(ctx)
  if (!payload) {
    return returnPage(ctx)
  }
  try {
    const user = await api
      .get(`/users/${payload._id}`)
      .then(response => response.data)

    const users = await api.get('/users').then(response => response.data)

    if (!user || !users) {
      throw new Error('Houve um erro ao carregar os dados!')
    }

    return {
      props: {
        userInitial: user,
        users: users
      }
    }
  } catch (err) {
    console.log(err)
    return {
      props: {
        dataInitial: []
      }
    }
  }
}
