import { useState } from 'react'
import { parseISO, format, isAfter } from 'date-fns'
import { useAgendamentoStore } from '../../../../../hooks/store'

export default function Historico() {
  const { agendamento, screen } = useAgendamentoStore(state => state)
  const [historico, setHistorico] = useState(agendamento.historico)

  function handleSearch(type) {
    return function (e) {
      if (!e.target.value) {
        return setHistorico(agendamento.historico)
      }
      setHistorico(
        agendamento.historico.filter(item => {
          switch (type) {
            case 'medico':
              return item.medico.nome
                .toLowerCase()
                .includes(e.target.value.toLowerCase())
            case 'convenio':
              return item.convenio.nome
                .toLowerCase()
                .includes(e.target.value.toLowerCase())
            case 'data':
              return item.inicio
                .toLowerCase()
                .includes(e.target.value.toLowerCase())
            case 'procedimento':
              return item.procedimento.descricaoProcedimento
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
    <div className={`px-5 py-8 gap-4 ${screen !== 'Histórico' && 'hidden'}`}>
      <div className="max-h-96 overflow-auto">
        <table className="table-striped w-full border-collapse">
          <thead>
            <tr className="sticky top-0 bg-white shadow-md">
              <th
                width={300}
                className="px-5 py-2 text-sm text-center border font-semibold text-gray-700"
              >
                Data de Atendimento
              </th>
              <th className="px-5 py-2 text-sm text-center border font-semibold text-gray-700">
                Médico
              </th>
              <th className="px-5 py-2 text-sm text-center border font-semibold text-gray-700">
                Convênio
              </th>
              <th className="px-5 py-2 text-sm text-center border font-semibold text-gray-700">
                Procedimento
              </th>
            </tr>
            <tr>
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
                  placeholder="Médicos"
                  onChange={handleSearch('medico')}
                />
              </th>
              <th className="p-2 border">
                <input
                  className="rounded border px-2 py-1 w-full outline-none text-gray-500 text-sm"
                  placeholder="Convênios"
                  onChange={handleSearch('convenio')}
                />
              </th>

              <th className="p-2 border">
                <input
                  className="rounded border px-2 py-1 w-full outline-none text-gray-500 text-sm"
                  placeholder="Procedimento"
                  onChange={handleSearch('procedimento')}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {historico?.length > 0 ? (
              historico
                .sort((a, b) =>
                  !isAfter(parseISO(a.inicio), parseISO(b.inicio)) ? 1 : -1
                )
                .map((item, index) => (
                  <tr key={index}>
                    <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                      {format(parseISO(item.inicio), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                      {item.medico?.nome}
                    </td>
                    <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                      {item.convenio?.nome}
                    </td>
                    <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                      {item.procedimento?.descricaoProcedimento ||
                        item.observacao}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td
                  className="px-5 py-2 text-sm font-light italic text-center text-gray-400 border"
                  colSpan={4}
                >
                  Nenhum agendamento encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
