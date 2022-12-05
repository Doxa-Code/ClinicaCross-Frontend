/* eslint-disable indent */
import { useState } from 'react'
import * as Icon from 'react-icons/fa'
import Menu from '../../components/Menu'
import { api } from '../../services/api'
import { getCookie, returnPage } from '../../utils'
import { useRouter } from 'next/router'
import swal from '@sweetalert/with-react'
import { useFetch } from '../../hooks/useFetch'

export default function Medicamentos({ dataInitial = [] }) {
  const [medicamentos, setMedicamentos] = useState(dataInitial)
  const [data, mutate] = useState(dataInitial)
  const { replace } = useRouter()
  const { remove } = useFetch()

  function handleSearch(value) {
    if (value === '') {
      return mutate(medicamentos)
    }
    mutate(
      medicamentos.filter(item => item.nome.match(new RegExp(value, 'gim')))
    )
  }

  async function handleDelete(_id) {
    // eslint-disable-next-line no-unused-vars
    const [_, error] = await remove(`/medicamentos/${_id}`)
    if (error) return
    mutate(data.filter(item => item._id !== _id))
    setMedicamentos(data.filter(item => item._id !== _id))
    swal('Sucesso', 'Medicamento removido com sucesso', 'success', {
      timer: 3000,
      buttons: false
    })
  }

  return (
    <Menu title="Medicamentos">
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
        <div className="grid w-full xl:max-w-[250px] grid-cols-1 gap-4">
          <button
            onClick={() => replace('/medicamentos/cadastro')}
            className="bg-primary w-full shadow-lg hover:opacity-80 rounded-md text-white font-semibold p-3 gap-3 flex justify-center items-center text-sm"
          >
            <Icon.FaTablets size={18} /> Novo medicamento
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
              <th className="text-gray-dark w-10 border text-left px-3 text-sm py-4">
                Código
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Nome
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Tipo
              </th>
              <th
                width={50}
                className="text-gray-dark border text-left px-3 text-sm py-4"
              >
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
                      {item.codigo || '-'}
                    </td>
                    <td className="border text-left text-sm px-3">
                      {item.nome || '-'}
                    </td>
                    <td className="border text-left text-sm px-3">
                      {item.tipo || '-'}
                    </td>
                    <td className="gap-2 flex border-b border-r text-left px-3 p-2 justify-start items-center">
                      <button
                        className="bg-primary hover:opacity-80 text-white shadow-md p-2 rounded-full"
                        onClick={() =>
                          replace(`/medicamentos/cadastro?id=${item._id}`)
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
                  colSpan={5}
                >
                  Não há medicamentos cadastrados
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
    const response = await api.get('/medicamentos')
    if (!response) {
      throw new Error('Houve um erro ao carregar os dados!')
    }

    return {
      props: {
        dataInitial: response.data
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
