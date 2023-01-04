/* eslint-disable prettier/prettier */
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
import { Input, Select } from '../../../Form'
import { getFieldsValue, setFieldsValue, StringInject } from '../../../../utils'
import { variaveisAgendamentos, variaveisMedicos, variaveisPacientes } from '../../../../data'

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
})

export default function ModalProntuario() {
  const {
    setShowProntuario,
    showProntuario,
    prontuario,
    readOnly,
    modelosProntuarios
  } = useProntuarioStore(state => state)
  const { setAgendamento, agendamento } = useAgendamentoStore(state => state)
  const { create } = useFetch()
  const { payload } = usePayloadStore(state => state)
  const [data, mutate] = useState('')

  useEffect(() => {
    setFieldsValue(prontuario)
    mutate(prontuario.data || '')
  }, [prontuario])

  async function handleSubmit(e) {
    e.preventDefault()
    const fields = getFieldsValue(e)
    const [response, error] = await create(
      `/pacientes/prontuario/${agendamento.paciente._id}`,
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
        prontuario: response
      }
    })
    mutate('')
    setShowProntuario(false)
  }

  function handleLoadProntuario() {
    const fieldsModeloProntuario = document.getElementById('selectModeloProntuario')
    if (!fieldsModeloProntuario) return
    const modeloProntuario = modelosProntuarios.find(modelo => modelo._id === fieldsModeloProntuario.value)
    const prontuarioLoaded = [
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
    }, modeloProntuario.corpo)
    mutate(prontuarioLoaded)
  }

  return (
    <Modal closeWithEsc open={showProntuario} setOpen={setShowProntuario}>
      <div className="bg-white w-full max-w-4xl rounded-xl justify-center items-end h-screen overflow-auto">
        <div className="flex justify-between items-center p-5 rounded-t-xl text-pink-500 border-b border-pink-500">
          <span className="text-2xl font-semibold">
            {readOnly ? 'Visualizar Prontuario' : 'Nova Prontuario'}
          </span>
          <Icons.MdClose
            size={20}
            className="cursor-pointer"
            onClick={() => setShowProntuario(false)}
          />
        </div>
        <form className="px-5 py-4 grid gap-4" onSubmit={handleSubmit}>
          <div
            className={`flex text-zinc-600 gap-2 flex-col ${
              !readOnly && 'hidden'
            }`}
          >
            <div className="grid">
              <b className="text-zinc-400 text-sm">Titulo</b>
              <span className="text-xl">{prontuario.titulo}</span>
            </div>
            <div className="grid">
              <b className="text-zinc-400 text-sm">Paciente</b>
              <span className="text-xl">{agendamento.paciente?.nome}</span>
            </div>
          </div>
          <Input
            className={readOnly && 'hidden'}
            name="titulo"
            title="Titulo"
            required
          />
          <Select id="selectModeloProntuario" onChange={handleLoadProntuario} title="Modelo" className={readOnly && 'hidden'}>
            {modelosProntuarios.map(modelo => (
              <option value={modelo._id} key={modelo._id}>
                {modelo.nome}
              </option>
            ))}
          </Select>
          <div className="grid gap-1">
            <SunEditor
              setContents={data}
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
          </div>
          {!readOnly && (
            <div className="flex justify-end">
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
      </div>
    </Modal>
  )
}
