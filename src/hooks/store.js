import cookies from 'next-cookies'
import create from 'zustand'
import { persist } from 'zustand/middleware'

export const useMenuStore = create(set => ({
  stateLoading: false,
  setStateLoading: stateLoading => set({ stateLoading })
}))

export const useDeclaracaoStore = create(set => ({
  showDeclaracao: false,
  declaracao: {},
  readOnly: false,
  modelosDeclaracoes: [],
  setShowDeclaracao: showDeclaracao => set({ showDeclaracao }),
  setModelosDeclaracoes: modelosDeclaracoes => set({ modelosDeclaracoes }),
  setDeclaracao: declaracao => set({ declaracao }),
  setReadOnly: readOnly => set({ readOnly })
}))

export const useFaturamentoStore = create(set => ({
  faturamento: {},
  agendamento: {},
  agendamentos: [],
  outrasDespesas: [],
  procedimentos: [],
  setAgendamento: agendamento => set({ agendamento }),
  setFaturamento: faturamento => set({ faturamento }),
  setAgendamentos: agendamentos => set({ agendamentos }),
  setProcedimentos: procedimentos => set({ procedimentos }),
  setOutrasDespesas: outrasDespesas => set({ outrasDespesas }),
  openOutraDespesa: false,
  setOpenOutraDespesa: openOutraDespesa => set({ openOutraDespesa }),
  openLancamentoGuia: false,
  setOpenLancamentoGuia: openLancamentoGuia => set({ openLancamentoGuia })
}))

export const useAgendamentoStore = create(set => ({
  agendamentos: [],
  agendamento: {},
  configuracoes: {},
  showAgendamento: false,
  screen: 'Agendamento',
  setAgendamentos: agendamentos => set({ agendamentos }),
  setAgendamento: agendamento => set({ agendamento }),
  setConfiguracoes: configuracoes => set({ configuracoes }),
  setShowAgendamento: showAgendamento => set({ showAgendamento }),
  setScreen: screen => set({ screen })
}))

export const useAnexoStore = create(set => ({
  showAnexo: false,
  showCompareAnexo: false,
  compareFiles: [],
  anexo: {},
  setShowAnexo: showAnexo => set({ showAnexo }),
  setShowCompareAnexo: showCompareAnexo => set({ showCompareAnexo }),
  setAnexo: anexo => set({ anexo }),
  setCompareFiles: compareFiles => set({ compareFiles })
}))

export const useHistoricoStore = create(set => ({
  showHistorico: false,
  historico: {},
  setShowHistorico: showHistorico => set({ showHistorico }),
  setHistorico: historico => set({ historico })
}))

export const usePaciente = create(set => ({
  showHistorico: false,
  historico: [],
  setShowHistorico: showHistorico => set({ showHistorico }),
  setHistorico: historico => set({ historico })
}))

export const useLaudoStore = create(set => ({
  showLaudo: false,
  laudo: {},
  readOnly: false,
  setShowLaudo: showLaudo => set({ showLaudo }),
  setLaudo: laudo => set({ laudo }),
  setReadOnly: readOnly => set({ readOnly })
}))

export const usePedidoStore = create(set => ({
  showPedido: false,
  pedido: {},
  readOnly: false,
  setShowPedido: showPedido => set({ showPedido }),
  setPedido: pedido => set({ pedido }),
  setReadOnly: readOnly => set({ readOnly })
}))

export const useProntuarioStore = create(set => ({
  showProntuario: false,
  prontuario: {},
  readOnly: false,
  modelosProntuarios: [],
  setShowProntuario: showProntuario => set({ showProntuario }),
  setProntuario: prontuario => set({ prontuario }),
  setReadOnly: readOnly => set({ readOnly }),
  setModelosProntuarios: modelosProntuarios => set({ modelosProntuarios })
}))

export const useAtestadoStore = create(set => ({
  showAtestado: false,
  atestado: {},
  modelosAtestado: [],
  readOnly: false,
  setShowAtestado: showAtestado => set({ showAtestado }),
  setModelosAtestado: modelosAtestado => set({ modelosAtestado }),
  setAtestado: atestado => set({ atestado }),
  setReadOnly: readOnly => set({ readOnly })
}))

export const useReceitaStore = create(set => ({
  showReceita: false,
  receita: {},
  readOnly: false,
  medicamentos: [],
  modelosReceita: [],
  setShowReceita: showReceita => set({ showReceita }),
  setReceita: receita => set({ receita }),
  setReadOnly: readOnly => set({ readOnly }),
  setMedicamentos: medicamentos => set({ medicamentos }),
  setModelosReceita: modelosReceita => set({ modelosReceita })
}))

export const useExameStore = create(set => ({
  showExame: false,
  exame: {},
  readOnly: false,
  setShowExame: showExame => set({ showExame }),
  setExame: exame => set({ exame }),
  setReadOnly: readOnly => set({ readOnly })
}))
export const useAgendarStore = create(set => ({
  showAgendar: false,
  showModalCadastroPaciente: false,
  bloqueio: false,
  agendamentoEdit: {},
  paciente: {},
  pacientes: [],
  convenios: [],
  medico: null,
  procedimento: {},
  medicos: [],
  procedimentos: [],
  procedimentosSelected: [],
  inicio: '',
  fim: '',
  setShowModalCadastroPaciente: showModalCadastroPaciente =>
    set({ showModalCadastroPaciente }),
  setInicio: inicio => set({ inicio }),
  setFim: fim => set({ fim }),
  setShowAgendar: showAgendar => set({ showAgendar }),
  setAgendamentoEdit: agendamentoEdit => set({ agendamentoEdit }),
  setMedicos: medicos => set({ medicos }),
  setMedico: medico => set({ medico }),
  setProcedimento: procedimento => set({ procedimento }),
  setProcedimentos: procedimentos => set({ procedimentos }),
  setPacientes: pacientes => set({ pacientes }),
  setPaciente: paciente => set({ paciente }),
  setConvenios: convenios => set({ convenios }),
  setBloqueio: bloqueio => set({ bloqueio }),
  setProcedimentosSelected: procedimentosSelected =>
    set({ procedimentosSelected })
}))

export const useFormasDePagamentoStore = create(set => ({
  formasDePagamento: [],
  setFormasDePagamento: formasDePagamento => {
    set({ formasDePagamento })
  }
}))

export const useReciboStore = create(set => ({
  recibo: {},
  showRecibo: false,
  readOnly: false,
  setRecibo: recibo => set({ recibo }),
  setShowRecibo: showRecibo => set({ showRecibo }),
  setReadOnly: readOnly => set({ readOnly })
}))

export const usePayloadStore = create(
  persist(set => ({
    payload: {},
    setPayload: payload => set({ payload })
  }))
)
export const createLogger = (ctx, getPayload = true) => {
  let payload = {}
  if (getPayload) {
    if (ctx) {
      payload = cookies(ctx).payload
    } else {
      payload = usePayloadStore(state => state.payload)
    }
  }
  return {
    error: console.log
  }
}
