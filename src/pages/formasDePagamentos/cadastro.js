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
import { Input, Select } from '../../components/Form'

export default function FormaDePagamentosCadastro({ line = {} }) {
  const { replace } = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (Object.keys(line).length > 0) {
      setFieldsValue(line)
    }
  }, [line])

  async function handleSubmit(e) {
    setLoading(true)
    e.preventDefault()
    const body = getFieldsValue(e)
    try {
      const update = Object.keys(line).length > 0
      const response = await api({
        url: update ? `/formaDePagamentos/${line._id}` : '/formaDePagamentos',
        method: update ? 'put' : 'post',
        data: {
          ...line,
          ...body
        }
      })
      if (!response) {
        throw new Error(
          'Houve um erro ao tentar cadastrar! tente novamente mais tarde!'
        )
      }

      swal('Sucesso!', ' ', 'success', {
        timer: 1000,
        buttons: false
      })

      replace('/formasDePagamentos')
    } catch (err) {
      setLoading(false)
      if (err.response) {
        return swal('Espere', `${err.response.data}`, 'error')
      }
      swal('Espere!', `${err.message}`, 'error')
    }
  }

  return (
    <Menu stateLoading={loading} title="Cadastro de formas de pagamentos">
      <form className="xl:px-10 px-5 py-5" onSubmit={handleSubmit}>
        <div>
          <div className="py-5 flex flex-col xl:grid xl:grid-cols-3 gap-4">
            <Input title="Descrição" name="nome" className="col-span-2" />
            <Select title="Parcela?" name="divide">
              <option value={true}>Sim</option>
              <option value={false}>Não</option>
            </Select>
          </div>
        </div>

        <div className="flex w-full sm:flex-row flex-col justify-end py-7 gap-3">
          <button className="flex bg-primary justify-center items-center text-white gap-3 px-5 py-2 rounded-md text-sm">
            <Icons.FaCheck size={16} />
            Cadastrar
          </button>
          <button
            type="button"
            onClick={() => replace('/formasDePagamentos')}
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
    const response = id
      ? await api.get(`/formaDePagamentos/${id}`)
      : { data: {} }
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
