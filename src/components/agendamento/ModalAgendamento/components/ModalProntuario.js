import Modal from '../../../Modal'
import dynamic from 'next/dynamic'
import * as Icons from 'react-icons/md'
import { useState, useEffect } from 'react'
import {
  useProntuarioStore,
  useAgendamentoStore,
  usePayloadStore
} from '../../../../hooks/store'
import { useFetch } from '../../../../hooks/useFetch'
import 'suneditor/dist/css/suneditor.min.css'

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
})

export default function ModalProntuario() {
  const { prontuario, showProntuario, readOnly, setShowProntuario } =
    useProntuarioStore(state => state)
  const { create } = useFetch()
  const { setAgendamento, agendamento } = useAgendamentoStore(state => state)
  const { payload } = usePayloadStore(state => state)
  const [data, mutate] = useState('')

  useEffect(() => {
    mutate(prontuario.data)
  }, [prontuario])

  async function handleSubmit(e) {
    e.preventDefault()
    const [prontuarioData, error] = await create(
      `/pacientes/prontuario/${agendamento.paciente._id}`,
      {
        responsavel: payload._id,
        data
      }
    )
    if (error) return
    setAgendamento({
      ...agendamento,
      paciente: {
        ...agendamento.paciente,
        prontuario: prontuarioData
      }
    })
    setShowProntuario(false)
  }

  return (
    <Modal closeWithEsc open={showProntuario} setOpen={setShowProntuario}>
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-4xl rounded-xl justify-center items-end"
      >
        <div className="flex justify-between items-center p-5 rounded-t-xl text-emerald-500 border-b border-emerald-500">
          <span className="text-2xl font-semibold">
            {readOnly ? 'Visualizar Prontuário' : 'Novo Prontuário'}
          </span>
          <Icons.MdClose
            size={20}
            className="cursor-pointer"
            onClick={() => setShowProntuario(false)}
          />
        </div>

        <SunEditor
          readOnly={readOnly}
          setDefaultStyle="font-family: Poppins; font-size: 16px"
          setContents={data}
          name="data"
          height={300}
          onChange={mutate}
          setOptions={{
            buttonList: [
              ['undo', 'redo'],
              ['font', 'fontSize', 'formatBlock'],
              [
                'bold',
                'underline',
                'italic',
                'strike',
                'subscript',
                'superscript'
              ],
              ['removeFormat'],
              '/',
              ['fontColor', 'hiliteColor'],
              ['outdent', 'indent'],
              ['align', 'horizontalRule', 'list', 'table'],
              ['link', 'image', 'video'],
              ['showBlocks', 'codeView'],
              ['preview', 'print']
            ]
          }}
        />
        {!readOnly && (
          <div className="p-4 flex justify-end">
            <button
              disabled={!data}
              className="flex justify-center items-center gap-4 bg-green-500 p-2 text-white rounded"
            >
              <Icons.MdSave size={20} />
              Salvar
            </button>
          </div>
        )}
      </form>
    </Modal>
  )
}
