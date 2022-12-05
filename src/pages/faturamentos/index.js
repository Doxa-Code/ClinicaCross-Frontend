/* eslint-disable indent */
import { useState, useEffect } from 'react'
import * as Icon from 'react-icons/fa'
import Menu from '../../components/Menu'
import { api } from '../../services/api'
import { getCookie, returnPage } from '../../utils'
import { useRouter } from 'next/router'
import { useFetch } from '../../hooks/useFetch'
import swal from '@sweetalert/with-react'
import { apiURL } from '../../constants'

export default function Faturamentos({ dataInitial = [] }) {
  const [faturamentos, setFaturamentos] = useState([])
  const [data, mutate] = useState([])
  const { create, remove } = useFetch()
  const { replace } = useRouter()

  useEffect(() => {
    setFaturamentos(dataInitial)
    mutate(dataInitial)
  }, [dataInitial])

  function handleSearch(value) {
    if (value === '') {
      return setFaturamentos(data)
    }
    setFaturamentos(
      data.filter(faturamento =>
        faturamento.prestadorParaOperadora.numeroLote?.match(
          new RegExp(value, 'gim')
        )
      )
    )
  }

  async function createNewLote() {
    const [response, error] = await create('/faturamentos', {})
    if (error) {
      return swal('Erro ao criar novo lote', ' ', 'error')
    }
    replace(`/faturamentos/cadastro?faturamentoId=${response._id}`)
  }

  async function handleDeleteFaturamento(id) {
    // eslint-disable-next-line no-unused-vars
    const [_, error] = await remove(`/faturamentos/${id}`)
    if (error) {
      return swal('Erro ao deletar faturamento', ' ', 'error')
    }
    setFaturamentos(faturamentos.filter(faturamento => faturamento._id !== id))
    mutate(faturamentos.filter(faturamento => faturamento._id !== id))
  }

  function gerarXML(id) {
    window.open(`${apiURL}/faturamentos/XML/${id}`, '_blank')
  }

  return (
    <Menu title="Faturamentos">
      <div className="flex flex-col lg:flex-row gap-3 justify-between px-10 py-8 items-start lg:items-center w-full">
        <div className="flex w-full max-w-md justify-between border rounded-lg">
          <input
            onChange={({ target }) => handleSearch(target.value)}
            placeholder="Pesquisar"
            className="border-none lg:flex-1 p-2 outline-none rounded-lg flex"
          />
          <div className="flex p-3 justify-center items-center">
            <Icon.FaSearch size={15} className="text-gray-400" />
          </div>
        </div>
        <button
          onClick={() => {
            createNewLote()
          }}
          className="flex justify-center items-center bg-primary gap-4 text-white py-3 px-5 rounded"
        >
          <Icon.FaBars />
          Novo lote
        </button>
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
                Número do lote
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Quantidade de guias
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-dark">
            {faturamentos.length > 0 ? (
              faturamentos.map((faturamento, key) => {
                return (
                  <tr key={key} className="text-center">
                    <td className="border text-left text-sm px-3">{key + 1}</td>
                    <td className="border text-left text-sm px-3">
                      {
                        faturamento?.prestadorParaOperadora?.loteGuias
                          ?.numeroLote
                      }
                    </td>
                    <td className="border text-left text-sm px-3">
                      {
                        faturamento?.prestadorParaOperadora?.loteGuias
                          ?.guiasTISS.length
                      }
                    </td>
                    <td className="gap-2 flex border-b border-r text-left px-3 p-2 justify-start items-center">
                      <button
                        title="Gerar XML"
                        className="bg-green-500 hover:opacity-80 text-white shadow-md p-2 rounded-full"
                        onClick={() => {
                          gerarXML(faturamento._id)
                        }}
                      >
                        <Icon.FaFile size={14} />
                      </button>
                      <button
                        title="Adicionar guia"
                        className="bg-lime-500 hover:opacity-80 text-white shadow-md p-2 rounded-full"
                        onClick={() =>
                          replace(
                            `/faturamentos/cadastro?faturamentoId=${faturamento._id}`
                          )
                        }
                      >
                        <Icon.FaPlus size={14} />
                      </button>
                      <button
                        title="Excluir lote"
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
                            handleDeleteFaturamento(faturamento._id)
                          })
                        }
                      >
                        <Icon.FaTrashAlt size={14} />
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
                  Não há lotes criados
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
    const response = await api.get('/faturamentos')
    if (!response) {
      throw new Error('Houve um erro ao carregar os dados!')
    }
    return {
      props: {
        dataInitial: response.data || []
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
