/* eslint-disable indent */
import { useEffect } from 'react'
import Modal from '../../Modal'
import { registerLocale } from 'react-datepicker'
import pt from 'date-fns/locale/pt-BR'
import * as Icon from 'react-icons/fa'
import { useAgendarStore } from '../../../hooks/store'
import FormBloqueio from './components/FormBloqueio'
import FormAgendamento from './components/FormAgendamento'

export default function ModalAgendar() {
  const {
    showAgendar,
    agendamentoEdit,
    bloqueio,
    setInicio,
    setFim,
    setShowAgendar,
    setAgendamentoEdit,
    setBloqueio
  } = useAgendarStore()

  useEffect(() => {
    if (!showAgendar) {
      setInicio('')
      setFim('')
      setAgendamentoEdit({})
      setBloqueio(false)
    }
  }, [showAgendar])

  useEffect(() => {
    registerLocale('pt-BR', pt)
  }, [])

  return (
    <Modal
      classNameModal="overflow-auto min-h-[500px] "
      closeWithEsc
      open={showAgendar}
      setOpen={setShowAgendar}
    >
      <div className="w-full px-3 py-5 flex justify-start scrollbar-thin items-start flex-1">
        <div className="bg-white w-full max-w-6xl rounded-md flex flex-col">
          <div className="w-full px-5 py-2">
            <div className="flex mb-2 justify-between items-center pr-2">
              <h2 className="text-xl text-gray-500 font-semibold">
                {bloqueio
                  ? 'Bloquear Horário'
                  : agendamentoEdit._id
                  ? 'Alterar Agendamento'
                  : 'Novo Agendamento'}
              </h2>
              <Icon.FaTimes
                size={20}
                className="cursor-pointer text-gray-400"
                onClick={() => setShowAgendar(false)}
              />
            </div>
            <hr />
          </div>
          <div className="px-5">
            {bloqueio ? <FormBloqueio /> : <FormAgendamento />}
          </div>
        </div>
      </div>
    </Modal>
  )
}
