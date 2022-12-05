import { formatMoney } from '../../../../../utils'
import { parseISO, differenceInYears } from 'date-fns'
import * as Icon from 'react-icons/fa'
import { useEffect, useState } from 'react'
import {
  useAgendamentoStore,
  useAgendarStore
} from '../../../../../hooks/store'
import { useFetch } from '../../../../../hooks/useFetch'

export default function Agendamento() {
  const { fetch } = useFetch()
  const [classNameStatus, setClassNameStatus] = useState('')
  const [iconStatus, setIconStatus] = useState('')
  const { agendamento, screen } = useAgendamentoStore(state => state)
  const { setPaciente, setShowModalCadastroPaciente } = useAgendarStore()

  useEffect(() => {
    switch (agendamento.status) {
      case 'Agendado':
        setIconStatus(<Icon.FaExclamationCircle size={20} />)
        setClassNameStatus('bg-slate-400 text-white')
        break
      case 'Confirmado':
        setIconStatus(<Icon.FaCheck size={20} />)
        setClassNameStatus('bg-primary text-white')
        break
      case 'Chegou':
        setIconStatus(<Icon.FaUserCheck size={20} />)
        setClassNameStatus('bg-blue-700 text-white')
        break
      case 'Cancelado':
        setIconStatus(<Icon.FaTimesCircle size={20} />)
        setClassNameStatus('bg-red-500 text-white')
        break
      case 'Realizado':
        setIconStatus(<Icon.FaCheckDouble size={20} />)
        setClassNameStatus('bg-teal-500 text-white')
        break
      default:
        setClassNameStatus('')
        setIconStatus(<Icon.FaExclamationCircle size={20} />)
    }
  }, [agendamento])

  async function handleOpenEditPaciente(id) {
    const [paciente, error] = await fetch(`/pacientes/${id}`)
    if (error) return
    setPaciente(paciente)
    setShowModalCadastroPaciente(true)
  }
  return (
    <div
      className={`px-5 pb-8 pt-2 xl:grid-cols-2 gap-4 ${
        screen === 'Agendamento' ? 'xl:grid flex flex-col' : 'hidden'
      }`}
    >
      <div className="col-span-2">
        <span
          className={`p-3 w-full gap-4 flex justify-center items-center ${classNameStatus}`}
        >
          {iconStatus}
          {agendamento.status}
        </span>
      </div>
      <div className="col-span-2 grid xl:grid-cols-2 gap-2 w-full">
        <div className="flex justify-start gap-4 items-center">
          <div className="w-16 h-16 rounded-md border">
            <img
              src={agendamento.medico?.thumbnail || '/image/user.png'}
              alt={agendamento.medico?.nome}
              onError={e => {
                e.target.src = '/image/user.png'
              }}
              className="object-cover w-16 h-16  max-h-16 rounded-md shadow-md"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-600">Médico:</span>
            <span className="font-normal text-gray-600">
              {agendamento.medico?.nome || '-'}
            </span>
          </div>
        </div>
        <div className="flex justify-start gap-4 items-center">
          <div className="w-16 h-16 rounded-md border">
            <img
              src={agendamento.paciente?.thumbnail || '/image/user.png'}
              alt={agendamento.paciente?.nome}
              onError={e => {
                e.target.src = '/image/user.png'
              }}
              className="object-cover w-16 h-16  max-h-16 rounded-md shadow-md"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-600">
              Paciente: #{agendamento.paciente?.codigo}
            </span>
            <span className="font-normal truncate xl:w-full text-gray-600">
              {agendamento.paciente?.nome || '-'}
              {!isNaN(
                differenceInYears(
                  new Date(),
                  parseISO(agendamento.paciente?.dataNascimento)
                )
              ) &&
                ` (${differenceInYears(
                  new Date(),
                  parseISO(agendamento.paciente?.dataNascimento)
                )} anos)`}
            </span>
            <div>
              <button
                className="bg-primary hover:opacity-80 text-white shadow-md p-2 rounded-full"
                onClick={() => {
                  handleOpenEditPaciente(agendamento?.paciente._id)
                }}
              >
                <Icon.FaEdit size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="grid">
        <span className="font-semibold text-gray-600">Procedimento:</span>
        <span className="font-normal text-gray-600">
          {agendamento.procedimento?.descricaoProcedimento || '-'}
        </span>
      </div>
      <div
        className={` ${!agendamento.convenio.geraRecibo ? 'hidden' : 'grid'}`}
      >
        <span className="font-semibold text-gray-600">Valor:</span>
        <div>
          <span className="font-normal mr-2 text-gray-600">
            {agendamento.quantidade || 1}
          </span>
          <span className="font-normal mr-2 text-gray-600">X</span>
          <span className="font-normal text-gray-600">
            {formatMoney(
              parseInt(agendamento.procedimentoHonorario || 0) +
                parseInt(agendamento.procedimentoFilme || 0)
            )}{' '}
            = {formatMoney(agendamento.valor)}
          </span>
        </div>
      </div>
      <div className="grid">
        <span className="font-semibold text-gray-600">Convênio:</span>
        <span className="font-normal text-gray-600">
          {agendamento.convenio?.nome || '-'}
        </span>
      </div>
      <div className="grid">
        <span className="font-semibold text-gray-600">
          Número da Carteirinha:
        </span>
        <span className="font-normal text-gray-600">
          {agendamento?.numeroCarteira || '-'}
        </span>
      </div>
      <div className="grid">
        <span className="font-semibold text-gray-600">
          Responsável pelo Agendamento:
        </span>
        <span className="font-normal text-gray-600">
          {agendamento.responsavel || '-'}
        </span>
      </div>
      <div className="grid">
        <span className="font-semibold text-gray-600">
          Caráter do Agendamento:
        </span>
        <span className="font-normal text-gray-600">
          {agendamento.caraterAtendimento === 1
            ? 'Eletivo'
            : 'Urgência/Emergência'}
        </span>
      </div>

      <div className="grid">
        <span className="font-semibold text-gray-600">Observação:</span>
        <span className="font-normal text-gray-600">
          {agendamento.observacao || '-'}
        </span>
      </div>
    </div>
  )
}
