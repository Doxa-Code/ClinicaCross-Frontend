/* eslint-disable indent */
import { useState } from 'react'
import * as Icon from 'react-icons/fa'
import Menu from '../../components/Menu'
import { api } from '../../services/api'
import { getCookie, returnPage } from '../../utils'
import { useRouter } from 'next/router'
import swal from '@sweetalert/with-react'
import { useFetch } from '../../hooks/useFetch'

export default function Usuarios({ dataInitial = [] }) {
  const [data, mutate] = useState(dataInitial)
  const [usuarios, setUsuarios] = useState(dataInitial)
  const { replace } = useRouter()
  const { remove } = useFetch()

  function handleSearch(value) {
    if (value === '') {
      return mutate(usuarios)
    }
    mutate(
      usuarios.filter(
        item =>
          item.nome.match(new RegExp(value, 'gim')) ||
          item.user.match(new RegExp(value, 'gim')) ||
          item?.grupo?.nome.match(new RegExp(value, 'gim')) ||
          item?.linked?.nome.match(new RegExp(value, 'gim'))
      )
    )
  }

  async function handleDelete(_id) {
    // eslint-disable-next-line no-unused-vars
    const [_, error] = await remove(`/users/${_id}`)
    if (error) return
    mutate(data.filter(item => item._id !== _id))
    setUsuarios(usuarios.filter(item => item._id !== _id))
    swal('Sucesso', 'Usuário removido com sucesso', 'success', {
      timer: 3000,
      buttons: false
    })
  }

  return (
    <Menu title="Usuários">
      <div className="flex flex-col lg:flex-row gap-3 justify-between px-5 xl:px-10 py-8 items-start lg:items-center w-full">
        <div className="flex w-full xl:max-w-md justify-between border rounded-lg">
          <input
            onChange={({ target }) => handleSearch(target.value)}
            placeholder="Pesquisar"
            className="border-none w-full lg:flex-1 p-2 outline-none rounded-lg flex"
          />
          <div className="flex p-3 justify-center items-center">
            <Icon.FaSearch size={15} className="text-gray-400" />
          </div>
        </div>
        <div className="grid w-full xl:max-w-[200px] grid-cols-1 gap-4">
          <button
            onClick={() => replace('/usuarios/cadastro')}
            className="bg-primary w-full shadow-lg hover:opacity-80 rounded-md text-white font-semibold p-3 gap-3 flex justify-center items-center text-sm"
          >
            <Icon.FaUser size={18} /> Novo usuário
          </button>
        </div>
      </div>
      <div className="mx-5 md:mx-10 overflow-auto">
        <table className="w-full table-striped">
          <thead>
            <tr>
              <th
                className="text-gray-dark border text-left px-3 text-sm py-4"
                width={50}
              >
                #
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Nome
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Nome de usuário
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Grupo
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Agenda vinculada
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Status
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-dark">
            {data.length > 0 ? (
              data.map((item, key) => {
                return (
                  <tr key={key} className="text-center">
                    <td className="border text-left text-sm px-3">{key + 1}</td>
                    <td className="border text-left text-sm px-3">
                      {item.nome || '-'}
                    </td>
                    <td className="border text-left text-sm px-3">
                      {item.user || '-'}
                    </td>
                    <td className="border text-left text-sm px-3">
                      {item.grupo?.nome || 'Não informado'}
                    </td>
                    <td className="border text-left text-sm px-3">
                      {item.linked?.nome || 'Não vinculado'}
                    </td>
                    <td className="border text-left text-sm px-3">
                      <div className="flex justify-center items-center">
                        <div
                          className={`${
                            item.ativo
                              ? 'bg-gradient-to-r from-green-500 to-lime-500'
                              : 'bg-gradient-to-r from-red-500 to-pink-500'
                          } shadow p-1 text-center rounded-md text-white w-full max-w-[4rem] text-sm`}
                        >
                          {item.ativo ? 'Ativo' : 'Inativo'}
                        </div>
                      </div>
                    </td>
                    <td className="gap-2 flex border-b border-r text-left px-3 p-2 justify-start items-center">
                      <button
                        className="bg-primary hover:opacity-80 text-white shadow-md p-2 rounded-full"
                        onClick={() =>
                          replace(`/usuarios/cadastro?id=${item._id}`)
                        }
                      >
                        <Icon.FaEdit size={13} />
                      </button>
                      <button
                        className="bg-red-600 hover:opacity-80 text-white shadow-md p-2 rounded-full"
                        onClick={() =>
                          swal({
                            title: 'Espera ai!',
                            text: 'Deseja realmente excluir o registro ?',
                            icon: 'warning',
                            buttons: {
                              sim: {
                                text: 'Sim',
                                value: true
                              },
                              cancel: 'Não'
                            }
                          }).then(response => {
                            if (!response) return
                            handleDelete(item._id)
                          })
                        }
                      >
                        <Icon.FaTrash size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td
                  className="text-center text-sm p-3 bg-gray-100 bg-opacity-40 border text-gray-400 italic"
                  colSpan={7}
                >
                  Não há usuários cadastrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Menu>
  )
}

export async function getServerSideProps(ctx) {
  const payload = getCookie(ctx, 'payload')
  if (!payload) {
    return returnPage(ctx)
  }
  try {
    const response = await api.get('/users')
    if (!response) {
      throw new Error('Houve um erro ao carregar os dados!')
    }

    return {
      props: {
        dataInitial: response.data.filter(user => !user.developer)
      }
    }
  } catch (err) {
    console.log(err)
    return {
      props: {
        dataInitial: []
      }
    }
  }
}
