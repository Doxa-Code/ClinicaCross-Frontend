import { useEffect, useState } from 'react'
import * as Icon from 'react-icons/fa'
import { getFieldsValue } from '../utils/'
import swal from '@sweetalert/with-react'
import Cookie from 'js-cookie'
import { useRouter } from 'next/router'
import { createLogger, usePayloadStore } from '../hooks/store'
import { useFetch } from '../hooks/useFetch'

export default function Login() {
  const { replace } = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { create } = useFetch()
  const { setPayload } = usePayloadStore(state => state)
  const logger = createLogger()

  useEffect(() => {
    Cookie.remove('payload')
  }, [])

  async function handleAuth(e) {
    e.preventDefault()
    setLoading(true)
    const fields = getFieldsValue(e)
    const [data, error] = await create('/users/auth', fields)

    if (error) {
      setLoading(false)
      logger.error('Erro na autenticação', {
        module: 'Login - handleAuth',
        body: {
          fields
        }
      })
      return swal(
        'Erro',
        'Houve um erro ao tentar autenticar! tente novamente mais tarde!',
        'error'
      )
    }
    if (!data.ativo) {
      setLoading(false)
      return swal('Erro', 'Usuário não tem permissão de acesso!', 'error')
    }

    setPayload(data)

    Cookie.set('payload', {
      _id: data._id,
      user: data.user,
      nome: data.nome,
      linked: data.linked
    })

    replace('/agendamento')
  }

  return (
    <div className="w-full h-screen bg-image">
      <div
        className={`fixed z-10 h-full  w-full flex-col gap-3 justify-center items-center bg-secondary bg-opacity-90 ${
          loading ? 'flex' : 'hidden'
        }`}
      >
        <img src="/favicon.ico" className="w-28 animate-bounce" />
        <span className="text-white text-md bg-black bg-opacity-30 px-4 py-2 rounded-full animate-pulse">
          Carregando...
        </span>
      </div>
      <div className="bg-black bg-opacity-30 w-full h-screen ">
        <div className="h-screen flex justify-center items-center w-full">
          <form
            className="p-16 rounded-xl shadow-xl bg-white bg-opacity-40 grid gap-5 items-center"
            onSubmit={e => handleAuth(e)}
          >
            <div className="flex flex-col justify-center items-center mb-8 ">
              <img src="/image/logo-2.png" className="w-80" />
            </div>
            <div className="grid gap-2">
              <div className="flex w-full max-w-96 bg-white rounded-md ">
                <Icon.FaUser
                  size={18}
                  className="text-gray-400 self-center m-3"
                />
                <input
                  autoComplete="off"
                  autoCapitalize="off"
                  placeholder="Usuário"
                  name="user"
                  className="w-full text-gray-500 bg-transparent font-normal text-sm focus:outline-none  rounded-md m-2"
                />
              </div>
              <div className="flex w-full items-center max-w-96 bg-white rounded-md mb-4">
                <Icon.FaLock
                  size={18}
                  className="text-gray-400 self-center m-3"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Senha"
                  className="w-full text-gray-600 bg-transparent font-normal text-sm focus:outline-none rounded m-2"
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-3 cursor-pointer"
                >
                  {showPassword ? (
                    <Icon.FaEye size={18} className="text-slate-400" />
                  ) : (
                    <Icon.FaEyeSlash size={18} className="text-slate-400" />
                  )}
                </div>
              </div>
              <div className="flex justify-center w-full">
                <button className="bg-primary hover:opacity-80 w-full text-md rounded-md text-white shadow-2xl p-2">
                  Entrar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
