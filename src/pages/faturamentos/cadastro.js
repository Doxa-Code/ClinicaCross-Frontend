/* eslint-disable indent */
import { useEffect } from 'react'
import Menu from '../../components/Menu'
import { api } from '../../services/api'
import { formatMoney, getCookie, returnPage } from '../../utils'
import { useFaturamentoStore } from '../../hooks/store'
import { useFetch } from '../../hooks/useFetch'
import * as Icon from 'react-icons/fa'
import ModalGuiaSADT from '../../components/faturamentos/cadastro/ModalGuiaSADT'
import { format, isAfter, isValid, parseISO } from 'date-fns'
import swal from '@sweetalert/with-react'
import { apiURL } from '../../constants'

export default function FaturamentosCadastro({
  agendamentosInitial = [],
  procedimentosInitial = [],
  faturamentoInitial = {}
}) {
  const {
    agendamentos,
    setAgendamentos,
    setOpenLancamentoGuia,
    setAgendamento,
    setFaturamento,
    faturamento,
    setProcedimentos
  } = useFaturamentoStore(state => state)

  const { update, fetch } = useFetch()

  useEffect(() => {
    setAgendamentos(agendamentosInitial)
  }, [agendamentosInitial])

  useEffect(() => {
    setFaturamento(faturamentoInitial)
  }, [faturamentoInitial])

  useEffect(() => {
    setProcedimentos(procedimentosInitial)
  }, [procedimentosInitial])

  async function handleDeleteGuia(guiaId, agendamentoId) {
    const body = {
      prestadorParaOperadora: {
        loteGuias: {
          ...(faturamento?.prestadorParaOperadora?.loteGuias || {}),
          guiasTISS: (
            faturamento?.prestadorParaOperadora?.loteGuias?.guiasTISS || []
          ).filter(guia => guia._id !== guiaId)
        }
      }
    }
    // eslint-disable-next-line no-unused-vars
    const [data, error] = await update(`/faturamentos/${faturamento._id}`, body)
    if (error) {
      return swal('Erro ao tentar remover guia', ' ', 'error')
    }
    await update(`/agendamentos/${agendamentoId}`, {
      faturado: false
    })

    const [agendamentosData] = await fetch('/faturamentos/agendamento')

    setAgendamentos(agendamentosData)

    setFaturamento(data)
    swal('Guia removida com sucesso', ' ', 'success', {
      timer: 3000,
      buttons: false
    })
  }

  function gerarGuiaSADT(guiaId) {
    window.open(`${apiURL}/faturamentos/guiaSADT/${guiaId}`, '_blank')
  }

  return (
    <Menu
      title={`Lote ${faturamento.prestadorParaOperadora?.loteGuias.numeroLote}`}
    >
      <div className="p-10">
        <div className="pb-5 flex flex-col">
          <span className="text-xl text-gray-500">Agendamentos a faturar</span>
        </div>
        <div className="overflow-auto">
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
                  Paciente
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Agendamento
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Data
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Valor total
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Valor honorário
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Valor filme
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-dark">
              {agendamentos.length > 0 ? (
                agendamentos
                  .sort((a, b) =>
                    isAfter(parseISO(a.inicio), parseISO(b.inicio)) ? -1 : 1
                  )
                  .map((agendamento, key) => {
                    return (
                      <tr key={key} className="text-center">
                        <td className="border text-left text-sm px-3">
                          {key + 1}
                        </td>
                        <td className="border text-left text-sm px-3">
                          {agendamento.paciente.nome}
                        </td>
                        <td className="border text-left text-sm px-3">
                          {agendamento.codigo}
                        </td>
                        <td className="border text-left text-sm px-3">
                          {isValid(parseISO(agendamento.inicio)) &&
                            format(
                              parseISO(agendamento.inicio),
                              "dd/MM/yyyy 'às' HH:mm"
                            )}
                        </td>
                        <td className="border text-left text-sm px-3">
                          {formatMoney(agendamento.valor)}
                        </td>
                        <td className="border text-left text-sm px-3">
                          {formatMoney(agendamento.procedimentoHonorario)}
                        </td>
                        <td className="border text-left text-sm px-3">
                          {formatMoney(agendamento.procedimentoFilme)}
                        </td>
                        <td className="gap-2 flex border-b border-r text-left px-3 p-2 justify-start items-center">
                          <button
                            title="Faturar"
                            className="bg-lime-500 hover:opacity-80 text-white shadow-md p-2 rounded-full"
                            onClick={() => {
                              setAgendamento(agendamento)
                              setOpenLancamentoGuia(true)
                            }}
                          >
                            <Icon.FaDollarSign size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
              ) : (
                <tr>
                  <td
                    className="text-center text-sm p-3 bg-gray-100 bg-opacity-40 border text-gray-400 italic"
                    colSpan={8}
                  >
                    Não há agendamentos para faturar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="p-10">
        <div className="pb-5 flex flex-col">
          <span className="text-xl text-gray-500">Guias Lançadas</span>
        </div>
        <div className="overflow-auto">
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
                  Paciente
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Agendamento
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Data
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Valor total
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Valor honorário
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Valor filme
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-dark">
              {faturamento.prestadorParaOperadora?.loteGuias.guiasTISS.length >
              0 ? (
                faturamento.prestadorParaOperadora?.loteGuias.guiasTISS
                  .sort((a, b) =>
                    isAfter(parseISO(a.inicio), parseISO(b.inicio)) ? -1 : 1
                  )
                  .map((guia, key) => {
                    console.log(guia)
                    return (
                      <tr key={key} className="text-center">
                        <td className="border text-left text-sm px-3">
                          {key + 1}
                        </td>
                        <td className="border text-left text-sm px-3">
                          {guia['guiaSP-SADT'].dadosBeneficiario.nome}
                        </td>
                        <td className="border text-left text-sm px-3">
                          {guia['guiaSP-SADT'].dadosSolicitacao?.codigo}
                        </td>
                        <td className="border text-left text-sm px-3">
                          {isValid(
                            parseISO(
                              guia['guiaSP-SADT'].dadosSolicitacao?.inicio
                            )
                          ) &&
                            format(
                              parseISO(
                                guia['guiaSP-SADT'].dadosSolicitacao.inicio
                              ),
                              "dd/MM/yyyy 'às' HH:mm"
                            )}
                        </td>
                        <td className="border text-left text-sm px-3">
                          {formatMoney(
                            guia['guiaSP-SADT'].dadosSolicitacao?.valor
                          )}
                        </td>
                        <td className="border text-left text-sm px-3">
                          {formatMoney(
                            guia['guiaSP-SADT'].dadosSolicitacao
                              ?.procedimentoHonorario
                          )}
                        </td>
                        <td className="border text-left text-sm px-3">
                          {formatMoney(
                            guia['guiaSP-SADT'].dadosSolicitacao
                              ?.procedimentoFilme
                          )}
                        </td>
                        <td className="gap-2 flex border-b border-r text-left px-3 p-2 justify-start items-center">
                          <button
                            title="Gerar guia SADT"
                            className="bg-sky-500 hover:opacity-80 text-white shadow-md p-2 rounded-full"
                            onClick={() => {
                              gerarGuiaSADT(guia._id)
                            }}
                          >
                            <Icon.FaFileMedicalAlt size={14} />
                          </button>
                          <button
                            title="Remover Guia"
                            className="bg-red-500 hover:opacity-80 text-white shadow-md p-2 rounded-full"
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
                                handleDeleteGuia(
                                  guia._id,
                                  guia['guiaSP-SADT'].dadosSolicitacao?._id
                                )
                              })
                            }}
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
                    colSpan={8}
                  >
                    Não há guias lançadas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ModalGuiaSADT />
    </Menu>
  )
}

export async function getServerSideProps(ctx) {
  const payload = getCookie(ctx, 'payload')
  if (!payload) {
    return returnPage(ctx)
  }
  try {
    const { faturamentoId } = ctx.query
    const faturamento = await api.get(`/faturamentos/${faturamentoId}`)
    const agendamentos = await api.get('/faturamentos/agendamento')
    const configuracao = await api.get('/configuracoes')
    const procedimentos = await api.get('/procedimentos')
    return {
      props: {
        configuracao: configuracao.data,
        agendamentosInitial: agendamentos.data,
        faturamentoInitial: faturamento.data,
        procedimentosInitial: procedimentos.data
      }
    }
  } catch (err) {
    console.log(err)
    return {
      props: {}
    }
  }
}
