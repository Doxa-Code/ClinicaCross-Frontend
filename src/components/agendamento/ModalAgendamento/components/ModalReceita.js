/* eslint-disable prettier/prettier */
import Modal from '../../../Modal'
import dynamic from 'next/dynamic'
import * as Icons from 'react-icons/md'
import { useState, useEffect } from 'react'
import {
  useReceitaStore,
  useAgendamentoStore,
  usePayloadStore
} from '../../../../hooks/store'
import { useFetch } from '../../../../hooks/useFetch'
import { Input, Select, SelectSearch } from '../../../Form'
import { getFieldsValue, setFieldsValue, StringInject } from '../../../../utils'
import { variaveisAgendamentos, variaveisMedicamentos, variaveisMedicos, variaveisPacientes } from '../../../../data'

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
})

export default function ModalReceita() {
  const {
    setShowReceita,
    showReceita,
    receita,
    readOnly,
    medicamentos,
    modelosReceita
  } = useReceitaStore(state => state)
  const { setAgendamento, agendamento } = useAgendamentoStore(state => state)
  const { create } = useFetch()
  const { payload } = usePayloadStore(state => state)
  const [data, mutate] = useState('')
  const [medicamentosSelected, setMedicamentosSelected] = useState([])

  useEffect(() => {
    setFieldsValue(receita)
    mutate(receita.data || '')
  }, [receita])

  async function handleSubmit(e) {
    e.preventDefault()
    const fields = getFieldsValue(e)
    const [response, error] = await create(
      `/pacientes/receita/${agendamento.paciente._id}`,
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
        receita: response
      }
    })
    mutate('')
    setMedicamentosSelected([])
    setShowReceita(false)
  }

  function handleLoadReceita() {
    const medicamentosList = medicamentosSelected.map(medicamentoId =>
      medicamentos.find(
        medicamento => medicamento._id.toString() === medicamentoId
      )
    )
    const fieldsModeloReceita = document.getElementById('selectModeloReceita')
    if (!fieldsModeloReceita || !medicamentosList) return
    const modeloReceita = modelosReceita.find(modelo => modelo._id === fieldsModeloReceita.value)
    const receitaLoaded = [
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
      },
      {
        variables: variaveisMedicamentos,
        fields: medicamentosList.reduce((acc, medicamento) => {
          acc.descricao = `${acc.descricao || ""}<br/>${medicamento.descricao}`
          return acc
        }, {})
      }
    ].reduce((acc, item) => {
      return StringInject(acc, item.variables, item.fields)
    }, modeloReceita.corpo)
    mutate(receitaLoaded)
  }

  return (
    <Modal closeWithEsc open={showReceita} setOpen={setShowReceita}>
      <div className="bg-white w-full max-w-4xl rounded-xl justify-center items-end">
        <div className="flex justify-between items-center p-5 rounded-t-xl text-pink-500 border-b border-pink-500">
          <span className="text-2xl font-semibold">
            {readOnly ? 'Visualizar Receita' : 'Nova Receita'}
          </span>
          <Icons.MdClose
            size={20}
            className="cursor-pointer"
            onClick={() => setShowReceita(false)}
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
              <span className="text-xl">{receita.titulo}</span>
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
          <Select id="selectModeloReceita" title="Modelo" className={readOnly && 'hidden'}>
            {modelosReceita.map(modelo => (
              <option value={modelo._id} key={modelo._id}>
                {modelo.nome}
              </option>
            ))}
          </Select>
          <div className={`grid gap-1 ${readOnly && 'hidden'}`}>
            <SelectSearch
              multiple
              title="Lista de medicamentos"
              options={medicamentos.map(medicamento => ({
                label: medicamento.nome,
                value: medicamento._id
              }))}
              className="z-30"
              values={medicamentosSelected}
              onChange={setMedicamentosSelected}
            />
          </div>
          <div
            className={`flex justify-end items-center ${readOnly && 'hidden'}`}
          >
            <button
              onClick={handleLoadReceita}
              type="button"
              className="flex items-center justify-center gap-2 bg-pink-500 p-3 text-sm rounded-md text-white hover:opacity-90"
            >
              <Icons.MdFileUpload size={16} />
              Carregar prescrição
            </button>
          </div>
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
