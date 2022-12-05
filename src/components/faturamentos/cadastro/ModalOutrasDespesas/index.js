import { useFaturamentoStore } from '../../../../hooks/store'
import { Header, Input, SelectSearch } from '../../../Form'
import Modal from '../../../Modal'
import * as Icon from 'react-icons/fa'
import { getFieldsValue } from '@doxa-code/utils'

export default function ModalOutrasDespesas() {
  const {
    openOutraDespesa,
    setOpenOutraDespesa,
    procedimentos,
    setOutrasDespesas,
    outrasDespesas
  } = useFaturamentoStore(state => state)

  function addOutraDespesa(e) {
    e.preventDefault()
    const fields = getFieldsValue(e)
    setOutrasDespesas([...outrasDespesas, fields])
    setOpenOutraDespesa(false)
  }

  return (
    <Modal closeWithEsc open={openOutraDespesa} setOpen={setOpenOutraDespesa}>
      <div className="bg-white w-full max-w-6xl p-10 rounded-md">
        <Header>
          <div className="flex justify-between items-center">
            <span>Outra Despesa</span>
            <Icon.FaTimes
              className="cursor-pointer"
              onClick={() => setOpenOutraDespesa(false)}
              size={18}
            />
          </div>
        </Header>
        <form
          onSubmit={addOutraDespesa}
          className="py-5 flex flex-col xl:grid grid-cols-3 gap-4"
        >
          <SelectSearch
            title="Procedimento"
            name="procedimento"
            className="col-span-2"
            options={procedimentos.map(procedimento => ({
              value: procedimento._id,
              label: procedimento.descricaoProcedimento
            }))}
          />
          <Input
            title="Quantidade executada"
            name="quantidadeExecutada"
            type="number"
            min={1}
          />
          <Input
            title="Redução acréscimo"
            name="reducaoAcrescimo"
            step="0.01"
            min={0}
            max={100}
            type="number"
          />
          <Input
            title="Valor unitário"
            name="valorUnitario"
            step="0.01"
            type="number"
            onChange={e => {
              const { value } = e.target
              const quantidadeExecutada = parseInt(
                document.querySelector("input[name='quantidadeExecutada']")
                  .value || 0
              )
              const valorTotal = parseFloat(value || 0) * quantidadeExecutada
              document.querySelector("input[name='valorTotal']").value =
                valorTotal
            }}
          />
          <Input
            title="Valor total"
            name="valorTotal"
            step="0.01"
            type="number"
          />
          <div className="flex justify-end gap-4 items-center col-span-3">
            <button className="bg-lime-500 flex justify-center items-center text-white rounded-md p-3 gap-4">
              <Icon.FaPlus />
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
