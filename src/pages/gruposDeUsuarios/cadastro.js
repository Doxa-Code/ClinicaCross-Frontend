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
import { Input, Span, ToggleButton } from '../../components/Form'
import { useFetch } from '../../hooks/useFetch'
import { menuData } from '../../data'

export default function GruposCadastro({ grupoCadastro = {} }) {
  const { replace } = useRouter()
  const { create, update } = useFetch()
  const [loading, setLoading] = useState(false)
  const [adm, setAdm] = useState(false)
  const [bloqueiaHorario, setBloqueiaHorario] = useState(false)
  const [acessos, setAcessos] = useState([])

  useEffect(() => {
    if (Object.keys(grupoCadastro).length > 0) {
      setFieldsValue(grupoCadastro)
      setAcessos(grupoCadastro.acessos)
      setAdm(grupoCadastro.adm)
      setBloqueiaHorario(grupoCadastro.bloqueiaHorario)
    }
  }, [grupoCadastro])

  async function handleSubmit(e) {
    setLoading(true)
    e.preventDefault()
    const fields = getFieldsValue(e)
    const body = {
      ...grupoCadastro,
      ...fields,
      adm,
      acessos,
      bloqueiaHorario
    }
    // eslint-disable-next-line no-unused-vars
    const [data, error] = grupoCadastro._id
      ? await update(`/grupos/${grupoCadastro._id}`, body)
      : await create('/grupos', body)

    if (error) return

    swal('Sucesso!', ' ', 'success', {
      timer: 1000,
      buttons: false
    })

    replace('/gruposDeUsuarios')
  }

  function renderButton(item, active) {
    return (
      <button
        type="button"
        key={item.title}
        onClick={() => {
          if (acessos.includes(item.title)) {
            return setAcessos(acessos.filter(acesso => acesso !== item.title))
          }
          setAcessos([...acessos, item.title])
        }}
        className={`${
          active
            ? 'bg-teal-600 text-white'
            : 'text-neutral-600 border border-neutral-600'
        } w-full shadow-md hover:opacity-80 rounded-xl gap-6 p-5 flex sm:flex-row flex-col justify-center items-center text-sm`}
      >
        <div>
          {Icons[item.icon || 'FaBars']({
            size: '3.5em'
          })}
        </div>
        <div className="flex w-full gap-3 flex-col justify-center items-start">
          <span className="font-semibold text-lg truncate max-w-10 xl:text-xl">
            {item.title}
          </span>
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
            <div
              className={`${
                active
                  ? 'bg-white ease-in duration-700 w-[100%]'
                  : ' bg-teal-600 ease-out duration-700 w-[0%]'
              } h-1.5 rounded-full`}
            />
          </div>
          <span className={`${active ? 'text-white' : 'text-neutral-700'}`}>
            {active ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </button>
    )
  }

  return (
    <Menu stateLoading={loading} title="Cadastro de grupo de usuário">
      <form className="px-5 xl:px-10 py-5" onSubmit={handleSubmit}>
        <div className="py-5 flex flex-col xl:grid xl:grid-cols-4 gap-4">
          <Input title="Nome do grupo" name="nome" className="col-span-2" />
          <div className="flex justify-start items-center  gap-4">
            <Span>Administrador?</Span>
            <ToggleButton defaultValue={adm} name="adm" onSelected={setAdm} />
          </div>
          <div className="flex justify-start items-center  gap-4">
            <Span>Bloqueia Horário?</Span>
            <ToggleButton
              defaultValue={bloqueiaHorario}
              onSelected={setBloqueiaHorario}
              name="bloqueiaHorario"
            />
          </div>
        </div>
        <div className="grid xl:grid-cols-2 mt-5 gap-4">
          {menuData.map(item => {
            if (item.multi) {
              return item.childrens.map(child => {
                const active = acessos.includes(child.title)
                return renderButton(
                  {
                    ...child,
                    icon: item.icon
                  },
                  active
                )
              })
            }

            const active = acessos.includes(item.title)
            return renderButton(item, active)
          })}
        </div>
        <div className="flex w-full sm:flex-row flex-col justify-end py-7 gap-3">
          <button className="flex bg-primary justify-center items-center text-white gap-3 px-5 py-2 rounded-md text-sm">
            <Icons.FaCheck size={16} />
            Cadastrar
          </button>
          <button
            type="button"
            onClick={() => replace('/gruposDeUsuarios')}
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
    const response = id ? await api.get(`/grupos/${id}`) : { data: {} }
    return {
      props: {
        grupoCadastro: response.data
      }
    }
  } catch (err) {
    console.log(err)
    return {
      props: {
        grupoCadastro: {}
      }
    }
  }
}
