/* eslint-disable new-cap */
import { useState, useRef, useEffect } from 'react'
import Menu from '../../components/Menu'
import { Header, Item, Span, Input } from '../../components/Form'
import Select from 'react-select'
import * as Icon from 'react-icons/fa'
import { api, ws } from '../../services/api'
import { formatMoney, getFieldsValue } from '@doxa-code/utils'
import { format, parseISO } from 'date-fns'
import { useFetch } from '../../hooks/useFetch'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import swal from '@sweetalert/with-react'
import { useAgendamentoStore } from '../../hooks/store'
import Modal from '../../components/Modal'

export default function RepasseMedico({
  medicos = [],
  modal = false,
  convenios = [],
  procedimentos = []
}) {
  const [resultados, setResultados] = useState([])
  const { create, fetch } = useFetch()
  const [medico, setMedico] = useState({})
  const [valorTotal, setValorTotal] = useState(0)
  const { setAgendamento, setScreen, setShowAgendamento, agendamento } = useAgendamentoStore(
    state => state
  )
  const [openRepasse, setOpenRepasse] = useState(false)

  const pdf = useRef()

  useEffect(() => {
    ws.on('create agendamento', handleLoad)
    ws.on('update agendamento', handleLoad)

    return () => {
      ws.off('create agendamento')
      ws.off('update agendamento')
    }
  }, [])

  useEffect(() => {
    setValorTotal(resultados.map(calcularHonorarios).reduce((a, b) => a + b, 0))
  }, [resultados])

  const calcularHonorarios = agendamento => {
    const valorHonorario = agendamento.procedimentoHonorario || 0
    const repasse = {
      porcentagem: 
      agendamento.repasse 
      ||
      medico?.repasse?.find(
        repasse => repasse.convenio._id === agendamento.convenio._id
      )?.porcentagem 
      ||  0
    } 
    const valorRepasse =
      (parseFloat(valorHonorario) * parseFloat(repasse?.porcentagem)) / 100

    return valorRepasse
  }
  function handleLoad(agendamentos) {
    setResultados(state =>
      state.map(
        resultado =>
          agendamentos.find(agendamento => agendamento._id === resultado._id) ||
          resultado
      )
    )
  }

  async function handleUpdate(e) {
    e.preventDefault()
    const body = getFieldsValue(e)
    try {
      const response = await api({
        url:`/agendamentos/${agendamento._id}`,
        method:'put',
        data: {
          ...agendamento,
          ...body
        }
      })
      if (!response) {
        throw new Error(
          'Houve um erro ao tentar atualizar! tente novamente mais tarde!'
        )
      }

      swal('Sucesso!', ' ', 'success', {
        timer: 1000,
        buttons: false
      })
      setAgendamento({})
      setResultados(resultados.map(resultado => {
        if (resultado._id === agendamento._id){
          return {
            ...resultado,
            ...agendamento,
            ...body
          }
        }
        return resultado
      }))
      setOpenRepasse(false)
    } catch (err) {
      if (err.response) {
        return swal('Espere', `${err.response.data}`, 'error')
      }
      swal('Espere!', `${err.message}`, 'error')
    }
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    const fields = getFieldsValue(e, false)
    if (!fields.medico) return swal('Selecione um médico', ' ', 'warning')
    const [response, error] = await create('/agendamentos/relatorio', {
      ...fields,
      status: 'Chegou',
      bloqueio: false
    })

    if (error) return setResultados([])

    setResultados(response)
  }

  async function handleToPdf() {
    const canvas = await html2canvas(pdf.current)
    const img = canvas.toDataURL('image/png')
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'cm'
    })
    doc.addImage(img, 'JPEG', 0.5, 0.5)
    const blobPDF = new Blob([doc.output('blob')], { type: 'application/pdf' })
    const blobUrl = URL.createObjectURL(blobPDF)

    window.open(blobUrl)
  }

  async function handleLoadAgendamento(_id) {
    const [data, error] = await fetch(`/agendamentos/${_id}`)
    if (error) return
    setScreen('Agendamento')
    setAgendamento(data)
    setShowAgendamento(true)
  }

  return (
    <Menu
      modal={modal}
      title="Repasse Médico"
      className="bg-transparent flex flex-col gap-3"
    >
      <div className="rounded-2xl flex justify-center items-center p-5 xl:p-8 bg-white">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col xl:grid xl:grid-cols-2 gap-4 w-full"
        >
          <Item span={2}>
            <Span>Médico:</Span>
            <Select
              isClearable
              name="medico"
              placeholder="Nenhum médico selecionado!"
              options={medicos?.map(item => ({
                label: item.nome,
                value: item._id,
                medico: item
              }))}
              noOptionsMessage={() => 'Nenhum registro encontrado'}
              loadingMessage={() => 'Procurando...'}
              onChange={item => {
                if (!item) {
                  setMedico({})
                  setValorTotal(0)
                  setResultados([])
                  return
                }
                setMedico(item?.medico)
              }}
            />
          </Item>
          <Item>
            <Span>Conve̊nio:</Span>
            <Select
              isClearable
              name="convenio"
              placeholder="Nenhum convenio selecionado!"
              options={convenios?.map(item => ({
                label: item.nome,
                value: item._id
              }))}
              noOptionsMessage={() => 'Nenhum registro encontrado'}
              loadingMessage={() => 'Procurando...'}
            />
          </Item>
          <Item>
            <Span>Procedimento:</Span>
            <Select
              isClearable
              name="procedimento"
              placeholder="Nenhum procedimento selecionado!"
              options={procedimentos?.map(item => ({
                label: item.descricaoProcedimento,
                value: item._id
              }))}
              noOptionsMessage={() => 'Nenhum registro encontrado'}
              loadingMessage={() => 'Procurando...'}
            />
          </Item>
          <Item className="mt-3">
            <Input type="date" name="dateIn" title="Inicio" />
          </Item>
          <Item className="mt-3">
            <Input type="date" name="dateOut" title="Fim" />
          </Item>
          <div className="flex justify-end col-span-2">
            <button className="bg-primary xl:w-32 w-full shadow-lg hover:opacity-80 rounded-md text-white font-semibold p-3 gap-3 flex justify-center items-center text-sm">
              <Icon.FaSearch size={18} />
              Buscar
            </button>
          </div>
        </form>
      </div>
      <div className="p-5 bg-white rounded-2xl">
        <div className="flex flex-col items-center justify-center">
          <span className="text-primary text-4xl text-semibold">
            {formatMoney(valorTotal)}
          </span>
          <span className="text-sm text-light text-zinc-400">
            Valor total a pagar
          </span>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-8 flex flex-col gap-3 grid">
        <Header>
          <div className="flex xl:flex-row flex-col w-full justify-end xl:items-center gap-4">
            <button
              onClick={() => handleToPdf()}
              className="text-sm flex justify-center items-center gap-2 font-normal text-white bg-pink-500 xl:p-4 p-3 rounded-md"
            >
              <Icon.FaPrint size={18} />
              Imprimir Lista
            </button>
          </div>
        </Header>
        <div ref={pdf} className="mb-20 overflow-auto">
          <table className="w-full table-striped">
            <thead>
              <tr>
                <th className="w-10 text-gray-dark border text-left px-3 text-sm py-4">
                  #
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Paciente
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Médico
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Convênio
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Procedimento
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Valor
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Valor Honorário
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Valor Filme
                </th>
                <th className="text-gray-dark border text-left px-3 text-sm py-4">
                  Repasse
                </th>
                <th className="w-1/4 text-gray-dark border text-left px-3 text-sm py-4">
                  Inicio
                </th>
                <th className="w-1/4 text-gray-dark border text-left px-3 text-sm py-4">
                  Fim
                </th>
                <th className="w-1/4 text-gray-dark border text-left px-3 text-sm py-4">
                  Status
                </th>
                <th className="w-10 text-gray-dark border text-left px-3 text-sm py-4">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-dark">
              {resultados.length > 0 ? (
                resultados.map((resultado, index) => {
                  return (
                    <tr className="text-center" key={index}>
                      <td className="border text-left text-sm p-3">
                        {resultado.codigo}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {resultado.paciente.nome}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {resultado.medico.nome}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {resultado.convenio.nome}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {resultado.procedimento.descricaoProcedimento}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {formatMoney(resultado.valor)}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {formatMoney(resultado.procedimentoHonorario)}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {formatMoney(resultado.procedimentoFilme)}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {resultado.repasse ||
                          medico?.repasse?.find(
                            repasse =>
                              repasse.convenio._id === resultado.convenio._id
                          )?.porcentagem}%
                      </td>
                      <td className="border text-left text-sm p-3">
                        {format(parseISO(resultado.inicio), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {format(parseISO(resultado.fim), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {resultado.status}
                      </td>
                      <td className="gap-2 flex border-b border-r text-left px-3 p-2 justify-start items-center">
                        <button
                          title="Ver agendamento"
                          className="bg-primary hover:opacity-80 text-white shadow-md p-2 rounded-full"
                          onClick={() => handleLoadAgendamento(resultado._id)}
                        >
                          <Icon.FaCalendarCheck size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setAgendamento(resultado)
                            setOpenRepasse(true)
                          }}
                          title="Ajustar repasse"
                          className="bg-green-600 hover:opacity-80 text-white shadow-md p-2 rounded-full"
                        >
                          <Icon.FaCommentDollar size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr className="text-center">
                  <td
                    colSpan={12}
                    className="border text-center text-sm p-3 italic"
                  >
                    Não há resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Modal closeWithEsc open={openRepasse} setOpen={setOpenRepasse}>
        <form onSubmit={handleUpdate} className="bg-white grid h-screen scrollbar max-h-[400px] overflow-auto w-full max-w-[800px] gap-4 p-5 rounded-md">
          <div className="flex mb-2 justify-end items-center pr-2">
            <Icon.FaTimes
              size={20}
              className="cursor-pointer text-gray-400"
              onClick={() => setOpenRepasse(false)}
            />
          </div>        
              <Input defaultValue={agendamento.procedimentoHonorario} name="procedimentoHonorario" title="Valor Honorário" />
              <Input defaultValue={agendamento.procedimentoFilme} name="procedimentoFilme" title="Valor Filme" />
              <Input defaultValue={agendamento.repasse} name="repasse" title="Repasse Médico %" />
            
          <button className="flex justify-center items-center border p-2 rounded-md text-white gap-2 bg-green-500" >
            Salvar <Icon.FaSave size={14} />
          </button>
        </form>
      </Modal>
    </Menu>
  )
}

export async function getServerSideProps() {
  const convenios = await api.get('/convenios')
  const medicos = await api.get('/medicos')
  const procedimentos = await api.get('/procedimentos') 

  return {
    props: {
      convenios: convenios.data || [],
      medicos: medicos.data || [],
      procedimentos: procedimentos.data || []
    }
  }
}
