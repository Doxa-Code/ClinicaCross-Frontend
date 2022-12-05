import { useFaturamentoStore } from '../../../../hooks/store'
import { useFetch } from '../../../../hooks/useFetch'
import { Header, Input, SelectSearch } from '../../../Form'
import Modal from '../../../Modal'
import * as Icon from 'react-icons/fa'
import ModalOutrasDespesas from '../ModalOutrasDespesas'
import {
  indicacaoAcidenteANS,
  motivoEncerramentoANS,
  tipoAtendimentoANS,
  tipoConsultaANS
} from '../../../../data/'
import { formatMoney, getFieldsValue } from '@doxa-code/utils'
import swal from '@sweetalert/with-react'

export default function ModalGuiaSADT() {
  const {
    openLancamentoGuia,
    setOpenLancamentoGuia,
    outrasDespesas,
    setOpenOutraDespesa,
    procedimentos,
    setOutrasDespesas,
    agendamento,
    faturamento,
    setFaturamento,
    agendamentos,
    setAgendamentos
  } = useFaturamentoStore(state => state)

  const { update, fetch } = useFetch()

  async function handleSubmit(e) {
    e.preventDefault()
    const fields = getFieldsValue(e)
    const body = {
      'guiaSP-SADT': {
        ...fields['guiaSP-SADT'],
        dadosBeneficiario: agendamento.paciente._id,
        dadosSolicitante: {
          profissionalSolicitante: agendamento.medico._id
        },
        dadosSolicitacao: agendamento._id,
        outrasDespesas: {
          despesa: outrasDespesas
        }
      }
    }
    const faturamentoUpdate = {
      prestadorParaOperadora: {
        loteGuias: {
          ...(faturamento?.prestadorParaOperadora?.loteGuias || {}),
          guiasTISS: [
            ...(faturamento?.prestadorParaOperadora?.loteGuias?.guiasTISS ||
              []),
            body
          ]
        }
      }
    }
    // eslint-disable-next-line no-unused-vars
    const [_, error] = await update(
      `/faturamentos/${faturamento._id}`,
      faturamentoUpdate
    )
    if (error) {
      return swal('Erro ao tentar lançar a guia', ' ', 'error')
    }
    await update(`/agendamentos/${agendamento._id}`, {
      faturado: true
    })

    const [data] = await fetch(`/faturamentos/${faturamento._id}`)

    setAgendamentos(
      agendamentos.filter(agenda => agenda._id !== agendamento._id)
    )

    setFaturamento(data)
    setOpenLancamentoGuia(false)
    swal('Guia lançada com sucesso', ' ', 'success', {
      timer: 3000,
      buttons: false
    })
  }

  return (
    <Modal open={openLancamentoGuia} setOpen={setOpenLancamentoGuia}>
      <div className="bg-white w-full scrollbar max-w-6xl max-h-[800px] overflow-auto p-10 rounded-md">
        <Header>
          <div className="flex justify-between items-center">
            <span>Lançamento de Guia SADT</span>
            <Icon.FaTimes
              className="cursor-pointer"
              onClick={() => setOpenLancamentoGuia(false)}
              size={18}
            />
          </div>
        </Header>
        <form
          onSubmit={handleSubmit}
          className="py-5 flex flex-col xl:grid grid-cols-3 gap-4"
        >
          <Input
            title="Número da Guia do prestador"
            name="guiaSP-SADT[cabecalhoGuia][numeroGuiaPrestador]"
            required
          />
          <Input
            title="Guia Principal"
            name="guiaSP-SADT[cabecalhoGuia][guiaPrincipal]"
            required
          />
          <Input
            title="Número da Guia Operadora"
            name="guiaSP-SADT[dadosAutorizacao][numeroGuiaOperadora]"
            required
          />
          <Input
            title="Data da autorização"
            name="guiaSP-SADT[dadosAutorizacao][dataAutorizacao]"
            type="date"
            required
          />
          <Input title="Senha" name="guiaSP-SADT[dadosAutorizacao][senha]" />
          <Input
            title="Data da validade da senha"
            name="guiaSP-SADT[dadosAutorizacao][dataValidadeSenha]"
            type="date"
          />
          <SelectSearch
            className="col-span-3"
            title="Tipo de atendimento"
            name="guiaSP-SADT[dadosAtendimento][tipoAtendimento]"
            options={tipoAtendimentoANS}
          />
          <SelectSearch
            title="Indicação de acidente"
            name="guiaSP-SADT[dadosAtendimento][indicacaoAcidente]"
            options={indicacaoAcidenteANS}
          />
          <SelectSearch
            title="Tipo de consulta"
            name="guiaSP-SADT[dadosAtendimento][tipoConsulta]"
            options={tipoConsultaANS}
          />
          <SelectSearch
            title="Motivo do encerramento"
            name="guiaSP-SADT[dadosAtendimento][motivoEncerramento]"
            options={motivoEncerramentoANS}
          />
          <Input title="Observação" name="guiaSP-SADT[observacao]" />
          <Input
            title="Valor dos procedimentos"
            name="guiaSP-SADT[valorTotal][valorProcedimentos]"
            step="0.01"
            type="number"
          />
          <Input
            title="Valor das diárias"
            name="guiaSP-SADT[valorTotal][valorDiarias]"
            step="0.01"
            type="number"
          />
          <Input
            title="Valor das taxas de aluguéis"
            name="guiaSP-SADT[valorTotal][valorTaxasAlugueis]"
            step="0.01"
            type="number"
          />
          <Input
            title="Valor dos materias"
            name="guiaSP-SADT[valorTotal][valorMateriais]"
            step="0.01"
            type="number"
          />
          <Input
            title="Valor dos medicamentos"
            name="guiaSP-SADT[valorTotal][valorMedicamentos]"
            step="0.01"
            type="number"
          />
          <Input
            title="Valor OPME"
            name="guiaSP-SADT[valorTotal][valorOPME]"
            step="0.01"
            type="number"
          />
          <Input
            title="Valor das gases medicinais"
            name="guiaSP-SADT[valorTotal][valorGasesMedicinais]"
            step="0.01"
            type="number"
          />
          <Input
            title="Valor total geral"
            name="guiaSP-SADT[valorTotal][valorTotalGeral]"
            step="0.01"
            type="number"
          />
          <Header className="col-span-3 mt-5">Outras despesas</Header>
          <div className="overflow-auto col-span-3">
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
                    Procedimento
                  </th>
                  <th className="text-gray-dark border text-left px-3 text-sm py-4">
                    Quantidade executada
                  </th>
                  <th className="text-gray-dark border text-left px-3 text-sm py-4">
                    Redução acréscimo
                  </th>
                  <th className="text-gray-dark border text-left px-3 text-sm py-4">
                    Valor unitário
                  </th>
                  <th className="text-gray-dark border text-left px-3 text-sm py-4">
                    Valor total
                  </th>
                  <th className="text-gray-dark border text-left px-3 text-sm py-4">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-dark">
                {outrasDespesas.length > 0 ? (
                  outrasDespesas.map((outraDespesa, key) => {
                    const procedimento = procedimentos.find(
                      procedimento =>
                        procedimento._id === outraDespesa.procedimento
                    )
                    return (
                      <tr key={key} className="text-center">
                        <td className="border text-left text-sm px-3">
                          {key + 1}
                        </td>
                        <td className="border text-left text-sm px-3">
                          {procedimento.descricaoProcedimento}
                        </td>
                        <td className="border text-left text-sm px-3">
                          {outraDespesa?.quantidadeExecutada}
                        </td>
                        <td className="border text-left text-sm px-3">
                          {outraDespesa?.reducaoAcrescimo || 0}%
                        </td>
                        <td className="border text-left text-sm px-3">
                          {formatMoney(outraDespesa?.valorUnitario || 0)}
                        </td>
                        <td className="border text-left text-sm px-3">
                          {formatMoney(outraDespesa?.valorTotal || 0)}
                        </td>
                        <td className="gap-2 flex border-b border-r text-left px-3 p-2 justify-start items-center">
                          <button
                            title="Excluir despesa"
                            className="bg-red-600 hover:opacity-80 text-white shadow-md p-2 rounded-full"
                            onClick={() =>
                              setOutrasDespesas(
                                outrasDespesas.filter(
                                  (_, index) => index !== key
                                )
                              )
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
                      colSpan={7}
                    >
                      Não há outras despesas lançadas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-4 items-center col-span-3">
            <button
              onClick={() => setOpenOutraDespesa(true)}
              type="button"
              className="bg-yellow-600 flex justify-center items-center text-white rounded-md p-3 gap-4"
            >
              <Icon.FaFileInvoiceDollar />
              Lançar outras despesas
            </button>
            <button className="bg-primary flex justify-center items-center text-white rounded-md p-3 gap-4">
              <Icon.FaSave />
              Salvar
            </button>
          </div>
        </form>
        <ModalOutrasDespesas />
      </div>
    </Modal>
  )
}
