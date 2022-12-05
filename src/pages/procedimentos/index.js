/* eslint-disable indent */
import { useState, useEffect, useRef } from 'react'
import * as Icon from 'react-icons/fa'
import Menu from '../../components/Menu'
import { api } from '../../services/api'
import {
  getCookie,
  returnPage,
  getFieldsValue,
  setFieldsValue,
  debounceEvent
} from '../../utils'
import swal from '@sweetalert/with-react'
import Modal from '../../components/Modal'
import { Input, SelectSearch } from '../../components/Form'
import { useFetch } from '../../hooks/useFetch'
import { codigoDaDespesaANS, unidadesDeMedidasANS } from '../../data/'

export default function Procedimentos({ dataInitial = [] }) {
  const [show, setShow] = useState(false)
  const [procedimentos, setProcedimentos] = useState(dataInitial)
  const [procedimento, setProcedimento] = useState({})
  const [data, mutate] = useState(dataInitial)
  const { remove } = useFetch()

  const selectUnidadeMedidaRef = useRef()
  const selectCodigoDespesaRef = useRef()

  useEffect(() => {
    setTimeout(() => {
      setFieldsValue(procedimento)
      const optionUnidadeMedida =
        selectUnidadeMedidaRef.current?.props.options?.find(
          option => option.value === procedimento.unidadeMedida
        )
      optionUnidadeMedida &&
        selectUnidadeMedidaRef.current?.selectOption(optionUnidadeMedida)

      const optionCodigoDespesa =
        selectCodigoDespesaRef.current?.props.options?.find(
          option => option.value === procedimento.codigoDespesa
        )
      optionCodigoDespesa &&
        selectCodigoDespesaRef.current?.selectOption(optionCodigoDespesa)
    }, 100)
  }, [show])

  function handleSearch(value) {
    if (value === '') {
      return mutate(procedimentos)
    }
    mutate(
      procedimentos.filter(
        item =>
          item.descricaoProcedimento.match(new RegExp(value, 'gim')) ||
          item.codigoProcedimento?.match(new RegExp(value, 'gim'))
      )
    )
  }

  async function handleDelete(_id) {
    // eslint-disable-next-line no-unused-vars
    const [_, error] = await remove(`/procedimentos/${_id}`)
    if (error) return
    mutate(data.filter(item => item._id !== _id))
    setProcedimentos(procedimentos.filter(item => item._id !== _id))
    swal('Sucesso', 'Procedimento removido com sucesso', 'success', {
      timer: 3000,
      buttons: false
    })
  }

  async function handleSubmit(e) {
    try {
      e.preventDefault()
      const fields = getFieldsValue(e)
      const response = await api({
        method: procedimento._id ? 'put' : 'post',
        url: procedimento._id
          ? `/procedimentos/${procedimento._id}`
          : '/procedimentos',
        data: fields
      }).then(response => response.data)
      if (!response) {
        throw new Error('Erro ao cadastrar procedimento')
      }
      if (!procedimento._id) {
        mutate([...data, response])
        setProcedimentos([...procedimentos, response])
      } else {
        mutate(
          data.map(item =>
            item._id === procedimento._id
              ? { ...procedimento, ...fields }
              : item
          )
        )
        setProcedimentos(
          procedimentos.map(item =>
            item._id === procedimento._id
              ? { ...procedimento, ...fields }
              : item
          )
        )
      }
      setProcedimento({})
      setShow(false)
      swal('Sucesso', 'Procedimento cadastrado com sucesso', 'success', {
        buttons: false,
        timer: 3000
      })
    } catch (err) {
      swal('Erro', `${err.response.data}`, 'error')
    }
  }

  return (
    <Menu title="Procedimentos">
      <div className="flex flex-col lg:flex-row gap-3 justify-between px-10 py-8 items-start lg:items-center w-full">
        <div className="flex w-full max-w-md justify-between border rounded-lg">
          <input
            onChange={debounceEvent(({ target }) => handleSearch(target.value))}
            placeholder="Pesquisar"
            className="border-none lg:flex-1 p-2 outline-none rounded-lg flex"
          />
          <div className="flex p-3 justify-center items-center">
            <Icon.FaSearch size={15} className="text-gray-400" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => {
              setProcedimento({})
              setShow(true)
            }}
            className="bg-primary shadow-lg hover:opacity-80 rounded-md text-white font-semibold p-3 gap-3 flex justify-center items-center text-sm"
          >
            <Icon.FaTasks size={18} /> Novo Procedimento
          </button>
        </div>
      </div>
      <div className="mx-5 md:mx-10 overflow-auto">
        <table className="w-full table-striped">
          <thead>
            <tr>
              <th
                className="text-gray-dark border text-left px-3 text-sm py-4"
                width={50}
              >
                #
              </th>
              <th className="text-gray-dark w-10 border text-left px-3 text-sm py-4">
                Código
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
                .sort((procedimentoA, procedimentoB) =>
                  procedimentoA.descricaoProcedimento >
                  procedimentoB.descricaoProcedimento
                    ? 1
                    : -1
                )
                .map((item, key) => {
                  return (
                    <tr key={key} className="text-center">
                      <td className="border text-left text-sm px-3">
                        {key + 1}
                      </td>
                      <td className="border text-left text-sm px-3">
                        {item.codigoProcedimento || '-'}
                      </td>
                      <td className="border text-left text-sm px-3">
                        {item.descricaoProcedimento || '-'}
                      </td>
                      <td className="gap-2 flex border-r border-b text-left px-3 p-2 justify-start items-center">
                        <button
                          className="bg-primary hover:opacity-80 text-white shadow-md p-2 rounded-full"
                          onClick={() => {
                            setProcedimento(item)
                            setShow(true)
                          }}
                        >
                          <Icon.FaEdit size={13} />
                        </button>
                        <button
                          className="bg-red-600 hover:opacity-80 text-white shadow-md p-2 rounded-full"
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
                        >
                          <Icon.FaTrash size={13} />
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
                  Não há procedimentos lançados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal
        classNameModal="!max-w-xl h-[600px]"
        closeWithEsc
        open={show}
        setOpen={setShow}
      >
        <div className="w-full h-screen flex justify-center items-center">
          <div className="bg-white w-full max-w-xl p-10 rounded-md grid gap-2">
            <h1 className="text-gray-700 text-2xl font-bold flex justify-between items-center">
              {procedimento._id ? 'Editar Procedimento' : 'Novo Procedimento'}
              <Icon.FaTimes
                onClick={() => setShow(false)}
                className="text-gray-500 text-md cursor-pointer font-normal"
              />
            </h1>
            <hr />
            <form
              className="w-full mt-3 flex flex-col gap-4"
              onSubmit={handleSubmit}
            >
              <Input title="Descrição" name="descricaoProcedimento" />
              <SelectSearch
                title="Unidade de Medida"
                name="unidadeMedida"
                options={unidadesDeMedidasANS}
                setRef={ref => (selectUnidadeMedidaRef.current = ref)}
              />
              <SelectSearch
                title="Código da despesa"
                name="codigoDespesa"
                options={codigoDaDespesaANS}
                setRef={ref => (selectCodigoDespesaRef.current = ref)}
              />
              <Input title="Código da tabela" name="codigoTabela" />
              <Input title="Código do procedimento" name="codigoProcedimento" />
              <div className="w-full flex justify-end items-center">
                <button className="bg-primary w-full px-3 py-2 rounded-md text-white text-lg flex justify-center items-center gap-4">
                  <Icon.FaSave />
                  Salvar
                </button>
              </div>
            </form>
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
    const dataInitial = await api
      .get('/procedimentos')
      .then(response => response.data)

    if (!dataInitial) {
      throw new Error('Houve um erro ao carregar os dados!')
    }

    return {
      props: {
        dataInitial
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
