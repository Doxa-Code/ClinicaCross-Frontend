/* eslint-disable no-unused-vars */
import dynamic from 'next/dynamic'
import { Input, Select } from '../../../components/Form'
import { useEffect, useRef, useState } from 'react'
import Menu from '../../../components/Menu'
import 'suneditor/dist/css/suneditor.min.css'
import {
  variaveisAgendamentos,
  variaveisMedicamentos,
  variaveisMedicos,
  variaveisPacientes
} from '../../../data'
import { FaSave, FaTimes } from 'react-icons/fa'
import { useFetch } from '../../../hooks/useFetch'
import {
  getCookie,
  getFieldsValue,
  returnPage,
  setFieldsValue
} from '../../../utils'
import { createLogger } from '../../../hooks/store'
import swal from 'sweetalert'
import { useRouter } from 'next/router'
import { api } from '../../../services/api'

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false,
  loader: () => import('suneditor-react')
})

export default function ReceitasCadastro({ modelo = {} }) {
  const editor = useRef()
  const variavel = useRef()
  const logger = createLogger()
  const { create, update } = useFetch()
  const { replace } = useRouter()

  useEffect(() => {
    if (!modelo._id) return
    setFieldsValue(modelo)
  }, [modelo])

  function appendContents() {
    if (!variavel.current) return
    editor.current.insertHTML(variavel.current)
    variavel.current = null
    document.getElementById('variavelSelectPaciente').value = ''
    document.getElementById('variavelSelectAgendamento').value = ''
    document.getElementById('variavelSelectMedico').value = ''
    document.getElementById('variavelSelectMedicamentos').value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const fields = {
      ...getFieldsValue(e),
      tipo: 'Receita'
    }
    const [_, error] = modelo._id
      ? await update(`/modelos/${modelo._id}`, fields)
      : await create('/modelos', fields)

    if (error) {
      logger.error('Erro ao cadastrar receita', {
        module: 'Cadastro de receitas - handleSubmit',
        body: {
          fields
        }
      })
      return
    }

    swal('Sucesso!', ' ', 'success', {
      timer: 1000,
      buttons: false
    })

    replace('/modelos/receitas')
  }

  return (
    <Menu title="Cadastro de Modelo de Receita">
      <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-4">
        <Input title="Nome do modelo" name="nome" />
        <div className="grid grid-cols-4 gap-4">
          <Select
            onChange={e => (variavel.current = e.target.value)}
            id="variavelSelectPaciente"
            title="Variáveis do paciente"
          >
            {variaveisPacientes.map((variavel, index) => (
              <option value={variavel.name} key={index}>
                {variavel.label}
              </option>
            ))}
          </Select>
          <Select
            onChange={e => (variavel.current = e.target.value)}
            id="variavelSelectMedicamentos"
            title="Variáveis da receita"
          >
            {variaveisMedicamentos.map((variavel, index) => (
              <option value={variavel.name} key={index}>
                {variavel.label}
              </option>
            ))}
          </Select>
          <Select
            onChange={e => (variavel.current = e.target.value)}
            id="variavelSelectAgendamento"
            title="Variáveis do agendamento"
          >
            {variaveisAgendamentos.map((variavel, index) => (
              <option value={variavel.name} key={index}>
                {variavel.label}
              </option>
            ))}
          </Select>
          <Select
            onChange={e => (variavel.current = e.target.value)}
            id="variavelSelectMedico"
            title="Variáveis do médico"
          >
            {variaveisMedicos.map((variavel, index) => (
              <option value={variavel.name} key={index}>
                {variavel.label}
              </option>
            ))}
          </Select>
        </div>
        <SunEditor
          setDefaultStyle="font-family: Arial; font-size: 14px"
          name="corpo"
          defaultValue={modelo.corpo || ''}
          height={400}
          onClick={appendContents}
          getSunEditorInstance={sunEditor => {
            editor.current = sunEditor
          }}
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
        <div className="flex justify-end gap-2 items-center">
          <button className="flex text-sm justify-center items-center gap-3 bg-green-500 text-white p-3 rounded-md">
            <FaSave />
            Salvar
          </button>
          <button
            type="button"
            onClick={() => replace('/modelos/receitas')}
            className="flex text-sm justify-center items-center gap-3 bg-red-500 text-white p-3 rounded-md"
          >
            <FaTimes />
            Cancelar
          </button>
        </div>
      </form>
    </Menu>
  )
}
export async function getServerSideProps(ctx) {
  const logger = createLogger(ctx)
  const payload = getCookie(ctx, 'payload')
  if (!payload) {
    return returnPage(ctx)
  }
  const { id } = ctx.query

  if (!id) {
    return {
      props: {
        modelo: {}
      }
    }
  }
  try {
    const response = await api.get(`/modelos/${id}`)
    if (!response) {
      throw new Error('Houve um erro ao carregar os dados!')
    }

    return {
      props: {
        modelo: response.data
      }
    }
  } catch (err) {
    logger.error(err.response.data || err.message, {
      module: 'Cadastro de Modelos Receitas - SSR'
    })
    return {
      props: {
        modelo: {}
      }
    }
  }
}
