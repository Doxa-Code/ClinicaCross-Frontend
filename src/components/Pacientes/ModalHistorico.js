import { parseISO, format, isAfter } from 'date-fns'
import { usePaciente } from '../../hooks/store'
import Modal from '../Modal'

export default function ModalHistorico() {
  const { historico, showHistorico, setShowHistorico } = usePaciente()
  return (
    <Modal
      classNameModal="overflow-h-auto min-h-[500px]"
      closeWithEsc
      open={showHistorico}
      setOpen={setShowHistorico}
    >
      <div className="flex flex-col justify-center items-start gap-4 w-full p-5">
        <span className="text-2xl text-primary font-semibold">
          Historico do paciente
        </span>
        <hr className="w-full" />
      </div>
      <div className={'px-5 gap-4'}>
        <div className="max-h-96 overflow-auto">
          <table className="table-striped w-full border-collapse">
            <thead>
              <tr className="sticky top-0 bg-white shadow-md">
              <th className="px-5 py-2 text-sm text-center border font-semibold text-gray-700">
                  Codigo
                </th>
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
                        {item?.codigo}
                      </td>
                      <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                        {format(parseISO(item.inicio), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                        {item.medico.nome}
                      </td>
                      <td className="px-5 py-2 text-sm font-normal text-center text-gray-700 border">
                        {item.convenio.nome}
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
    </Modal>
  )
}
