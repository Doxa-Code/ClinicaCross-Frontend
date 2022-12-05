/* eslint-disable prettier/prettier */
import Modal from '../../../Modal'
import dynamic from 'next/dynamic'
import * as Icons from 'react-icons/md'
import { useState, useEffect } from 'react'
import {
  useLaudoStore,
  useAgendamentoStore,
  usePayloadStore
} from '../../../../hooks/store'
import { useFetch } from '../../../../hooks/useFetch'
import { Input } from '../../../Form'
import 'suneditor/dist/css/suneditor.min.css'
import { getFieldsValue, setFieldsValue } from '../../../../utils'

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
})

export default function ModalLaudo() {
  const { setShowLaudo, showLaudo, laudo, readOnly } = useLaudoStore(state => state)
  const { setAgendamento, agendamento } = useAgendamentoStore(state => state)
  const { create } = useFetch()
  const { payload } = usePayloadStore(state => state)
  const [data, mutate] = useState('')

  useEffect(() => {
    setFieldsValue(laudo)
    mutate(laudo?.data)
  }, [laudo])

  async function handleSubmit(e) {
    e.preventDefault()
    const fields = getFieldsValue(e)
    const [response, error] = await create(
      `/pacientes/laudo/${agendamento.paciente._id}`,
      {
        ...fields,
        responsavel: payload._id,
        data
      }
    )
    if (error) return

    setAgendamento({
      ...agendamento,
      paciente: {
        ...agendamento.paciente,
        laudo: response
      }
    })
    setShowLaudo(false)
  }

  return (
    <Modal closeWithEsc open={showLaudo} setOpen={setShowLaudo}>
      <div className="bg-white w-full max-w-4xl rounded-xl justify-center items-end">
        <div className="flex justify-between items-center p-5 rounded-t-xl text-amber-400 border-b border-amber-400">
          <span className="text-2xl font-semibold">
            {readOnly ? 'Visualizar Laudo' : 'Novo Laudo'}
          </span>
          <Icons.MdClose
            size={20}
            className="cursor-pointer"
            onClick={() => setShowLaudo(false)}
          />
        </div>
        <form className="px-5 py-5 grid gap-4" onSubmit={handleSubmit}>
          <div
            className={`flex text-zinc-600 gap-2 flex-col ${!readOnly && 'hidden'}`}
          >
            <div className="grid">
              <b className="text-sm text-zinc-400">Titulo</b>
              <span className="text-xl">{laudo.titulo}</span>
            </div>
            <div className="grid">
              <b className="text-sm text-zinc-400">Paciente</b>
              <span className="text-xl">{agendamento.paciente?.nome}</span>
            </div>
          </div>
          <Input
            className={readOnly && 'hidden'}
            name="titulo"
            title="Titulo"
          />
          <SunEditor
            readOnly={readOnly}
            setDefaultStyle="font-family: Poppins; font-size: 16px"
            defaultValue={data}
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
            <div className="flex justify-end">
              <button
                disabled={!data}
                className="flex justify-center items-center gap-4 bg-green-500 p-2 text-white rounded">
                <Icons.MdSave size={20} />
                Salvar
              </button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  )
}
