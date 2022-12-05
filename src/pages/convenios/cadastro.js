/* eslint-disable indent */
import { useState, useEffect, useCallback } from 'react'
import * as Icons from 'react-icons/fa'
import Menu from '../../components/Menu'
import { api } from '../../services/api'
import {
  getCookie,
  returnPage,
  getFieldsValue,
  setFieldsValue,
  formatMoney
} from '../../utils'
import { useRouter } from 'next/router'
import swal from '@sweetalert/with-react'
import {
  Item,
  Input,
  Header,
  ToggleButton,
  Span,
  SelectSearch
} from '../../components/Form'
import { useFetch } from '../../hooks/useFetch'
import { useDropzone } from 'react-dropzone'

export default function ConveniosCadastro({
  convenioInitial = {},
  procedimentosList = []
}) {
  const { replace } = useRouter()
  const { create, update } = useFetch()
  const [geraRecibo, setGeraRecibo] = useState(false)
  const [carteirinha, setCarteirinha] = useState(true)
  const [loading, setLoading] = useState(false)
  const [procedimentos, setProcedimentos] = useState([])
  const [preview, setPreview] = useState('/image/logo-3.png')
  const [fileTmp, setFileTmp] = useState()
  const [procedimentoId, setProcedimentoId] = useState()
  const [progress, setProgress] = useState(0)
  const [procedimentoSelectRef, setProcedimentoSelectRef] = useState()
  const [convenio, setConvenio] = useState(convenioInitial)

  const onDrop = useCallback(async acceptedFiles => {
    const file = acceptedFiles[0]
    const reader = new FileReader()
    reader.onload = event => {
      setPreview(event.target.result)
    }
    reader.readAsDataURL(file)
    setFileTmp(file)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop
  })

  useEffect(() => {
    if (Object.keys(convenio).length > 0) {
      const { _id, ...data } = convenio
      setFieldsValue(data)
      setProcedimentos(data.procedimentos || [])
      setGeraRecibo(data.geraRecibo)
      setCarteirinha(data.carteirinha)
      setPreview(convenio.thumbnail || '/image/logo-3.png')
    }
  }, [convenio])

  async function handleUpload(file, convenio) {
    const formData = new FormData()
    formData.append('thumbnail', file)
    // eslint-disable-next-line no-unused-vars
    const [_, error] = convenio._id
      ? await update(`/convenios/${convenio._id}`, formData, {
          headers: {
            'Content-Type': `multipart/form-data; boundary: ${file._boundary}`
          },
          onUploadProgress: ({ loaded, total }) =>
            setProgress((loaded * 100) / total)
        })
      : await create('/convenios', formData, {
          headers: {
            'Content-Type': `multipart/form-data; boundary: ${file?._boundary}`
          },
          onUploadProgress: ({ loaded, total }) =>
            setProgress((loaded * 100) / total)
        })

    if (error) return
    setProgress(0)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    const fields = getFieldsValue(e)
    const body = {
      ...fields,
      geraRecibo,
      carteirinha
    }

    // eslint-disable-next-line no-unused-vars
    const [response, error] = convenio._id
      ? await update(`/convenios/${convenio._id}`, body)
      : await create('/convenios', body)

    if (error) return
    if (fileTmp) {
      await handleUpload(fileTmp, response)
    }

    setConvenio(response)

    swal('Sucesso!', ' ', 'success', {
      timer: 1000,
      buttons: false
    })

    replace('/convenios')
  }

  async function handleUpdate(procedimentos) {
    const [data] = convenio._id
      ? await update(`/convenios/${convenio._id}`, { procedimentos })
      : await create('/convenios', { procedimentos })
    setProcedimentos(data.procedimentos)
    if (!convenio._id) setConvenio(data)
    swal('Sucesso!', ' ', 'success', {
      timer: 1000,
      buttons: false
    })
  }

  async function handleAddProcedimento(e) {
    try {
      e.preventDefault()
      const procedimento = getFieldsValue(e)
      const fieldsRequired = ['_id', 'valorHonorario', 'valorFilme']
      if (fieldsRequired.some(key => !procedimento[key])) {
        return swal('Atenção!', 'Preencha todos os campos', 'warning')
      }
      const body = [
        ...procedimentos
          .map(procedimento => ({
            ...procedimento,
            _id: procedimento?._id?._id
          }))
          .filter(procedimento =>
            procedimentoId ? procedimento._id !== procedimentoId : true
          ),
        procedimento
      ]
      handleUpdate(body)

      setProcedimentoId()
      procedimentoSelectRef.clearValue()
      e.target.reset()
    } catch (err) {
      console.log(err.message)
    }
  }

  return (
    <Menu stateLoading={loading} title="Cadastro de convenios">
      <form className="px-5 xl:px-10 py-8 grid gap-4" onSubmit={handleSubmit}>
        <div className="flex xl:flex-row flex-col w-full  gap-8 justify-center items-center">
          <div
            className="w-80 h-60 shadow max-h-60 cursor-pointer rounded-md flex flex-col justify-center items-center"
            title="Mudar thumbnail"
            {...getRootProps()}
          >
            <input {...getInputProps()} accept="image/*" />
            <img
              src={preview}
              className="object-contain w-60 h-60  max-h-60 rounded-md"
            />
            <div className="flex flex-col w-full items-center gap-2 mt-2 justify-center">
              {progress > 0 && (
                <div className="w-full bg-gray-100 rounded-md">
                  <div
                    className="flex pl-1 h-1 bg-primary text-white justify-center rounded-md"
                    style={{
                      width: `${progress}%`
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col w-full gap-4">
            <Header>Dados do Convenio</Header>
            <div className="flex flex-col xl:grid xl:grid-cols-4 gap-4">
              <Item span={1}>
                <Input name="codigo" title="Código do convênio" />
              </Item>
              <Item span={1}>
                <Input name="numero" type="number" title="Numero do convênio" />
              </Item>
              <Item span={2}>
                <Input name="nome" required title="Nome do convênio" />
              </Item>
              <div className="flex justify-start items-center  gap-4">
                <Span>Gera recibo?</Span>
                <ToggleButton
                  name="recibo"
                  defaultValue={geraRecibo}
                  onSelected={setGeraRecibo}
                />
              </div>
              <div className="flex justify-start items-center  gap-4">
                <Span>Carteirinha?</Span>
                <ToggleButton
                  name="carteirinha"
                  defaultValue={carteirinha}
                  onSelected={setCarteirinha}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex xl:flex-row flex-col justify-end gap-2">
          <button className="flex bg-primary justify-center items-center text-white gap-3 px-5 py-2 rounded-md text-sm">
            <Icons.FaSave size={16} />
            Salvar
          </button>
          <button
            type="button"
            onClick={() => replace('/convenios')}
            className="flex py-2 bg-red-700 justify-center items-center text-white gap-3 px-5 rounded-md text-sm"
          >
            <Icons.FaTimes size={16} />
            Cancelar
          </button>
        </div>
      </form>
      <form
        id="procedimentos"
        className="px-5 xl:px-10 grid gap-4"
        onSubmit={handleAddProcedimento}
      >
        <div className="flex flex-col xl:grid xl:grid-cols-4 gap-4 ">
          <Header className="col-span-4" id="procedimentos">
            Procedimentos
          </Header>
          <SelectSearch
            className="col-span-2"
            title="Procedimento"
            isClearable
            name="_id"
            setRef={setProcedimentoSelectRef}
            placeholder="Nenhum procedimento selecionado!"
            options={procedimentosList?.map(item => ({
              label: item.descricaoProcedimento,
              value: item._id
            }))}
            onChange={procedimentoId => {
              const procedimento = procedimentosList.find(
                procedimento => procedimento._id === procedimentoId
              )
              if (!procedimento) return
              setFieldsValue({
                codigoProcedimento: procedimento.codigo
              })
            }}
            noOptionsMessage={() => 'Nenhum registro encontrado'}
            loadingMessage={() => 'Procurando...'}
          />
          <Input
            type="number"
            step="0.01"
            name="valorHonorario"
            title="Valor Honorário"
          />
          <Input
            type="number"
            step="0.01"
            name="valorFilme"
            title="Valor Filme"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button className="text-white w-full xl:max-w-[150px] justify-center p-2 px-5 flex gap-3 items-center bg-green-500 rounded-md">
            {!procedimentoId ? (
              <>
                <Icons.FaPlus /> Adicionar
              </>
            ) : (
              <>
                <Icons.FaSave /> Alterar
              </>
            )}
          </button>
        </div>
      </form>
      <div className="px-5 scrollbar xl:px-10 py-8 overflow-auto">
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
                Descrição do procedimento
              </th>
              <th className="text-gray-dark border text-left px-3 w-36 text-sm py-4">
                Valor Honorário
              </th>
              <th className="text-gray-dark border text-left px-3 w-36 text-sm py-4">
                Valor Filme
              </th>
              <th className="text-gray-dark border text-left px-3 text-sm py-4">
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-dark">
            {procedimentos?.length > 0 ? (
              procedimentos
                .sort((a, b) =>
                  a._id.descricaoProcedimento?.toLowerCase() >
                  b._id.descricaoProcedimento?.toLowerCase()
                    ? 1
                    : -1
                )
                .map((item, key) => {
                  return (
                    <tr key={item._id._id} className="text-center">
                      <td className="border text-left text-sm px-3">
                        {key + 1}
                      </td>
                      <td className="border text-left text-sm px-3">
                        {item?._id?.descricaoProcedimento || '-'}
                      </td>
                      <td className="border text-left text-sm px-3">
                        {formatMoney(item?.valorHonorario || '0')}
                      </td>
                      <td className="border text-left text-sm px-3">
                        {formatMoney(item?.valorFilme || '0')}
                      </td>
                      <td className="gap-2 flex border-b border-r text-left px-3 p-2 justify-start items-center">
                        <button
                          type="button"
                          className="bg-blue-500 hover:opacity-80 text-white shadow-md p-2 rounded-full"
                          onClick={() => {
                            const element =
                              document.getElementById('procedimentos')

                            element.scrollIntoView({
                              behavior: 'smooth',
                              block: 'end'
                            })

                            procedimentoSelectRef?.setValue([
                              {
                                label: item?._id?.descricaoProcedimento,
                                value: item?._id._id
                              }
                            ])

                            setFieldsValue(item)
                            setProcedimentoId(item?._id?._id)
                          }}
                        >
                          <Icons.FaEdit size={13} />
                        </button>
                        <button
                          type="button"
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
                              handleUpdate(
                                procedimentos.filter(
                                  procedimento => procedimento._id !== item._id
                                )
                              )
                            })
                          }
                        >
                          <Icons.FaTrash size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })
            ) : (
              <tr>
                <td
                  className="text-center text-sm p-3 bg-gray-100 bg-opacity-40 border text-gray-400 italic"
                  colSpan={6}
                >
                  Não há procedimentos lançados
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
    const { data } = id ? await api.get(`/convenios/${id}`) : { data: {} }
    const { data: procedimentosList } = (await api.get('/procedimentos')) || {
      data: []
    }
    return {
      props: {
        convenioInitial: data,
        procedimentosList
      }
    }
  } catch (err) {
    console.log(err)
    return {
      props: {}
    }
  }
}
