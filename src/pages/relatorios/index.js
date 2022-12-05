/* eslint-disable new-cap */
import { useState, useRef, useEffect } from 'react'
import Menu from '../../components/Menu'
import { Header, Item, Span, Input } from '../../components/Form'
import Select from 'react-select'
import SelectSearch from '../../components/SelectSearch'
import * as Icon from 'react-icons/fa'
import { api, ws } from '../../services/api'
import { getFieldsValue, formatPacienteSearch } from '../../utils'
import { format, parseISO } from 'date-fns'
import { useFetch } from '../../hooks/useFetch'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import swal from '@sweetalert/with-react'
import { useAgendamentoStore, useMenuStore } from '../../hooks/store'

export default function Relatorios({
  convenios = [],
  medicos = [],
  procedimentos = [],
  modal = false
}) {
  const [resultados, setResultados] = useState([])
  const [pacientesList, setPacientesList] = useState([])
  const { create, fetch, remove } = useFetch()
  const { setAgendamento, setScreen, setShowAgendamento } = useAgendamentoStore(
    state => state
  )
  const { setStateLoading } = useMenuStore()

  const pdf = useRef()

  useEffect(() => {
    ws.on('create agendamento', handleLoad)
    ws.on('update agendamento', handleLoad)

    return () => {
      ws.off('create agendamento')
      ws.off('update agendamento')
    }
  }, [])

  function handleLoad(agendamentos) {
    setResultados(state =>
      state.map(
        resultado =>
          agendamentos.find(agendamento => agendamento._id === resultado._id) ||
          resultado
      )
    )
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    setStateLoading(true)
    const fields = getFieldsValue(e, false)
    if (!Object.keys(fields).length) {
      setStateLoading(false)
      return
    }
    const [response, error] = await create('/agendamentos/relatorio', {
      ...fields,
      bloqueio: false
    })

    if (error) {
      setStateLoading(false)
      return setResultados([])
    }

    setResultados(response)
    setStateLoading(false)
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

  async function handleSearchPaciente(value) {
    if (value === '') {
      return []
    }
    const [{ pacientes }, error] = await fetch(
      `/pacientes/search?q=${value.toLowerCase()}`
    )
    if (error) return

    return pacientes.map(paciente => ({
      label: formatPacienteSearch(paciente),
      value: paciente._id
    }))
  }

  async function handleLoadAgendamento(_id) {
    const [data, error] = await fetch(`/agendamentos/${_id}`)
    if (error) return
    if (data.bloqueio) {
      return swal({
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
        handleDeleteAgendamento(_id)
      })
    }
    setScreen('Agendamento')
    setAgendamento(data)
    setShowAgendamento(true)
  }

  async function handleDeleteAgendamento(id) {
    const [data] = await remove(`/agendamentos/${id}`)
    const { agendamentos, setAgendamentos, setShowAgendamento } =
      useAgendamentoStore(state => state)
    if (!data) return
    setAgendamentos(agendamentos.filter(agendamento => agendamento._id !== id))
    swal('Sucesso!', 'Agendamento removido com sucesso', 'success', {
      timer: 3000,
      buttons: false
    })
    setShowAgendamento(false)
  }

  return (
    <Menu
      modal={modal}
      title="Relatórios"
      className="bg-transparent flex flex-col gap-3"
    >
      <div className="rounded-2xl flex justify-center items-center p-5 xl:p-8 bg-white">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col xl:grid xl:grid-cols-2 gap-4 w-full"
        >
          <Item span={2}>
            <Span>Paciente:</Span>
            <SelectSearch
              name="paciente"
              placeholder="Nenhum paciente selecionado!"
              data={pacientesList}
              mutate={setPacientesList}
              handleSearch={handleSearchPaciente}
            />
          </Item>
          <Item>
            <Span>Convênio:</Span>
            <Select
              isClearable
              name="convenio"
              placeholder="Nenhum convênio selecionado!"
              options={convenios?.map(item => ({
                label: item?.nome,
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
                label: item?.descricaoProcedimento,
                value: item._id
              }))}
              noOptionsMessage={() => 'Nenhum registro encontrado'}
              loadingMessage={() => 'Procurando...'}
            />
          </Item>
          <Item>
            <Span>Médico:</Span>
            <Select
              isClearable
              name="medico"
              placeholder="Nenhum médico selecionado!"
              options={medicos?.map(item => ({
                label: item?.nome,
                value: item._id
              }))}
              noOptionsMessage={() => 'Nenhum registro encontrado'}
              loadingMessage={() => 'Procurando...'}
            />
          </Item>
          <Item>
            <Span>Status:</Span>
            <Select
              isClearable
              name="status"
              placeholder="Nenhum status selecionado!"
              options={[
                { label: 'Agendado', value: 'Agendado' },
                { label: 'Confirmado', value: 'Confirmado' },
                { label: 'Cancelado', value: 'Cancelado' },
                { label: 'Chegou', value: 'Chegou' },
                { label: 'Realizado', value: 'Realizado' }
              ]}
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
      <div className="rounded-2xl bg-white p-8 flex flex-col gap-3">
        <Header>
          <div className="flex xl:flex-row flex-col w-full justify-between xl:items-center gap-4">
            <span>Resultados</span>
            <button
              onClick={() => handleToPdf()}
              className="text-xs flex justify-center items-center gap-2 font-normal  text-white bg-pink-500 xl:p-3 p-3 rounded-md"
            >
              <Icon.FaPrint size={14} />
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
                resultados.map(resultado => {
                  return (
                    <tr className="text-center" key={resultado._id}>
                      <td className="border text-left text-sm p-3">
                        {resultado?.codigo}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {resultado.paciente?.nome}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {resultado.medico?.nome}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {resultado.convenio?.nome}
                      </td>
                      <td className="border text-left text-sm p-3 whitespace-pre-wrap">
                        {resultado.procedimento?.descricaoProcedimento}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {format(parseISO(resultado.inicio), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {format(parseISO(resultado.fim), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="border text-left text-sm p-3">
                        {resultado?.status}
                      </td>
                      <td className="gap-2 border-b border-r text-left px-3 p-2">
                        <div className="h-full">
                          <button
                            title="Ver agendamento"
                            className="bg-primary hover:opacity-80 text-white shadow-md p-2 rounded-full"
                            onClick={() => handleLoadAgendamento(resultado._id)}
                          >
                            <Icon.FaCalendarCheck size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr className="text-center">
                  <td
                    colSpan={10}
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
