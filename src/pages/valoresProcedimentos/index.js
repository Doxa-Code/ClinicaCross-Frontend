/* eslint-disable indent */
import { useState } from 'react'
import * as Icon from 'react-icons/fa'
import Menu from '../../components/Menu'
import { api } from '../../services/api'
import { formatMoney, getCookie, returnPage } from '../../utils'
import Modal from '../../components/Modal'

export default function ValoresProcedimentos({ dataInitial = [] }) {
  const [data, mutate] = useState(dataInitial)
  const [open, setOpen] = useState(false)
  const [convenio, setConvenio] = useState({})

  return (
    <Menu title="Valores procedimentos">
      
      <div className="mx-5 md:mx-10 overflow-auto pt-8">
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
                Descrição
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
                        {item.nome || '-'}
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
    const response = await api
      .get('/convenios')
      .then(response => response.data.filter(convenio => convenio.geraRecibo))
    if (!response) {
      throw new Error('Houve um erro ao carregar os dados!')
    }

    return {
      props: {
        dataInitial: response
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
