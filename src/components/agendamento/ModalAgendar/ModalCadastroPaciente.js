import Modal from '../../Modal'
import CadastroPaciente from '../../../pages/pacientes/cadastro'
import * as Icons from 'react-icons/fa'
import { useAgendarStore } from '../../../hooks/store'

export default function ModalCadastroPaciente() {
  const {
    setPaciente,
    paciente,
    medicos,
    convenios,
    showModalCadastroPaciente,
    setShowModalCadastroPaciente
  } = useAgendarStore()

  return (
    <Modal
      open={showModalCadastroPaciente}
      setOpen={setShowModalCadastroPaciente}
      closeWithEsc
      className="!z-50"
    >
      <div className="bg-white grid h-screen scrollbar max-h-[800px] overflow-auto w-full max-w-[1300px] gap-4 p-5 rounded-md">
        <div className="flex mb-2 justify-end items-center px-2 pt-3">
          <Icons.FaTimes
            size={20}
            className="cursor-pointer text-gray-400"
            onClick={() => setShowModalCadastroPaciente(false)}
          />
        </div>
        <CadastroPaciente
          modal
          paciente={paciente || {}}
          cancelFunction={() => setShowModalCadastroPaciente(false)}
          successFunction={response => {
            setPaciente(response)
            setShowModalCadastroPaciente(false)
          }}
          medicos={medicos}
          convenios={convenios}
        />
      </div>
    </Modal>
  )
}
