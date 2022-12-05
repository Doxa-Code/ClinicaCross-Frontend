/* eslint-disable indent */
import { useState } from 'react'
import * as Icon from 'react-icons/fa'
import Menu from '../../components/Menu'
import { api } from '../../services/api'
import { getCookie, returnPage, debounceEvent } from '../../utils'
import { useRouter } from 'next/router'
import swal from '@sweetalert/with-react'
import { useFetch } from '../../hooks/useFetch'
import { format, isValid, parseISO } from 'date-fns'
import ModalHistorico from '../../components/Pacientes/ModalHistorico'
import { usePaciente } from '../../hooks/store'

export default function Pacientes({ dataInitial = [] }) {
  const [data, mutate] = useState(dataInitial.pacientes || [])
  const [totalPages, setTotalPages] = useState(dataInitial.totalPages)
  const [currentPage, setCurrentPage] = useState(dataInitial.currentPage)
  const [search, setSearch] = useState('')
  const { replace } = useRouter()
  const { remove, fetch } = useFetch()
  const { setShowHistorico, setHistorico } = usePaciente()

  async function handleSearch(value) {
    if (value === '') {
      mutate(dataInitial.pacientes)
      setTotalPages(dataInitial.totalPages)
      setCurrentPage(dataInitial.currentPage)
      setSearch('')
      return
    }
    const [response] = await fetch(`/pacientes/search?q=${value.toLowerCase()}`)

    setSearch(value.toLowerCase())
    mutate(response.pacientes)
    setTotalPages(response.totalPages)
    setCurrentPage(response.currentPage)
  }

  async function handleDelete(_id) {
    // eslint-disable-next-line no-unused-vars
    const [_, error] = await remove(`/pacientes/${_id}`)
    if (error) return
    mutate(data.filter(item => item._id !== _id))
    swal('Sucesso', 'Paciente removido com sucesso', 'success', {
      timer: 3000,
      buttons: false
    })
  }

  async function handleChangePage(mode) {
    const page =
      mode === 'add'
        ? currentPage + 1
        : mode === 'sub'
        ? currentPage - 1
        : currentPage
    const [response] = await fetch(
      search
        ? `/pacientes/search?q=${search}&page=${page}&limit=100`
        : `/pacientes?page=${page}&limit=100`
    )
    mutate(response.pacientes)
    setCurrentPage(response.currentPage)
    setTotalPages(response.totalPages)
  }
  async function handleLoadHistorico(pacienteID) {
    try {
      const [data] = await fetch(`/agendamentos/historico/${pacienteID}`)
      setHistorico(data)
      setShowHistorico(true)
    } catch (err) {
      console.log(err.message)
    }
  }

  return (
    <Menu title="Pacientes">
      <div className="flex flex-col lg:flex-row gap-3 justify-between px-5 xl:px-10 py-8 items-start lg:items-center w-full">
        <div className="flex w-full xl:max-w-md justify-between border rounded-lg">
          <input
            onChange={debounceEvent(({ target }) => handleSearch(target.value))}
            placeholder="Pesquisar"
            className="border-none w-full lg:flex-1 p-2 outline-none rounded-lg flex"
          />
          <div className="flex p-3 justify-center items-center">
            <Icon.FaSearch size={15} className="text-gray-400" />
          </div>
        </div>
        <div className="grid w-full xl:max-w-[250px] grid-cols-1 gap-4">
          <button
            onClick={() => replace('/pacientes/cadastro')}
            className="bg-primary w-full shadow-lg hover:opacity-80 rounded-md text-white font-semibold p-3 gap-3 flex justify-center items-center text-sm"
          >
            <Icon.FaUser size={18} /> Novo paciente
          </button>
        </div>
      </div>
      <div className="px-10 pb-5 flex justify-end">
        <span className="text-gray-400 text-sm text-light italic">
          {currentPage} de {Math.round((totalPages ?? 0) / 100) + 1} páginas
        </span>
        <div>
          <button onClick={() => currentPage !== 1 && handleChangePage('sub')}>
            <Icon.FaAngleLeft
              size={20}
              className={`${
                currentPage === 1 ? 'text-gray-400' : 'text-primary'
              }`}
            />
          </button>
          <button
            onClick={() =>
              currentPage < Math.round((totalPages ?? 0) / 100) + 1 &&
              handleChangePage('add')
            }
          >
            <Icon.FaAngleRight
              size={20}
              className={`${
                currentPage === Math.round((totalPages ?? 0) / 100) + 1
                  ? 'text-gray-400'
                  : 'text-primary'
              }`}
            />
          </button>
        </div>
      </div>
      <div className="mx-5 md:mx-10 max-h-[600px] mb-10 overflow-auto">
        <table className="w-full table-striped">
          <thead>
            <tr>
              <th
                className="sticky -top-1 bg-white shadow-xl text-gray-dark border text-left px-3 text-sm py-4"
                width={50}
              >
                #
              </th>
              <th className="sticky -top-1 w-10 bg-white shadow-xl text-gray-dark border text-left px-3 text-sm py-4">
                Código
              </th>
              <th className="sticky -top-1 bg-white shadow-xl text-gray-dark border text-left px-3 text-sm py-4">
                Nome
              </th>
              <th className="sticky -top-1 bg-white shadow-xl text-gray-dark border text-left px-3 text-sm py-4">
                Whatsapp
              </th>
              <th className="sticky -top-1 bg-white shadow-xl text-gray-dark border text-left px-3 text-sm py-4">
                Data de Nascimento
              </th>
              <th
                width={50}
                className="sticky -top-1 bg-white shadow-xl text-gray-dark border text-left px-3 text-sm py-4"
              >
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-dark">
            {data?.length > 0 ? (
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
                      {item.whatsapp || '-'}
                    </td>
                    <td className="border text-left text-sm px-3">
                      {isValid(parseISO(item.dataNascimento))
                        ? format(parseISO(item.dataNascimento), 'dd/MM/yyyy')
                        : '-'}
                    </td>
                    <td className="gap-2 flex border-b border-r text-left px-3 p-2 justify-start items-center">
                      <button
                        className="bg-sky-500 hover:opacity-80 text-white shadow-md p-2 rounded-full"
                        onClick={() => handleLoadHistorico(item._id)}
                      >
                        <Icon.FaEye size={13} />
                      </button>
                      <button
                        className="bg-primary hover:opacity-80 text-white shadow-md p-2 rounded-full"
                        onClick={() =>
                          replace(`/pacientes/cadastro?id=${item._id}`)
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
                  colSpan={6}
                >
                  Não há pacientes cadastrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ModalHistorico />
    </Menu>
  )
}

export async function getServerSideProps(ctx) {
  const payload = getCookie(ctx, 'payload')
  if (!payload) {
    return returnPage(ctx)
  }
  try {
    const response = await api.get('/pacientes?limit=100&page=1')
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
