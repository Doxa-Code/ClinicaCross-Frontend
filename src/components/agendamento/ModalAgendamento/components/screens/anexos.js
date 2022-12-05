import { useState, useEffect } from 'react'
import { parseISO, format, isAfter } from 'date-fns'
import * as Icons from 'react-icons/fa'
import { useAgendamentoStore, useAnexoStore } from '../../../../../hooks/store'
import { useFetch } from '../../../../../hooks/useFetch'
import swal from '@sweetalert/with-react'
import ModalCompare from '../ModalCompare'
import isImage from 'is-image'
import { getMaterialFileIcon } from 'file-extension-icon-js'

export default function Anexos() {
  const { agendamento, screen, setAgendamento } = useAgendamentoStore(
    state => state
  )
  const { compareFiles, setCompareFiles, setShowCompareAnexo } = useAnexoStore(
    state => state
  )
  const { remove } = useFetch()
  const [anexos, setAnexos] = useState([])

  useEffect(() => {
    setAnexos(agendamento.paciente?.anexo)
  }, [agendamento])

  async function handleDelete(id) {
    const [response, error] = await remove(
      `/pacientes/anexo/${agendamento.paciente._id}/${id}`
    )
    if (error) return

    setAgendamento({
      ...agendamento,
      paciente: {
        ...agendamento.paciente,
        anexo: response
      }
    })
  }

  function handleSearch(type) {
    return function (e) {
      if (!e.target.value) {
        return setAnexos(agendamento.paciente.anexo)
      }
      setAnexos(
        agendamento.paciente.anexo?.filter(item => {
          switch (type) {
            case 'nome':
              return item.nome
                ?.toLowerCase()
                .includes(e.target.value.toLowerCase())
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

  return (
    <div className={`px-5 pt-4 gap-4 ${screen !== 'Anexos' && 'hidden'}`}>
      <div className="flex justify-end items-center pb-2">
        <button
          onClick={() => {
            setShowCompareAnexo(true)
          }}
          className="text-sm p-3 rounded bg-lime-500 text-white"
          disabled={compareFiles.length < 2}
        >
          Comparar fotos
        </button>
      </div>
      <div className="max-h-96 grid gap-4 overflow-auto">
        <table className="table-striped w-full border-collapse">
          <thead>
            <tr className="sticky top-0 bg-white shadow-md">
              <th
                width={10}
                className="px-5 py-2 text-sm text-center border font-semibold text-gray-700"
              ></th>
              <th
                width={100}
                className="px-5 py-2 text-sm text-center border font-semibold text-gray-700"
              >
                Data
              </th>
              <th
                colSpan={2}
                className="px-5 py-2 text-sm text-center border font-semibold text-gray-700"
              >
                Nome do arquivo
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
              <th colSpan={2} className="p-2 border">
                <input
                  className="rounded border px-2 py-1 w-full outline-none text-gray-500 text-sm"
                  placeholder="Nome do arquivo"
                  onChange={handleSearch('nome')}
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
            {anexos?.length > 0 ? (
              anexos
                .sort((a, b) =>
                  !isAfter(parseISO(a.inicio), parseISO(b.inicio)) ? 1 : -1
                )
                .map((item, index) => {
                  return (
                    <tr key={index}>
                      <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                        {isImage(item.data) && (
                          <div
                            className={`h-4 w-4 cursor-pointer border-2 rounded ${
                              compareFiles.some(
                                file => file._id === item._id
                              ) && 'bg-lime-500'
                            }`}
                            onClick={() => {
                              if (
                                compareFiles.some(file => file._id === item._id)
                              ) {
                                return setCompareFiles(
                                  compareFiles.filter(
                                    file => file._id !== item._id
                                  )
                                )
                              }
                              setCompareFiles([...compareFiles, item])
                            }}
                          />
                        )}
                      </td>
                      <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                        {format(parseISO(item.createdAt), 'dd/MM/yyyy')}
                      </td>
                      <td className="text-sm font-normal text-center text-gray-700 border">
                        <div className="flex justify-center items-center">
                          <div className="w-14 h-14 flex justify-center items-center">
                            <img
                              src={getMaterialFileIcon(item.nome)}
                              className="object-cover p-2"
                              onError={e =>
                                (e.target.src = '/image/favicon-2.png')
                              }
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                        {item.nome}
                      </td>
                      <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                        {item.responsavel?.nome}
                      </td>
                      <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                        <div className="flex justify-center items-center gap-1">
                          <button
                            title="Ver anexo"
                            onClick={() => {
                              window.open(item.data)
                            }}
                            className="bg-blue-600 p-2 rounded-full text-white"
                          >
                            <Icons.FaEye />
                          </button>
                          <button
                            title="Remover anexo"
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
                            className="bg-red-500 p-2 rounded-full text-white"
                          >
                            <Icons.FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
            ) : (
              <tr>
                <td
                  className="px-5 py-2 text-sm font-light italic text-center text-gray-400 border"
                  colSpan={6}
                >
                  Nenhum anexo encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ModalCompare />
    </div>
  )
}
