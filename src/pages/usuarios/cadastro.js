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
import { Input, Span, ToggleButton, Select } from '../../components/Form'
import { useFetch } from '../../hooks/useFetch'

export default function UsuariosCadastro({
  line = {},
  grupos = [],
  medicos = []
}) {
  const { replace } = useRouter()
  const { create, update } = useFetch()
  const [loading, setLoading] = useState(false)
  const [ativo, setAtivo] = useState(false)
  const [user, setUser] = useState('')

  useEffect(() => {
    if (Object.keys(line).length > 0) {
      setFieldsValue({
        ...line,
        grupo: line.grupo?._id || '',
        linked: line.linked?._id || ''
      })
      setAtivo(line.ativo)
      setUser(line.user)
    }
  }, [line])

  async function handleSubmit(e) {
    setLoading(true)
    e.preventDefault()
    const fields = getFieldsValue(e)
    if (!fields.password) {
      delete fields.password
    }
    const body = {
      ...line,
      ...fields,
      ativo
    }
    // eslint-disable-next-line no-unused-vars
    const [_, error] = line._id
      ? await update(`/users/${line._id}`, body)
      : await create('/users', body)

    if (error) return

    swal('Sucesso!', ' ', 'success', {
      timer: 1000,
      buttons: false
    })

    replace('/usuarios')
  }

  return (
    <Menu stateLoading={loading} title="Cadastro de usuário">
      <form className="px-5 xl:px-10 py-5" onSubmit={handleSubmit}>
        <div className="py-5 flex flex-col xl:grid xl:grid-cols-4 gap-4">
          <Input title="Nome" required name="nome" className="col-span-4" />
          <Input
            title="Nome de usuário"
            name="user"
            onChange={e => setUser(e.target.value.toString().toLowerCase())}
            value={user}
          />
          <Input title="Senha" name="password" type="password" />
          <Select title="Grupo" name="grupo">
            {grupos.map(grupo => (
              <option key={grupo._id} value={grupo._id}>
                {grupo.nome}
              </option>
            ))}
          </Select>
          <Select title="Vincular a agenda" name="linked">
            {medicos.map(medico => (
              <option key={medico._id} value={medico._id}>
                {medico.nome}
              </option>
            ))}
          </Select>
          <div className="flex justify-start items-center  gap-4">
            <Span>Ativo?</Span>
            <ToggleButton
              defaultValue={ativo}
              onSelected={setAtivo}
              name="ativo"
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
            onClick={() => replace('/usuarios')}
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
    const response = id ? await api.get(`/users/${id}`) : { data: {} }
    const grupos = await api.get('/grupos')
    const medicos = await api.get('/medicos')
    return {
      props: {
        line: response.data,
        grupos: grupos.data,
        medicos: medicos.data
      }
    }
  } catch (err) {
    console.log(err)
    return {
      props: {
        line: {},
        grupos: [],
        medicos: []
      }
    }
  }
}
