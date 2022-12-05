import { useState, useRef } from 'react'
import * as Icons from 'react-icons/fa'
import Menu from '../../components/Menu'
import { api } from '../../services/api'
import {
  getCookie,
  returnPage,
  getFieldsValue
} from '../../utils'
import { useRouter } from 'next/router'
import swal from '@sweetalert/with-react'
import { Input, SelectSearch } from '../../components/Form'
import * as Icon from "react-icons/fa";

export default function MedicosCadastro({ medico = {}, convenios = [] }) {
  const { replace } = useRouter()
  const [loading, setLoading] = useState(false)
  const [repasses, setRepasses] = useState(medico.repasse)
  const selectRef = useRef()

  async function handleDelete(id) {
    const repassesList = repasses.filter(repasse => repasse._id !== id)
    return handleSubmit(repassesList, false)
  }

  async function handleSubmit(e, form = true) {
    setLoading(true)
    if(form) {
      e.preventDefault()
    }
    const body = form ? getFieldsValue(e) : e
    try {
      const response = await api({
        url: `/medicos/${medico._id}`,
        method: 'put',
        data: {
          repasse: form ? [
            ...repasses.map(repasse => ({
              ...repasse,
              convenio: repasse.convenio._id
            })),
            body
          ] : body
        }
      })
      if (!response) {
        throw new Error(
          'Houve um erro ao tentar cadastrar! tente novamente mais tarde!'
        )
      }

      swal('Sucesso!', ' ', 'success', {
        timer: 1000,
        buttons: false
      })

      setRepasses(response.data.repasse)
      if(form) {
        e.target.reset()
      }
      selectRef.current.clearValue()
    } catch (err) {
      setLoading(false)
      if (err.response) {
        return swal('Espere', `${err.response.data}`, 'error')
      }
      swal('Espere!', `${err.message}`, 'error')
    }
  }

  return (
    <Menu stateLoading={loading} title={medico.nome}>
      <form className="px-5 xl:px-10 pb-5 pt-8" onSubmit={handleSubmit}>
        <div className="flex flex-col xl:grid xl:grid-cols-4 gap-4 items-center justify-center">
          <SelectSearch
            className="col-span-3"
            name='convenio'
            title='Convênio'
            setRef={reference => selectRef.current = reference}
            options={convenios
              .filter(convenio => !repasses.some(repasse => repasse.convenio._id === convenio._id))
              .map(convenio => ({
              value: convenio._id,
              label: convenio.nome
            }))}
          />
          <div className="flex w-full justify-center items-center gap-2 border rounded bg-gray-100">
            <span className="pl-5 pr-3">%</span>
            <Input required name='porcentagem' title='Porcentagem' min={0} max={100} type="number" />
          </div>
        </div>

        <div className="flex xl:flex-row flex-col justify-end py-7 gap-3">
          <button className="flex bg-primary justify-center items-center text-white gap-3 px-5 py-2 rounded-md text-sm">
            <Icons.FaPlus size={16} />
            Adicionar
          </button>
          <button
            type="button"
            onClick={() => replace('/medicos')}
            className="flex bg-red-700 justify-center items-center text-white gap-3 px-5 py-2 rounded-md text-sm"
          >
            <Icons.FaTimes size={16} />
            Cancelar
          </button>
        </div>
      </form>

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
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Convênio
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Porcentagem
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
            {repasses.length > 0 ? (
              repasses.map((item, key) => {
                return (
                  <tr key={item._id} className="text-center">
                    <td className="border text-left text-sm px-3">{key + 1}</td>
                    <td className="border text-left text-sm px-3">
                      {item.convenio.nome || '-'}
                    </td>
                    <td className="border text-left text-sm px-3">
                      {item.porcentagem || '0'}%
                    </td>
                    <td className="gap-2 flex border-b border-r text-left px-3 p-2 justify-start items-center">
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
                  Não há repasse cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Menu>
  )
}

export async function getServerSideProps(ctx) {
  const payload = getCookie(ctx, 'payload')
  if (!payload) {
    return returnPage(ctx)
  }
  try {
    const { id } = ctx.query
    const convenios = await api.get(`/convenios`)
    const medico = id
      ? await api.get(`/medicos/${id}`).then(response => response.data)
      : {}
    return {
      props: {
        medico,
        convenios: convenios.data
      }
    }
  } catch (err) {
    console.log(err)
    return {
      props: {
        medico: {}
      }
    }
  }
}
