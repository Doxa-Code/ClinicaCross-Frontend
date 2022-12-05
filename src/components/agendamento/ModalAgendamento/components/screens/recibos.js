import { useState, useEffect } from 'react'
import { parseISO, format, isAfter } from 'date-fns'
import * as Icons from 'react-icons/fa'
import { useAgendamentoStore, useReciboStore } from '../../../../../hooks/store'
import { useFetch } from '../../../../../hooks/useFetch'
import swal from '@sweetalert/with-react'

export default function Recibos() {
  const { agendamento, setAgendamento, screen } = useAgendamentoStore(
    state => state
  )
  const { remove } = useFetch()
  const { setShowRecibo, setRecibo, setReadOnly } = useReciboStore(
    state => state
  )
  const [recibos, setRecibos] = useState([])

  useEffect(() => {
    setRecibos(agendamento.recibo)
  }, [agendamento])

  function handleSearch(type) {
    return function (e) {
      if (!e.target.value) {
        return setRecibos(agendamento.recibos)
      }
      setRecibos(
        agendamento.recibos?.filter(item => {
          switch (type) {
            case 'responsavel':
              return item.responsavel.nome
                ?.toLowerCase()
                .includes(e.target.value.toLowerCase())
            case 'data':
              return item.inicio
                .toLowerCase()
                .includes(e.target.value.toLowerCase())
            default:
              return item
          }
        })
      )
    }
  }

  async function handleDelete(id) {
    const [data, error] = await remove(
      `/agendamentos/recibo/${agendamento._id}/${id}`
    )
    if (error) return

    setRecibos(data)
    setAgendamento({ ...agendamento, recibo: data })
  }

  return (
    <div className={`px-5 pt-4 gap-4 ${screen !== 'Recibos' && 'hidden'}`}>
      <div className="max-h-96 grid gap-4 overflow-auto">
        <table className="table-striped w-full border-collapse">
          <thead>
            <tr className="sticky top-0 bg-white shadow-md">
              <th
                width={10}
                className="px-5 py-2 text-sm text-center border font-semibold text-gray-700"
              >
                #
              </th>
              <th
                width={100}
                className="px-5 py-2 text-sm text-center border font-semibold text-gray-700"
              >
                Data
              </th>
              <th className="px-5 py-2 text-sm text-center border font-semibold text-gray-700">
                Responsável
              </th>
              <th className="px-5 py-2 text-sm text-center border font-semibold text-gray-700">
                Ação
              </th>
            </tr>
            <tr>
              <th></th>
              <th className="p-2 border">
                <input
                  className="rounded border px-2 py-1 w-full outline-none text-gray-500 text-sm"
                  type="date"
                  onChange={handleSearch('data')}
                />
              </th>
              <th className="p-2 border">
                <input
                  className="rounded border px-2 py-1 w-full outline-none text-gray-500 text-sm"
                  placeholder="Responsável"
                  onChange={handleSearch('responsavel')}
                />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recibos?.length > 0 ? (
              recibos
                .sort((a, b) =>
                  !isAfter(parseISO(a.inicio), parseISO(b.inicio)) ? 1 : -1
                )
                .map((item, index) => (
                  <tr key={index}>
                    <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                      {index + 1}
                    </td>
                    <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                      {format(parseISO(item.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                      {item.responsavel?.nome}
                    </td>
                    <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                      <div className="flex justify-center items-center gap-1">
                        <button
                          title="Ver recibo"
                          onClick={() => {
                            setReadOnly(true)
                            setRecibo(item)
                            setShowRecibo(true)
                          }}
                          className="bg-blue-600 p-2 rounded-full text-white"
                        >
                          <Icons.FaEye />
                        </button>
                        <button
                          title="Remover recibo"
                          onClick={() => {
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
                          }}
                          className="bg-red-400 text-white p-2 rounded-full"
                        >
                          <Icons.FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td
                  className="px-5 py-2 text-sm font-light italic text-center text-gray-400 border"
                  colSpan={4}
                >
                  Nenhum recibo encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
