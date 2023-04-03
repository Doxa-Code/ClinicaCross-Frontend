/* eslint-disable prettier/prettier */
import Modal from '../../../Modal'
import dynamic from 'next/dynamic'
import * as Icons from 'react-icons/md'
import { useState, useEffect } from 'react'
import {
  useAtestadoStore,
  useAgendamentoStore,
  usePayloadStore,
  useMenuStore
} from '../../../../hooks/store'
import { useFetch } from '../../../../hooks/useFetch'
import { Input, Select } from '../../../Form'
import 'suneditor/dist/css/suneditor.min.css'
import { getFieldsValue, setFieldsValue, StringInject } from '../../../../utils'
import { variaveisAgendamentos, variaveisMedicos, variaveisPacientes } from '../../../../data'

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
})

export default function ModalAtestado() {
  const { setShowAtestado, showAtestado, atestado, readOnly, modelosAtestado } = useAtestadoStore(state => state)
  const { setStateLoading } = useMenuStore()
  const { setAgendamento, agendamento } = useAgendamentoStore(state => state)
  const { create } = useFetch()
  const { payload } = usePayloadStore(state => state)
  const [data, mutate] = useState('')

  useEffect(() => {
    setFieldsValue(atestado)
    mutate(atestado?.data)
  }, [atestado])

  async function handleSubmit(e) {
    e.preventDefault()
    setStateLoading(true)
    const fields = getFieldsValue(e)
    const [response, error] = await create(
      `/pacientes/atestado/${agendamento.paciente._id}`,
      {
        ...fields,
        responsavel: payload._id,
        data
      }
    )
    if (error) return setStateLoading(false)

    setAgendamento({
      ...agendamento,
      paciente: {
        ...agendamento.paciente,
        atestado: response
      }
    })
    setStateLoading(false)
    setShowAtestado(false)
  }

  function handleLoadAtestado() {
    const fieldsModeloAtestado = document.getElementById('selectModeloAtestado')
    if (!fieldsModeloAtestado) return
    const modeloAtestado = modelosAtestado.find(modelo => modelo._id === fieldsModeloAtestado.value)
    if (!modeloAtestado) return
    const atestadoLoaded = [
      {
        variables: variaveisAgendamentos,
        fields: agendamento
      },
      {
        variables: variaveisPacientes,
        fields: agendamento.paciente
      },
      {
        variables: variaveisMedicos,
        fields: agendamento.medico
      }
    ].reduce((acc, item) => {
      return StringInject(acc, item.variables, item.fields)
    }, modeloAtestado?.corpo)
    mutate(atestadoLoaded)
  }

  return (
    <Modal closeWithEsc open={showAtestado} setOpen={setShowAtestado}>
      <div className="bg-white w-full max-w-4xl rounded-xl justify-center items-end">
        <div className="flex justify-between items-center p-5 rounded-t-xl text-fuchsia-400 border-b border-fuchsia-400">
          <span className="text-2xl font-semibold">
            {readOnly ? 'Visualizar Atestado' : 'Novo Atestado'}
          </span>
          <Icons.MdClose
            size={20}
            className="cursor-pointer"
            onClick={() => setShowAtestado(false)}
          />
        </div>
        <form className="px-5 py-4 grid gap-4" onSubmit={handleSubmit}>
          <div
            className={`flex text-zinc-600 gap-2 flex-col ${!readOnly && 'hidden'}`}
          >
            <div className="grid">
              <b className="text-sm text-zinc-400">Titulo</b>
              <span className="text-xl">{atestado.titulo}</span>
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
          <Select id="selectModeloAtestado" onChange={handleLoadAtestado} title="Modelo" className={readOnly && 'hidden'}>
            {modelosAtestado.map(modelo => (
              <option value={modelo._id} key={modelo._id}>
                {modelo.nome}
              </option>
            ))}
          </Select>
          <SunEditor
            readOnly={readOnly}
            setDefaultStyle="font-family: Poppins; font-size: 16px"
            setContents={data}
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
