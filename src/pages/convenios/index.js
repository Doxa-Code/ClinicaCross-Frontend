/* eslint-disable indent */
import { useState } from 'react'
import * as Icon from 'react-icons/fa'
import Menu from '../../components/Menu'
import { api } from '../../services/api'
import { formatMoney, getCookie, returnPage } from '../../utils'
import { useRouter } from 'next/router'
import swal from '@sweetalert/with-react'
import { useFetch } from '../../hooks/useFetch'
import Modal from '../../components/Modal'

export default function Convenios({ dataInitial = [] }) {
  const [data, mutate] = useState(dataInitial)
  const [open, setOpen] = useState(false)
  const [convenios, setConvenios] = useState(dataInitial)
  const [convenio, setConvenio] = useState({})
  const { replace } = useRouter()
  const { remove } = useFetch()

  function handleSearch(value) {
    if (value === '') {
      return mutate(convenios)
    }
    mutate(convenios.filter(item => item.nome.match(new RegExp(value, 'gim'))))
  }

  async function handleDelete(_id) {
    // eslint-disable-next-line no-unused-vars
    const [_, error] = await remove(`/convenios/${_id}`)
    if (error) return
    mutate(data.filter(item => item._id !== _id))
    setConvenios(convenios.filter(item => item._id !== _id))
    swal('Sucesso', 'Conve̊nio removido com sucesso', 'success', {
      timer: 3000,
      buttons: false
    })
  }

  return (
    <Menu title="Convenios">
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
            onClick={() => replace('/convenios/cadastro')}
            className="bg-primary shadow-lg hover:opacity-80 rounded-md text-white font-semibold p-3 gap-3 flex justify-center items-center text-sm"
          >
            <Icon.FaProjectDiagram size={18} /> Novo convenio
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
                Descrição
              </th>
              <th
                width={100}
                className="text-gray-dark border text-left px-3 text-sm py-4"
              >
                Número do convênio
              </th>
              <th
                width={100}
                className="text-gray-dark border text-left px-3 text-sm py-4"
              >
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-dark">
            {data.length > 0 ? (
              data
                .sort((convenioA, convenioB) =>
                  convenioA.nome > convenioB.nome ? 1 : -1
                )
                .map((item, key) => {
                  return (
                    <tr key={key} className="text-center">
                      <td className="border text-left text-sm px-3">
                        {key + 1}
                      </td>
                      <td className="border text-left text-sm px-3">
                        {item.codigo || '-'}
                      </td>
                      <td className="border text-left text-sm px-3">
                        {item.nome || '-'}
                      </td>
                      <td className="border text-left text-sm px-3">
                        {item.numero || '-'}
                      </td>
                      <td className="gap-2 flex border-b border-r text-left px-3 p-2 justify-start items-center">
                        <button
                          className="bg-sky-500 hover:opacity-80 text-white shadow-md p-2 rounded-full"
                          onClick={() => {
                            setConvenio(item)
                            setOpen(true)
                          }}
                        >
                          <Icon.FaEye size={13} />
                        </button>
                        <button
                          className="bg-primary hover:opacity-80 text-white shadow-md p-2 rounded-full"
                          onClick={() =>
                            replace(`/convenios/cadastro?id=${item._id}`)
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
                  Não há convenios lançados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal closeWithEsc open={open} setOpen={setOpen}>
        <div className="w-full max-w-md xl:max-w-max">
          <div className="flex justify-end items-center p-2">
            <Icon.FaTimes
              size={20}
              className="cursor-pointer text-white"
              onClick={() => setOpen(!open)}
            />
          </div>
          <div className="bg-white overflow-auto scrollbar p-5 rounded-md  max-h-[800px] ">
            <table className="w-full table-striped">
              <thead>
                <tr className="sticky top-0 bg-white shadow-md">
                  <th
                    className="text-gray-dark border text-left px-3 text-sm py-4"
                    width={50}
                  >
                    #
                  </th>
                  <th className="text-gray-dark border text-left px-3 text-sm py-4">
                    Descrição do procedimento
                  </th>
                  <th className="text-gray-dark border text-left px-3 text-sm py-4">
                    Valor Honorário
                  </th>
                  <th className="text-gray-dark border text-left px-3 text-sm py-4">
                    Valor Filme
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-dark">
                {convenio?.procedimentos?.length > 0 ? (
                  convenio?.procedimentos
                    .sort((a, b) =>
                      a._id.descricaoProcedimento?.toLowerCase() >
                      b._id.descricaoProcedimento?.toLowerCase()
                        ? 1
                        : -1
                    )
                    .map((item, key) => {
                      return (
                        <tr key={item._id} className="text-center">
                          <td className="p-2 border text-left text-sm px-3">
                            {key + 1}
                          </td>
                          <td className="p-2 border text-left text-sm px-3">
                            {item?._id?.descricaoProcedimento || '-'}
                          </td>
                          <td className="p-2 border text-left text-sm px-3">
                            {formatMoney(item?.valorHonorario || '0')}
                          </td>
                          <td className="p-2 border text-left text-sm px-3">
                            {formatMoney(item?.valorFilme || '0')}
                          </td>
                        </tr>
                      )
                    })
                ) : (
                  <tr>
                    <td
                      className="text-center text-sm p-3 bg-gray-100 bg-opacity-40 border text-gray-400 italic"
                      colSpan={6}
                    >
                      Não há procedimentos lançados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </Menu>
  )
}

export async function getServerSideProps(ctx) {
  const payload = getCookie(ctx, 'payload')
  if (!payload) {
    return returnPage(ctx)
  }
  try {
    const response = await api.get('/convenios')
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
