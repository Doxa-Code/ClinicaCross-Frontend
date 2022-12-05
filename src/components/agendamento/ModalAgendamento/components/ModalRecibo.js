import Modal from '../../../Modal'
import dynamic from 'next/dynamic'
import * as Icons from 'react-icons/md'
import { useState, useEffect } from 'react'
import { getRecibo } from '../../../../data'
import {
  useReciboStore,
  useAgendamentoStore,
  usePayloadStore
} from '../../../../hooks/store'
import { useFetch } from '../../../../hooks/useFetch'
import 'suneditor/dist/css/suneditor.min.css'
import swal from '@sweetalert/with-react'

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
})

export default function ModalRecibo() {
  const { recibo, showRecibo, readOnly, setShowRecibo } = useReciboStore(
    state => state
  )
  const { create } = useFetch()
  const { setAgendamento, agendamento } = useAgendamentoStore(state => state)
  const { payload } = usePayloadStore(state => state)
  const [data, mutate] = useState('')

  useEffect(() => {
    mutate(readOnly ? recibo.data : getRecibo(recibo))
  }, [recibo])

  async function handleSubmit() {
    const [reciboData, error] = await create(
      `/agendamentos/recibo/${recibo._id}`,
      {
        responsavel: payload._id,
        data
      }
    )
    if (error) return
    setAgendamento({
      ...agendamento,
      recibo: reciboData
    })
    setShowRecibo(false)
    swal('Sucesso!', 'Recibo salvo com sucesso!', 'success', {
      timer: 3000,
      buttons: false
    })
  }

  return (
    <Modal closeWithEsc open={showRecibo} setOpen={setShowRecibo}>
      <div className="bg-white w-full max-w-4xl rounded-xl justify-center items-end">
        <div className="flex justify-between items-center p-5 rounded-t-xl text-blue-500 border-b border-blue-500">
          <span className="text-2xl font-semibold">
            {readOnly ? 'Visualizar Recibo' : 'Novo recibo'}
          </span>
          <Icons.MdClose
            size={20}
            className="cursor-pointer"
            onClick={() => setShowRecibo(false)}
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
              onClick={() => handleSubmit()}
              className="flex justify-center items-center gap-4 bg-green-500 p-2 text-white rounded"
            >
              <Icons.MdSave size={20} />
              Salvar
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
