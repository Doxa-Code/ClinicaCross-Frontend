/* eslint-disable prettier/prettier */
import Modal from '../../../Modal'
import dynamic from 'next/dynamic'
import * as Icons from 'react-icons/md'
import { useState, useEffect } from 'react'
import {
  useAgendamentoStore,
  usePayloadStore,
  useDeclaracaoStore
} from '../../../../hooks/store'
import { useFetch } from '../../../../hooks/useFetch'
import { Input, Select } from '../../../Form'
import 'suneditor/dist/css/suneditor.min.css'
import { getFieldsValue, setFieldsValue, StringInject } from '../../../../utils'
import { variaveisAgendamentos, variaveisMedicos, variaveisPacientes } from '../../../../data'

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
})

export default function ModalDeclaracao() {
  const { setShowDeclaracao, showDeclaracao, declaracao, readOnly, modelosDeclaracoes } =
    useDeclaracaoStore(state => state)
  const { setAgendamento, agendamento } = useAgendamentoStore(state => state)
  const { create } = useFetch()
  const { payload } = usePayloadStore(state => state)
  const [data, mutate] = useState('')

  useEffect(() => {
    setFieldsValue(declaracao)
    mutate(declaracao?.data)
  }, [declaracao])

  async function handleSubmit(e) {
    e.preventDefault()
    const fields = getFieldsValue(e)
    const [response, error] = await create(
      `/pacientes/declaracao/${agendamento.paciente._id}`,
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
        declaracao: response
      }
    })
    setShowDeclaracao(false)
  }

  function handleLoadDeclaracao() {
    const fieldsModeloDeclaracao = document.getElementById('selectModeloDeclaracao')
    if (!fieldsModeloDeclaracao) return
    const modeloDeclaracao = modelosDeclaracoes.find(modelo => modelo._id === fieldsModeloDeclaracao.value)
    if (!modeloDeclaracao) return
    const declaracaoLoaded = [
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
    }, modeloDeclaracao?.corpo)
    mutate(declaracaoLoaded)
  }

  return (
    <Modal closeWithEsc open={showDeclaracao} setOpen={setShowDeclaracao}>
      <div className="bg-white w-full max-w-4xl rounded-xl justify-center items-end">
        <div className="flex justify-between items-center p-5 rounded-t-xl text-sky-400 border-b border-sky-400">
          <span className="text-2xl font-semibold">
            {readOnly ? 'Visualizar Declaração' : 'Nova Declaração'}
          </span>
          <Icons.MdClose
            size={20}
            className="cursor-pointer"
            onClick={() => setShowDeclaracao(false)}
          />
        </div>
        <form className="px-5 py-4 grid gap-4" onSubmit={handleSubmit}>
          <div
            className={`flex text-zinc-600 gap-2 flex-col ${
              !readOnly && 'hidden'
            }`}
          >
            <div className="grid">
              <b className="text-sm text-zinc-400">Titulo</b>
              <span className="text-xl">{declaracao.titulo}</span>
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
          <Select id="selectModeloDeclaracao" onChange={handleLoadDeclaracao} title="Modelo" className={readOnly && 'hidden'}>
            {modelosDeclaracoes.map(modelo => (
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
