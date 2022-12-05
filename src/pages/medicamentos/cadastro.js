import { useState, useEffect } from 'react'
import * as Icons from 'react-icons/fa'
import Menu from '../../components/Menu'
import { api } from '../../services/api'
import {
  getCookie,
  returnPage,
  getFieldsValue,
  setFieldsValue
} from '../../utils'
import { useRouter } from 'next/router'
import swal from '@sweetalert/with-react'
import { Input, Span } from '../../components/Form'
import { useFetch } from '../../hooks/useFetch'
import dynamic from 'next/dynamic'
import 'suneditor/dist/css/suneditor.min.css'

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
})

export default function FormaDePagamentosCadastro({ line = {} }) {
  const { replace } = useRouter()
  const { create, update } = useFetch()
  const [loading, setLoading] = useState(false)
  const [descricao] = useState(
    line.descricao ||
      `
      <div><span style="font-size: 16px;"><strong>Medicamento</strong>.......................................................................Uso</span></div>
      <div><span style="font-size: 12px;">Tipo</span></div>
    `
  )

  useEffect(() => {
    if (Object.keys(line).length > 0) {
      setFieldsValue(line)
    }
  }, [line])

  async function handleSubmit(e) {
    setLoading(true)
    e.preventDefault()
    const fields = getFieldsValue(e)
    const body = {
      ...line,
      ...fields
    }
    // eslint-disable-next-line no-unused-vars
    const [data, error] = line._id
      ? await update(`/medicamentos/${line._id}`, body)
      : await create('/medicamentos', body)

    if (error) return

    swal('Sucesso!', ' ', 'success', {
      timer: 1000,
      buttons: false
    })

    replace('/medicamentos')
  }

  return (
    <Menu stateLoading={loading} title="Cadastro de medicamentos">
      <form className="px-5 xl:px-10 py-5" onSubmit={handleSubmit}>
        <div className="py-5 flex flex-col xl:grid xl:grid-cols-3 gap-4">
          <Input title="Código do medicamento" name="codigo" />
          <Input title="Nome do medicamento" name="nome" />
          <Input title="Tipo de medicamento" name="tipo" />
        </div>
        <div className="grid gap-4">
          <Span>Prescrição receita</Span>
          <div className="overflow-auto">
            <SunEditor
              setDefaultStyle="font-family: Poppins;"
              name="descricao"
              defaultValue={descricao}
              height={500}
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
        </div>
        <div className="flex w-full sm:flex-row flex-col justify-end py-7 gap-3">
          <button className="flex bg-primary justify-center items-center text-white gap-3 px-5 py-2 rounded-md text-sm">
            <Icons.FaCheck size={16} />
            Cadastrar
          </button>
          <button
            type="button"
            onClick={() => replace('/medicamentos')}
            className="flex bg-red-700 justify-center items-center text-white gap-3 px-5 py-2 rounded-md text-sm"
          >
            <Icons.FaTimes size={16} />
            Cancelar
          </button>
        </div>
      </form>
    </Menu>
  )
}

export async function getServerSideProps(ctx) {
  const payload = getCookie(ctx, 'payload')
  if (!payload) {
    return returnPage(ctx)
  }
  try {
    const { id } = ctx.query
    const response = id ? await api.get(`/medicamentos/${id}`) : { data: {} }
    return {
      props: {
        line: response.data
      }
    }
  } catch (err) {
    console.log(err)
    return {
      props: {
        line: {}
      }
    }
  }
}
