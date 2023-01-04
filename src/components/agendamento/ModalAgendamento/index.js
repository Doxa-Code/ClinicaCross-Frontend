/* eslint-disable indent */
/* eslint-disable new-cap */
import Modal from '../../Modal'
import { parseISO, format, isValid } from 'date-fns'
import Agendamento from './components/screens/agendamentos'
import Historico from './components/screens/historico'
import Financeiro from './components/screens/financeiro'
import Recibos from './components/screens/recibos'
import Laudos from './components/screens/laudos'
import Pedidos from './components/screens/pedidos'
import Exames from './components/screens/exames'
import Receitas from './components/screens/receitas'
import Atestados from './components/screens/atestados'
import Prontuarios from './components/screens/prontuarios'
import Anexos from './components/screens/anexos'
import Declaracoes from './components/screens/declaracoes'
import * as Icons from 'react-icons/md'
import swal from '@sweetalert/with-react'
import {
  useAgendamentoStore,
  useAgendarStore,
  useLaudoStore,
  useReceitaStore,
  useAtestadoStore,
  useProntuarioStore,
  useAnexoStore,
  usePayloadStore,
  usePedidoStore,
  useExameStore,
  useDeclaracaoStore
} from '../../../hooks/store'
import { useFetch } from '../../../hooks/useFetch'
import ButtonAction from './components/buttonAction'
import ModalRecibo from './components/ModalRecibo'
import ModalLaudo from './components/ModalLaudo'
import ModalPedido from './components/ModalPedido'
import ModalExame from './components/ModalExame'
import ModalReceita from './components/ModalReceita'
import ModalAtestado from './components/ModalAtestado'
import ModalProntuario from './components/ModalProntuario'
import ModalAnexo from './components/ModalAnexo'
import ModalDeclaracao from './components/ModalDeclaracao'

export default function ModalAgendamento() {
  const menu = [
    {
      title: 'Agendamento',
      inAgreement: true,
      administrador: true,
      doctor: true,
      collaborator: true
    },
    {
      title: 'Histórico',
      inAgreement: true,
      administrador: true,
      doctor: true,
      collaborator: true
    },
    {
      title: 'Financeiro',
      administrador: true,
      doctor: true,
      collaborator: true,
      inAgreement: false
    },
    {
      title: 'Recibos',
      inAgreement: true,
      administrador: true,
      doctor: false,
      collaborator: true
    },
    {
      title: 'Laudos',
      inAgreement: true,
      administrador: true,
      doctor: true,
      collaborator: false
    },
    {
      title: 'Receitas',
      inAgreement: true,
      administrador: true,
      doctor: true,
      collaborator: true
    },
    {
      title: 'Declarações',
      inAgreement: true,
      administrador: true,
      doctor: true,
      collaborator: true
    },
    {
      title: 'Atestados',
      inAgreement: true,
      administrador: true,
      doctor: true,
      collaborator: true
    },
    {
      title: 'Prontuários',
      inAgreement: true,
      administrador: true,
      doctor: true,
      collaborator: false
    },
    {
      title: 'Exames',
      inAgreement: true,
      administrador: true,
      doctor: true,
      collaborator: false
    },
    {
      title: 'Pedidos',
      inAgreement: true,
      administrador: true,
      doctor: true,
      collaborator: false
    },
    {
      title: 'Anexos',
      inAgreement: true,
      administrador: true,
      doctor: true,
      collaborator: false
    }
  ]
  const {
    showAgendamento,
    agendamento,
    agendamentos,
    screen,
    setAgendamento,
    setAgendamentos,
    setShowAgendamento,
    setScreen
  } = useAgendamentoStore(state => state)

  const { payload } = usePayloadStore(state => state)

  const { setShowAgendar, setAgendamentoEdit } = useAgendarStore(state => state)
  const {
    setShowProntuario,
    setReadOnly: setReadOnlyProntuario,
    setProntuario
  } = useProntuarioStore(state => state)

  const { setShowAnexo, setAnexo } = useAnexoStore(state => state)

  const {
    setShowLaudo,
    setReadOnly: setReadOnlyLaudo,
    setLaudo
  } = useLaudoStore(state => state)

  const {
    setShowDeclaracao,
    setReadOnly: setReadOnlyDeclaracao,
    setDeclaracao
  } = useDeclaracaoStore(state => state)

  const {
    setShowPedido,
    setReadOnly: setReadOnlyPedido,
    setPedido
  } = usePedidoStore(state => state)

  const {
    setShowExame,
    setReadOnly: setReadOnlyExame,
    setExame
  } = useExameStore(state => state)

  const {
    setShowAtestado,
    setReadOnly: setReadOnlyAtestado,
    setAtestado
  } = useAtestadoStore(state => state)

  const {
    setShowReceita,
    setReadOnly: setReadOnlyReceita,
    setReceita
  } = useReceitaStore(state => state)

  const { update, remove } = useFetch()

  async function handleChangeStatus(id, status = 'Agendado') {
    // eslint-disable-next-line no-unused-vars
    const [_, error] = await update(`/agendamentos/${id}`, { status })
    if (error) return
    setAgendamentos(
      agendamentos.map(agendamento =>
        agendamento?._id === id ? { ...agendamento, status } : agendamento
      )
    )
    setAgendamento({ ...agendamento, status })
    swal('Agendamento', 'Agendamento alterado com sucesso', 'success', {
      button: false,
      timer: 3000
    })
  }
  async function handleDelete(id) {
    const [data] = await remove(`/agendamentos/${id}`)
    if (!data) return
    setAgendamentos(agendamentos.filter(agendamento => agendamento._id !== id))
    swal('Sucesso!', 'Agendamento removido com sucesso', 'success', {
      timer: 3000,
      buttons: false
    })
    setShowAgendamento(false)
  }
  return (
    <Modal
      classNameModal="!max-w-5xl"
      open={showAgendamento}
      setOpen={setShowAgendamento}
    >
      <div className=" px-1 flex justify-center items-center">
        <div className="bg-white w-full max-w-5xl rounded-md py-5">
          <header className="w-full px-5 py-3 grid gap-2">
            <div className="w-full flex justify-between items-center">
              <h2 className="text-2xl text-secondary font-bold">
                {agendamento.codigo} - Agendamento
              </h2>
              <Icons.MdClose
                size={20}
                className="cursor-pointer"
                onClick={() => setShowAgendamento(false)}
              />
            </div>
            <div>
              <span className="font-bold text-gray-600">Período: </span>
              <span className="font-light text-sm">
                {isValid(parseISO(agendamento.inicio)) &&
                  format(
                    parseISO(agendamento.inicio),
                    "dd/MM/yyyy HH:mm  'até' "
                  )}
                {isValid(parseISO(agendamento.fim)) &&
                  format(parseISO(agendamento.fim), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
          </header>
          <hr />
          <ul className="px-5 overflow-auto scroll-pl-3 snap-mandatory snap-x scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-slate-50 flex gap-2">
            {menu
              .filter(item => {
                if (payload.developer) return true
                const whoami = payload.grupo?.administrador
                  ? 'administrador'
                  : payload.linked?._id
                  ? 'doctor'
                  : 'collaborator'
                return item[whoami]
              })
              .filter(item => {
                if (!item.inAgreement) {
                  return agendamento.convenio?.geraRecibo
                }
                return true
              })
              .map((item, index) => (
                <li
                  key={index}
                  onClick={() => setScreen(item.title)}
                  className={`flex snap-start snap-always justify-between items-center py-3 ${
                    screen === item.title
                      ? 'text-primary  border-b border-primary'
                      : 'text-gray-400'
                  }  hover:text-primary hover:border-b hover:border-primary  font-semibold  px-2 cursor-pointer`}
                >
                  {item.title}
                </li>
              ))}
          </ul>
          <hr />
          <div className="min-h-[400px]">
            <Agendamento />
            <Historico />
            <Recibos />
            <Laudos />
            <Financeiro />
            <Declaracoes />
            <Receitas />
            <Atestados />
            <Prontuarios />
            <Anexos />
            <Pedidos />
            <Exames />
          </div>
          <hr />
          <div className="flex w-full overflow-auto xl:justify-end px-5 pt-5 scrollbar gap-4">
            <ButtonAction
              show={
                agendamento.status !== 'Confirmado' &&
                screen === 'Agendamento' &&
                !['Cancelado', 'Realizado', 'Chegou'].includes(
                  agendamento.status
                ) &&
                (payload.developer || !payload.linked?._id)
              }
              onClick={() => handleChangeStatus(agendamento._id, 'Confirmado')}
              theme="text-primary border-primary"
              icon="FaCheck"
              title="Confirmou"
            />
            <ButtonAction
              show={
                agendamento.status === 'Confirmado' &&
                screen === 'Agendamento' &&
                !['Cancelado', 'Realizado'].includes(agendamento.status) &&
                (payload.developer || !payload.linked?._id)
              }
              onClick={() => handleChangeStatus(agendamento._id, 'Chegou')}
              theme="text-blue-700 border-blue-700"
              icon="FaUserCheck"
              title="Chegou"
            />
            <ButtonAction
              show={
                screen === 'Agendamento' &&
                !['Cancelado', 'Realizado'].includes(agendamento.status) &&
                (payload.developer || !payload.linked?._id)
              }
              onClick={() => handleChangeStatus(agendamento._id, 'Cancelado')}
              theme="text-red-700 border-red-700"
              icon="FaTimesCircle"
              title="Cancelou"
            />
            <ButtonAction
              show={
                screen === 'Agendamento' &&
                (payload.developer || payload.linked?._id)
              }
              onClick={() => handleChangeStatus(agendamento?._id, 'Realizado')}
              theme="text-teal-500 border-teal-500"
              icon="FaCheckDouble"
              title="Realizado"
            />
            <ButtonAction
              show={
                agendamento.status !== 'Confirmado' &&
                screen === 'Agendamento' &&
                !['Cancelado', 'Realizado'].includes(agendamento.status) &&
                (payload.developer || !payload.linked?._id)
              }
              onClick={() => {
                setShowAgendar(true)
                setShowAgendamento(false)
                setAgendamentoEdit(agendamento)
              }}
              theme="text-blue-700 border-blue-700"
              icon="FaEdit"
              title="Editar"
            />
            <ButtonAction
              show={
                agendamento.status !== 'Confirmado' &&
                screen === 'Agendamento' &&
                !['Cancelado', 'Realizado'].includes(agendamento.status) &&
                (payload.developer || !payload.linked?._id)
              }
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
                  handleDelete(agendamento._id)
                })
              }}
              theme="text-red-700 border-red-700"
              icon="FaTrash"
              title="Remover"
            />

            <ButtonAction
              show={screen === 'Declarações'}
              onClick={() => {
                setDeclaracao({})
                setReadOnlyDeclaracao(false)
                setShowDeclaracao(true)
              }}
              theme="text-sky-500 border-sky-500"
              icon="FaFileContract"
              title="Declaração"
            />

            <ButtonAction
              show={
                screen === 'Laudos' &&
                (payload.developer || payload.linked?._id)
              }
              onClick={() => {
                setLaudo({})
                setReadOnlyLaudo(false)
                setShowLaudo(true)
              }}
              theme="text-amber-500 border-amber-500"
              icon="FaFileMedical"
              title="Laudo"
            />

            <ButtonAction
              show={
                screen === 'Receitas' &&
                (payload.developer || payload.linked?._id)
              }
              onClick={() => {
                setReceita({})
                setReadOnlyReceita(false)
                setShowReceita(true)
              }}
              theme="text-pink-500 border-pink-500"
              icon="FaReceipt"
              title="Receita"
            />
            <ButtonAction
              show={
                screen === 'Atestados' &&
                (payload.developer || payload.linked?._id)
              }
              onClick={() => {
                setAtestado({})
                setReadOnlyAtestado(false)
                setShowAtestado(true)
              }}
              theme="text-fuchsia-500 border-fuchsia-500"
              icon="FaFileContract"
              title="Atestado"
            />
            <ButtonAction
              show={
                screen === 'Prontuários' &&
                (payload.developer || payload.linked?._id)
              }
              onClick={() => {
                setProntuario({})
                setReadOnlyProntuario(false)
                setShowProntuario(true)
              }}
              theme="text-emerald-500 border-emerald-500"
              icon="FaFile"
              title="Prontuário"
            />
            <ButtonAction
              show={
                screen === 'Anexos' &&
                (payload.developer || payload.linked?._id)
              }
              onClick={() => {
                setAnexo({})
                setShowAnexo(true)
              }}
              theme="text-slate-500 border-slate-500"
              icon="FaPaperclip"
              title="Anexo"
            />
            <ButtonAction
              show={
                screen === 'Pedidos' &&
                (payload.developer || payload.linked?._id)
              }
              onClick={() => {
                setPedido({})
                setReadOnlyPedido(false)
                setShowPedido(true)
              }}
              theme="text-amber-500 border-amber-500"
              icon="FaFileMedical"
              title="Pedido"
            />
            <ButtonAction
              show={
                screen === 'Exames' &&
                (payload.developer || payload.linked?._id)
              }
              onClick={() => {
                setExame({})
                setReadOnlyExame(false)
                setShowExame(true)
              }}
              theme="text-amber-500 border-amber-500"
              icon="FaFileMedical"
              title="Exame"
            />
          </div>
        </div>
        <ModalRecibo />
        <ModalLaudo />
        <ModalReceita />
        <ModalAtestado />
        <ModalProntuario />
        <ModalAnexo />
        <ModalPedido />
        <ModalExame />
        <ModalDeclaracao />
      </div>
    </Modal>
  )
}
