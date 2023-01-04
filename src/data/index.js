import { formatMoney } from '../utils'
import { porExtenso, estilo } from 'numero-por-extenso'
import { format, getYear, isValid, parse, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt'

export const getRecibo = recibo => `
  <h1 style="text-align: center;">Valor: ${formatMoney(
    recibo.parcela?.valor || ''
  )}&nbsp;</h1>
  <p style="text-align: center;"><span style="font-size: 16px;">Recebi de ${
    recibo.paciente?.nome || ''
  }, CPF: ${recibo.paciente?.cpf || 'Não informado'} , a importância de
  ${formatMoney(recibo.parcela?.valor || '')} (${porExtenso(
  recibo.parcela?.valor || '',
  estilo.monetario
)}), Referente a consulta médica&nbsp;</span></p>
  <p style="text-align: center;"><span style="font-size: 16px;"><br>
  </span></p>
  <p style="text-align: center;"><span style="font-size: 16px;"><br>
  </span></p>
  <p style="text-align: center;"><span style="font-size: 16px;">&nbsp;Campinas, ${format(
    new Date(),
    "dd 'de' MMMM 'de' yyyy",
    {
      locale: pt
    }
  )}</span></p>
  <p style="text-align: center;"><span style="font-size: 16px;"><br>
  </span></p>
  <p style="text-align: center;"><span style="font-size: 16px;">___________________________________________&nbsp;</span></p>
  <p style="text-align: center;"><span style="font-size: 16px;">&nbsp;<b>${
    recibo.medico?.nome || ''
  }</b><br/></span><span style="font-size: 12px;">${
  recibo.medico?.especialidade || ''
}</span>    </p>
`

export const menuData = [
  {
    icon: 'FaCalendarAlt',
    title: 'Agendamento',
    route: '/agendamento',
    active: state => state === 'agendamento'
  },
  {
    icon: 'FaFileContract',
    title: 'Relatórios',
    route: '/relatorios',
    active: state => state === 'relatorios'
  },
  {
    icon: 'FaMoneyBillWaveAlt',
    title: 'Financeiro',
    multi: true,
    active: state =>
      [
        'formasDePagamentos',
        'faturamentos',
        'contasAReceber',
        'repasseMedico'
      ].includes(state),
    childrens: [
      {
        title: 'Formas de Pagamento',
        route: '/formasDePagamentos',
        active: state => state === 'formasDePagamentos'
      },
      {
        title: 'Contas a Receber',
        route: '/contasAReceber',
        active: state => state === 'contasAReceber'
      },
      {
        title: 'Repasse médico',
        route: '/repasseMedico',
        active: state => state === 'repasseMedico'
      },
      {
        title: 'Faturamentos',
        route: '/faturamentos',
        active: state => state === 'faturamentos'
      }
    ]
  },
  {
    icon: 'FaLock',
    iconOpen: 'FaUnlock',
    title: 'Acessos',
    multi: true,
    active: state => ['gruposDeUsuarios', 'usuarios'].includes(state),
    childrens: [
      {
        title: 'Usuários',
        route: '/usuarios',
        active: state => state === 'usuarios'
      },
      {
        title: 'Grupo de Usuários',
        route: '/gruposDeUsuarios',
        active: state => state === 'gruposDeUsuarios'
      }
    ]
  },
  {
    icon: 'FaFile',
    iconOpen: 'FaFile',
    title: 'Modelos',
    active: state => ['modelosReceita', 'modelosExames'].includes(state),
    childrens: [
      {
        title: 'Receitas',
        route: '/modelos/receitas',
        active: state => state === '/modelos/receitas'
      },
      {
        title: 'Atestados',
        route: '/modelos/atestados',
        active: state => state === '/modelos/atestados'
      },
      {
        title: 'Declarações',
        route: '/modelos/declaracao',
        active: state => state === '/modelos/declaracao'
      }
    ],
    multi: true
  },
  {
    icon: 'FaTablets',
    title: 'Medicamentos',
    route: '/medicamentos',
    active: state => state === 'medicamentos'
  },
  {
    icon: 'FaProjectDiagram',
    title: 'Convênios',
    route: '/convenios',
    active: state => state === 'convenios'
  },
  {
    icon: 'FaTasks',
    title: 'Procedimentos',
    route: '/procedimentos',
    active: state => state === 'procedimentos'
  },
  {
    icon: 'FaUserMd',
    title: 'Médicos',
    route: '/medicos',
    active: state => state === 'medicos'
  },
  {
    icon: 'FaUser',
    title: 'Pacientes',
    route: '/pacientes',
    active: state => state === 'pacientes'
  },
  {
    icon: 'FaDollarSign',
    title: 'Valores procedimentos',
    route: '/valoresProcedimentos',
    active: state => state === 'valoresProcedimentos'
  },
  {
    icon: 'FaCog',
    title: 'Configurações',
    route: '/configuracoes',
    active: state => state === 'configuracoes'
  }
]

export const menuData2 = [
  {
    icon: 'FaCalendarAlt',
    title: 'Agendamento',
    route: '/agendamento',
    active: state => state === 'agendamento'
  },
  {
    icon: 'FaFileContract',
    title: 'Relatórios',
    route: '/relatorios',
    active: state => state === 'relatorios'
  },
  {
    icon: 'FaMoneyBillWaveAlt',
    title: 'Financeiro',
    multi: true,
    active: state =>
      [
        'formasDePagamentos',
        'faturamentos',
        'contasAReceber',
        'repasseMedico'
      ].includes(state),
    childrens: [
      {
        title: 'Formas de Pagamento',
        route: '/formasDePagamentos',
        active: state => state === 'formasDePagamentos'
      },
      {
        title: 'Contas a Receber',
        route: '/contasAReceber',
        active: state => state === 'contasAReceber'
      },
      {
        title: 'Repasse médico',
        route: '/repasseMedico',
        active: state => state === 'repasseMedico'
      },
      {
        title: 'Faturamentos',
        route: '/faturamentos',
        active: state => state === 'faturamentos'
      }
    ]
  },
  {
    icon: 'FaLock',
    iconOpen: 'FaUnlock',
    title: 'Acessos',
    multi: true,
    active: state => ['gruposDeUsuarios', 'usuarios'].includes(state),
    childrens: [
      {
        title: 'Usuários',
        route: '/usuarios',
        active: state => state === 'usuarios'
      },
      {
        title: 'Grupo de Usuários',
        route: '/gruposDeUsuarios',
        active: state => state === 'gruposDeUsuarios'
      }
    ]
  },
  {
    icon: 'FaFile',
    iconOpen: 'FaFile',
    title: 'Modelos',
    active: state => ['modelosReceita', 'modelosExames'].includes(state),
    childrens: [
      {
        title: 'Receitas',
        route: '/modelos/receitas',
        active: state => state === '/modelos/receitas'
      },
      {
        title: 'Atestados',
        route: '/modelos/atestados',
        active: state => state === '/modelos/atestados'
      },
      {
        title: 'Declarações',
        route: '/modelos/declaracao',
        active: state => state === '/modelos/declaracao'
      }
    ],
    multi: true
  },
  {
    icon: 'FaTablets',
    title: 'Medicamentos',
    route: '/medicamentos',
    active: state => state === 'medicamentos'
  },
  {
    icon: 'FaProjectDiagram',
    title: 'Convênios',
    route: '/convenios',
    active: state => state === 'convenios'
  },
  {
    icon: 'FaTasks',
    title: 'Procedimentos',
    route: '/procedimentos',
    active: state => state === 'procedimentos'
  },
  {
    icon: 'FaUserMd',
    title: 'Médicos',
    route: '/medicos',
    active: state => state === 'medicos'
  },
  {
    icon: 'FaUser',
    title: 'Pacientes',
    route: '/pacientes',
    active: state => state === 'pacientes'
  },
  {
    icon: 'FaDollarSign',
    title: 'Valores procedimentos',
    route: '/valoresProcedimentos',
    active: state => state === 'valoresProcedimentos'
  },
  {
    icon: 'FaCog',
    title: 'Configurações',
    route: '/configuracoes',
    active: state => state === 'configuracoes'
  }
]

export const unidadesDeMedidasANS = [
  { value: '001', label: 'AMP Ampola' },
  { value: '002', label: 'BUI Bilhões de Unidades Internacionais' },
  { value: '003', label: 'BG Bisnaga' },
  { value: '004', label: 'BOLS Bolsa' },
  { value: '005', label: 'CX Caixa' },
  { value: '006', label: 'CAP Cápsula' },
  { value: '007', label: 'CARP Carpule' },
  { value: '008', label: 'COM Comprimido' },
  { value: '009', label: 'DOSE Dose' },
  { value: '010', label: 'DRG Drágea' },
  { value: '011', label: 'ENV Envelope' },
  { value: '012', label: 'FLAC Flaconete' },
  { value: '013', label: 'FR Frasco' },
  { value: '014', label: 'FA Frasco Ampola' },
  { value: '015', label: 'GAL Galão' },
  { value: '016', label: 'GLOB Glóbulo' },
  { value: '017', label: 'GTS Gotas' },
  { value: '018', label: 'G Grama' },
  { value: '019', label: 'L Litro' },
  { value: '020', label: 'MCG Microgramas' },
  { value: '021', label: 'MUI Milhões de Unidades Internacionais' },
  { value: '022', label: 'MG Miligrama' },
  { value: '023', label: 'ML Milílitro' },
  { value: '024', label: 'OVL Óvulo' },
  { value: '025', label: 'PAS Pastilha' },
  { value: '026', label: 'LT Lata' },
  { value: '027', label: 'PER Pérola' },
  { value: '028', label: 'PIL Pílula' },
  { value: '029', label: 'PT Pote' },
  { value: '030', label: 'KG Quilograma' },
  { value: '031', label: 'SER Seringa' },
  { value: '032', label: 'SUP Supositório' },
  { value: '033', label: 'TABLE Tablete' },
  { value: '034', label: 'TUB Tubete' },
  { value: '035', label: 'TB Tubo' },
  { value: '036', label: 'UN Unidade' },
  { value: '037', label: 'UI Unidade Internacional' },
  { value: '038', label: 'CM Centímetro' },
  { value: '039', label: 'CONJ Conjunto' },
  { value: '040', label: 'KIT Kit' },
  { value: '041', label: 'MÇ Maço' },
  { value: '042', label: 'M Metro' },
  { value: '043', label: 'PC Pacote' },
  { value: '044', label: 'PÇ Peça' },
  { value: '045', label: 'RL Rolo' },
  { value: '046', label: 'GY Gray' },
  { value: '047', label: 'CGY Centgray' },
  { value: '048', label: 'PAR Par' },
  { value: '049', label: 'ADES Adesivo Transdérmico' },
  { value: '050', label: 'COM EFEV Comprimido Efervecente' },
  { value: '051', label: 'COM MST Comprimido Mastigável' },
  { value: '052', label: 'SACHE Sache' }
]

export const codigoDaDespesaANS = [
  { value: '01', label: 'Gases medicinais' },
  { value: '02', label: 'Medicamentos' },
  { value: '03', label: 'Materiais' },
  { value: '05', label: 'Diárias' },
  { value: '07', label: 'Taxas e aluguéis' },
  { value: '08', label: 'OPME' }
]

export const tipoAtendimentoANS = [
  { value: '01', label: 'Remoção' },
  { value: '02', label: 'Pequena Cirurgia' },
  { value: '03', label: 'Outras Terapias' },
  { value: '04', label: 'Consulta' },
  { value: '05', label: 'Exame Ambulatorial' },
  { value: '06', label: 'Atendimento Domiciliar' },
  { value: '07', label: 'Internação' },
  { value: '08', label: 'Quimioterapia' },
  { value: '09', label: 'Radioterapia' },
  { value: '10', label: 'Terapia Renal Substitutiva (TRS' },
  { value: '11', label: 'Pronto Socorro' },
  {
    value: '13',
    label: 'Pequeno atendimento (sutura, gesso e outros'
  },
  { value: '14', label: 'Saúde Ocupacional - Admissional' },
  { value: '15', label: 'Saúde Ocupacional - Demissional' },
  { value: '16', label: 'Saúde Ocupacional - Periódico' },
  {
    value: '17',
    label: 'Saúde Ocupacional - Retorno ao trabalho'
  },
  { value: '18', label: 'Saúde Ocupacional - Mudança de função' },
  { value: '19', label: 'Saúde Ocupacional - Promoção a saúde' },
  { value: '20', label: 'Saúde Ocupacional - Beneficiário novo' },
  {
    value: '21',
    label: 'Saúde Ocupacional - Assistência a demitidos'
  }
]

export const indicacaoAcidenteANS = [
  { value: '0', label: 'Trabalho' },
  { value: '1', label: 'Trânsito' },
  { value: '2', label: 'Outros' },
  { value: '9', label: 'Não Acidente' }
]

export const tipoConsultaANS = [
  { value: '1', label: 'Primeira Consulta' },
  { value: '2', label: 'Retorno' },
  { value: '3', label: 'Pré-natal' },
  { value: '4', label: 'Por encaminhamento' }
]

export const motivoEncerramentoANS = [
  { value: '11', label: 'Alta Curado' },
  { value: '12', label: 'Alta Melhorado' },
  { value: '14', label: 'Alta a pedido' },
  {
    value: '15',
    label: 'Alta com previsão de retorno para acompanhamento do paciente'
  },
  { value: '16', label: 'Alta por Evasão' },
  { value: '18', label: 'Alta por outros motivos' },
  { value: '19', label: 'Alta de Paciente Agudo em Psiquiatria' },
  {
    value: '21',
    label: 'Permanência, por características próprias da doença'
  },
  { value: '22', label: 'Permanência, por intercorrência' },
  {
    value: '23',
    label: 'Permanência, por impossibilidade sócio-familiar'
  },
  {
    value: '24',
    label:
      'Permanência, por Processo de doação de órgãos, tecidos e células - doador vivo'
  },
  {
    value: '25',
    label:
      'Permanência, por Processo de doação de órgãos, tecidos e células - doador morto'
  },
  {
    value: '26',
    label: 'Permanência, por mudança de Procedimento'
  },
  { value: '27', label: 'Permanência, por reoperação' },
  { value: '28', label: 'Permanência, outros motivos' },
  {
    value: '31',
    label: 'Transferido para outro estabelecimento'
  },
  {
    value: '32',
    label: 'Transferência para Internação Domiciliar'
  },
  {
    value: '41',
    label: 'Óbito com declaração de óbito fornecida pelo médico assistente'
  },
  {
    value: '42',
    label:
      'Óbito com declaração de Óbito fornecida pelo Instituto Médico Legal - IML'
  },
  {
    value: '43',
    label:
      'Óbito com declaração de Óbito fornecida pelo Serviço de Verificação de Óbito - SVO.'
  },
  { value: '51', label: 'Encerramento Administrativo' },
  {
    value: '61',
    label: 'Alta da mãe/puérpera e do recém-nascido'
  },
  {
    value: '62',
    label: 'Alta da mãe/puérpera e permanência do recém-nascido'
  },
  {
    value: '63',
    label: 'Alta da mãe/puérpera e óbito do recém-nascido'
  },
  { value: '64', label: 'Alta da mãe/puérpera com óbito fetal' },
  { value: '65', label: 'Óbito da gestante e do concepto' },
  {
    value: '66',
    label: 'Óbito da mãe/puérpera e alta do recém-nascido'
  },
  {
    value: '67',
    label: 'Óbito da mãe/puérpera e permanência do recém-nascido'
  }
]

export const conselhoProfissionalANS = [
  { value: '01', label: 'Conselho Regional de Assistência Social (CRAS)' },
  { value: '02', label: 'Conselho Regional de Enfermagem (COREN)' },
  { value: '03', label: 'Conselho Regional de Farmácia (CRF)' },
  { value: '04', label: 'Conselho Regional de Fonoaudiologia (CRFA)' },
  {
    value: '05',
    label: 'Conselho Regional de Fisioterapia e Terapia Ocupacional (CREFITO)'
  },
  { value: '06', label: 'Conselho Regional de Medicina (CRM)' },
  { value: '07', label: 'Conselho Regional de Nutrição (CRN)' },
  { value: '08', label: 'Conselho Regional de Odontologia (CRO)' },
  { value: '09', label: 'Conselho Regional de Psicologia (CRP)' },
  { value: '10', label: 'Outros Conselhos' }
]

export const unidadeFederativaANS = [
  { value: '98', label: 'Países Estrangeiros - EX' },
  { value: '12', label: 'Acre - AC' },
  { value: '27', label: 'Alagoas - AL' },
  { value: '16', label: 'Amapá - AP' },
  { value: '13', label: 'Amazonas - AM' },
  { value: '29', label: 'Bahia - BA' },
  { value: '23', label: 'Ceará - CE' },
  { value: '53', label: 'Distrito Federal - DF' },
  { value: '32', label: 'Espírito Santo - ES' },
  { value: '52', label: 'Goiás - GO' },
  { value: '21', label: 'Maranhão - MA' },
  { value: '51', label: 'Mato Grosso - MT' },
  { value: '50', label: 'Mato Grosso do Sul - MS' },
  { value: '31', label: 'Minas Gerais - MG' },
  { value: '15', label: 'Pará - PA' },
  { value: '25', label: 'Paraíba - PB' },
  { value: '41', label: 'Paraná - PR' },
  { value: '26', label: 'Pernambuco - PE' },
  { value: '22', label: 'Piauí - PI' },
  { value: '33', label: 'Rio de Janeiro - RJ' },
  { value: '24', label: 'Rio Grande do Norte - RN' },
  { value: '43', label: 'Rio Grande do Sul - RS' },
  { value: '11', label: 'Rondônia - RO' },
  { value: '14', label: 'Roraima - RR' },
  { value: '42', label: 'Santa Catarina - SC' },
  { value: '35', label: 'São Paulo - SP' },
  { value: '28', label: 'Sergipe - SE' },
  { value: '17', label: 'Tocantins - TO' }
]
export const cbosANS = [
  { value: '201115', label: 'Geneticista' },
  {
    value: '203015',
    label: 'Pesquisador em Biologia de Micro-organismos e Parasitas'
  },
  { value: '213150', label: 'Físico Médico' },
  { value: '221105', label: 'Biólogo' },
  { value: '223204', label: 'Cirurgião Dentista - Auditor' },
  { value: '223208', label: 'Cirurgião Dentista - Clínico Geral' },
  { value: '223212', label: 'Cirurgião Dentista - Endodontista' },
  { value: '223216', label: 'Cirurgião Dentista - Epidemiologista' },
  { value: '223220', label: 'Cirurgião Dentista - Estomatologista' },
  { value: '223224', label: 'Cirurgião Dentista - Implantodontista' },
  { value: '223228', label: 'Cirurgião Dentista - Odontogeriatra' },
  { value: '223232', label: 'Cirurgião Dentista - Odontologista Legal' },
  { value: '223236', label: 'Cirurgião Dentista - Odontopediatra' },
  { value: '223240', label: 'Cirurgião Dentista - Ortopedista E Ortodontista' },
  { value: '223244', label: 'Cirurgião Dentista - Patologista Bucal' },
  { value: '223248', label: 'Cirurgião Dentista - Periodontista' },
  {
    value: '223252',
    label: 'Cirurgião Dentista - Protesiólogo Bucomaxilofacial'
  },
  { value: '223256', label: 'Cirurgião Dentista - Protesista' },
  { value: '223260', label: 'Cirurgião Dentista - Radiologista' },
  { value: '223264', label: 'Cirurgião Dentista - Reabilitador Oral' },
  {
    value: '223268',
    label: 'Cirurgião Dentista - Traumatologista Bucomaxilofacial'
  },
  { value: '223272', label: 'Cirurgião Dentista de Saúde Coletiva' },
  { value: '223276', label: 'Cirurgião Dentista – Odontologia do Trabalho' },
  { value: '223280', label: 'Cirurgião Dentista - Dentística' },
  {
    value: '223284',
    label: 'Cirurgião Dentista - Disfunção Temporomandibular e Dor Orofacial'
  },
  {
    value: '223288',
    label:
      'Cirurgião Dentista - Odontologia para Pacientes com Necessidades Especiais'
  },
  {
    value: '223293',
    label: 'Cirurgião-Dentista da Estratégia de Saúde da Família'
  },
  { value: '223505', label: 'Enfermeiro' },
  { value: '223605', label: 'Fisioterapeuta Geral' },
  { value: '223710', label: 'Nutricionista' },
  { value: '223810', label: 'Fonoaudiólogo' },
  { value: '223905', label: 'Terapeuta Ocupacional' },
  { value: '223910', label: 'Ortoptista' },
  { value: '225103', label: 'Médico Infectologista' },
  { value: '225105', label: 'Médico Acupunturista' },
  { value: '225106', label: 'Médico Legista' },
  { value: '225109', label: 'Médico Nefrologista' },
  { value: '225110', label: 'Médico Alergista e Imunologista' },
  { value: '225112', label: 'Médico Neurologista' },
  { value: '225115', label: 'Médico Angiologista' },
  { value: '225118', label: 'Médico Nutrologista' },
  { value: '225120', label: 'Médico Cardiologista' },
  { value: '225121', label: 'Médico Oncologista Clínico' },
  { value: '225122', label: 'Médico Cancerologista Pediátrico' },
  { value: '225124', label: 'Médico Pediatra' },
  { value: '225125', label: 'Médico Clínico' },
  { value: '225127', label: 'Médico Pneumologista' },
  { value: '225130', label: 'Médico de Família e Comunidade' },
  { value: '225133', label: 'Médico Psiquiatra' },
  { value: '225135', label: 'Médico Dermatologista' },
  { value: '225136', label: 'Médico Reumatologista' },
  { value: '225139', label: 'Médico Sanitarista' },
  { value: '225140', label: 'Médico do Trabalho' },
  { value: '225142', label: 'Médico da Estratégia de Saúde da Família' },
  { value: '225145', label: 'Médico em Medicina de Tráfego' },
  { value: '225148', label: 'Médico Anatomopatologista' },
  { value: '225150', label: 'Médico em Medicina Intensiva' },
  { value: '225151', label: 'Médico Anestesiologista' },
  { value: '225155', label: 'Médico Endocrinologista e Metabologista' },
  { value: '225160', label: 'Médico Fisiatra' },
  { value: '225165', label: 'Médico Gastroenterologista' },
  { value: '225170', label: 'Médico Generalista' },
  { value: '225175', label: 'Médico Geneticista' },
  { value: '225180', label: 'Médico Geriatra' },
  { value: '225185', label: 'Médico Hematologista' },
  { value: '225195', label: 'Médico Homeopata' },
  { value: '225203', label: 'Médico em Cirurgia Vascular' },
  { value: '225210', label: 'Médico Cirurgião Cardiovascular' },
  { value: '225215', label: 'Médico Cirurgião de Cabeça e Pescoço' },
  { value: '225220', label: 'Médico Cirurgião do Aparelho Digestivo' },
  { value: '225225', label: 'Médico Cirurgião Geral' },
  { value: '225230', label: 'Médico Cirurgião Pediátrico' },
  { value: '225235', label: 'Médico Cirurgião Plástico' },
  { value: '225240', label: 'Médico Cirurgião Torácico' },
  { value: '225250', label: 'Médico Ginecologista e Obstetra' },
  { value: '225255', label: 'Médico Mastologista' },
  { value: '225260', label: 'Médico Neurocirurgião' },
  { value: '225265', label: 'Médico Oftalmologista' },
  { value: '225270', label: 'Médico Ortopedista e Traumatologista' },
  { value: '225275', label: 'Médico Otorrinolaringologista' },
  { value: '225280', label: 'Médico Proctologista' },
  { value: '225285', label: 'Médico Urologista' },
  { value: '225290', label: 'Médico Cancerologista Cirúrgico' },
  { value: '225295', label: 'Médico Cirurgião da Mão' },
  { value: '225305', label: 'Médico Citopatologista' },
  { value: '225310', label: 'Médico em Endoscopia' },
  { value: '225315', label: 'Médico em Medicina Nuclear' },
  { value: '225320', label: 'Médico em Radiologia e Diagnóstico por Imagem' },
  { value: '225325', label: 'Médico Patologista' },
  { value: '225330', label: 'Médico Radioterapeuta' },
  {
    value: '225335',
    label: 'Médico Patologista Clínico / Medicina Laboratorial'
  },
  { value: '225340', label: 'Médico Hemoterapeuta' },
  { value: '225345', label: 'Médico Hiperbarista' },
  { value: '225350', label: 'Médico Neurofisiologista' },
  { value: '239425', label: 'Psicopedagogo' },
  { value: '251510', label: 'Psicólogo Clínico' },
  { value: '251545', label: 'Neuropsicólogo' },
  { value: '251550', label: 'Psicanalista' },
  { value: '251605', label: 'Assistente Social' },
  { value: '322205', label: 'Técnico de Enfermagem' },
  { value: '322220', label: 'Técnico de Enfermagem Psiquiátrica' },
  { value: '322225', label: 'Instrumentador Cirúrgico' },
  { value: '322230', label: 'Auxiliar de Enfermagem' },
  { value: '516210', label: 'Cuidador de Idosos' },
  {
    value: '999999',
    label: 'CBO Desconhecido ou não Informado pelo Solicitante '
  }
]

export const tipoLogradouro = [
  { value: 'A', label: 'Área' },
  { value: 'AC', label: 'Acesso' },
  { value: 'ACA', label: 'Acampamento' },
  { value: 'ACL', label: 'Acesso Local' },
  { value: 'AD', label: 'Adro' },
  { value: 'AE', label: 'Área Especial' },
  { value: 'AER', label: 'Aeroporto' },
  { value: 'AL', label: 'Alameda' },
  { value: 'AMD', label: 'Avenida Marginal Direita' },
  { value: 'AME', label: 'Avenida Marginal Esquerda' },
  { value: 'AN', label: 'Anel Viário' },
  { value: 'ANT', label: 'Antiga Estrada' },
  { value: 'ART', label: 'Artéria' },
  { value: 'AT', label: 'Alto' },
  { value: 'ATL', label: 'Atalho' },
  { value: 'A V', label: 'Área Verde' },
  { value: 'AV', label: 'Avenida' },
  { value: 'AVC', label: 'Avenida Contorno' },
  { value: 'AVM', label: 'Avenida Marginal' },
  { value: 'AVV', label: 'Avenida Velha' },
  { value: 'BAL', label: 'Balneário' },
  { value: 'BC', label: 'Beco' },
  { value: 'BCO', label: 'Buraco' },
  { value: 'BEL', label: 'Belvedere' },
  { value: 'BL', label: 'Bloco' },
  { value: 'BLO', label: 'Balão' },
  { value: 'BLS', label: 'Blocos' },
  { value: 'BLV', label: 'Bulevar' },
  { value: 'BSQ', label: 'Bosque' },
  { value: 'BVD', label: 'Boulevard' },
  { value: 'BX', label: 'Baixa' },
  { value: 'C', label: 'Cais' },
  { value: 'CAL', label: 'Calçada' },
  { value: 'CAM', label: 'Caminho' },
  { value: 'CAN', label: 'Canal' },
  { value: 'CH', label: 'Chácara' },
  { value: 'CHA', label: 'Chapadão' },
  { value: 'CIC', label: 'Ciclovia' },
  { value: 'CIR', label: 'Circular' },
  { value: 'CJ', label: 'Conjunto' },
  { value: 'CJM', label: 'Conjunto Mutirão' },
  { value: 'CMP', label: 'Complexo Viário' },
  { value: 'COL', label: 'Colônia' },
  { value: 'COM', label: 'Comunidade' },
  { value: 'CON', label: 'Condomínio' },
  { value: 'COR', label: 'Corredor' },
  { value: 'CPO', label: 'Campo' },
  { value: 'CRG', label: 'Córrego' },
  { value: 'CTN', label: 'Contorno' },
  { value: 'DSC', label: 'Descida' },
  { value: 'DSV', label: 'Desvio' },
  { value: 'DT', label: 'Distrito' },
  { value: 'EB', label: 'Entre Bloco' },
  { value: 'EIM', label: 'Estrada Intermunicipal' },
  { value: 'ENS', label: 'Enseada' },
  { value: 'ENT', label: 'Entrada Particular' },
  { value: 'EQ', label: 'Entre Quadra' },
  { value: 'ESC', label: 'Escada' },
  { value: 'ESD', label: 'Escadaria' },
  { value: 'ESE', label: 'Estrada Estadual' },
  { value: 'ESI', label: 'Estrada Vicinal' },
  { value: 'ESL', label: 'Estrada de Ligação' },
  { value: 'ESM', label: 'Estrada Municipal' },
  { value: 'ESP', label: 'Esplanada' },
  { value: 'ESS', label: 'Estrada de Servidão' },
  { value: 'EST', label: 'Estrada' },
  { value: 'ESV', label: 'Estrada Velha' },
  { value: 'ETA', label: 'Estrada Antiga' },
  { value: 'ETC', label: 'Estação' },
  { value: 'ETD', label: 'Estádio' },
  { value: 'ETN', label: 'Estância' },
  { value: 'ETP', label: 'Estrada Particular' },
  { value: 'ETT', label: 'Estacionamento' },
  { value: 'EVA', label: 'Evangélica' },
  { value: 'EVD', label: 'Elevada' },
  { value: 'EX', label: 'Eixo Industrial' },
  { value: 'FAV', label: 'Favela' },
  { value: 'FAZ', label: 'Fazenda' },
  { value: 'FER', label: 'Ferrovia' },
  { value: 'FNT', label: 'Fonte' },
  { value: 'FRA', label: 'Feira' },
  { value: 'FTE', label: 'Forte' },
  { value: 'GAL', label: 'Galeria' },
  { value: 'GJA', label: 'Granja' },
  { value: 'HAB', label: 'Núcleo Habitacional' },
  { value: 'IA', label: 'Ilha' },
  { value: 'IND', label: 'Indeterminado' },
  { value: 'IOA', label: 'Ilhota' },
  { value: 'JD', label: 'Jardim' },
  { value: 'JDE', label: 'Jardinete' },
  { value: 'LD', label: 'Ladeira' },
  { value: 'LGA', label: 'Lagoa' },
  { value: 'LGO', label: 'Lago' },
  { value: 'LOT', label: 'Loteamento' },
  { value: 'LRG', label: 'Largo' },
  { value: 'LT', label: 'Lote' },
  { value: 'MER', label: 'Mercado' },
  { value: 'MNA', label: 'Marina' },
  { value: 'MOD', label: 'Modulo' },
  { value: 'MRG', label: 'Projeção' },
  { value: 'MRO', label: 'Morro' },
  { value: 'MTE', label: 'Monte' },
  { value: 'NUC', label: 'Núcleo' },
  { value: 'NUR', label: 'Núcleo Rural' },
  { value: 'OUT', label: 'Outeiro' },
  { value: 'PAR', label: 'Paralela' },
  { value: 'PAS', label: 'Passeio' },
  { value: 'PAT', label: 'Pátio' },
  { value: 'PC', label: 'Praça' },
  { value: 'PCE', label: 'Praça de Esportes' },
  { value: 'PDA', label: 'Parada' },
  { value: 'PDO', label: 'Paradouro' },
  { value: 'PNT', label: 'Ponta' },
  { value: 'PR', label: 'Praia' },
  { value: 'PRL', label: 'Prolongamento' },
  { value: 'PRM', label: 'Parque Municipal' },
  { value: 'PRQ', label: 'Parque' },
  { value: 'PRR', label: 'Parque Residencial' },
  { value: 'PSA', label: 'Passarela' },
  { value: 'PSG', label: 'Passagem' },
  { value: 'PSP', label: 'Passagem de Pedestre' },
  { value: 'PSS', label: 'Passagem Subterrânea' },
  { value: 'PTE', label: 'Ponte' },
  { value: 'PTO', label: 'Porto' },
  { value: 'Q', label: 'Quadra' },
  { value: 'QTA', label: 'Quinta' },
  { value: 'QTS', label: 'Quintas' },
  { value: 'R', label: 'Rua' },
  { value: 'R I', label: 'Rua Integração' },
  { value: 'R L', label: 'Rua de Ligação' },
  { value: 'R P', label: 'Rua Particular' },
  { value: 'R V', label: 'Rua Velha' },
  { value: 'RAM', label: 'Ramal' },
  { value: 'RCR', label: 'Recreio' },
  { value: 'REC', label: 'Recanto' },
  { value: 'RER', label: 'Retiro' },
  { value: 'RES', label: 'Residencial' },
  { value: 'RET', label: 'Reta' },
  { value: 'RLA', label: 'Ruela' },
  { value: 'RMP', label: 'Rampa' },
  { value: 'ROA', label: 'Rodo Anel' },
  { value: 'ROD', label: 'Rodovia' },
  { value: 'ROT', label: 'Rotula' },
  { value: 'RPE', label: 'Rua de Pedestre' },
  { value: 'RPR', label: 'Margem' },
  { value: 'RTN', label: 'Retorno' },
  { value: 'RTT', label: 'Rotatória' },
  { value: 'SEG', label: 'Segunda Avenida' },
  { value: 'SIT', label: 'Sitio' },
  { value: 'SRV', label: 'Servidão' },
  { value: 'ST', label: 'Setor' },
  { value: 'SUB', label: 'Subida' },
  { value: 'TCH', label: 'Trincheira' },
  { value: 'TER', label: 'Terminal' },
  { value: 'TR', label: 'Trecho' },
  { value: 'TRV', label: 'Trevo' },
  { value: 'TUN', label: 'Túnel' },
  { value: 'TV', label: 'Travessa' },
  { value: 'TVP', label: 'Travessa Particular' },
  { value: 'TVV', label: 'Travessa Velha' },
  { value: 'UNI', label: 'Unidade' },
  { value: 'V', label: 'Via' },
  { value: 'V C', label: 'Via Coletora' },
  { value: 'V L', label: 'Via Local' },
  { value: 'VAC', label: 'Via de Acesso' },
  { value: 'VAL', label: 'Vala' },
  { value: 'VCO', label: 'Via Costeira' },
  { value: 'VD', label: 'Viaduto' },
  { value: 'V-E', label: 'Via Expressa' },
  { value: 'VER', label: 'Vereda' },
  { value: 'VEV', label: 'Via Elevado' },
  { value: 'VL', label: 'Vila' },
  { value: 'VLA', label: 'Viela' },
  { value: 'VLE', label: 'Vale' },
  { value: 'VLT', label: 'Via Litorânea' },
  { value: 'VPE', label: 'Via de Pedestre' },
  { value: 'VRT', label: 'Variante' },
  { value: 'ZIG', label: 'Zigue-Zague' }
]
export const UF = [
  { label: 'Acre', value: 'AC' },
  { label: 'Alagoas', value: 'AL' },
  { label: 'Amapá', value: 'AP' },
  { label: 'Amazonas', value: 'AM' },
  { label: 'Bahia', value: 'BA' },
  { label: 'Ceará', value: 'CE' },
  { label: 'Distrito Federal', value: 'DF' },
  { label: 'Espírito Santo', value: 'ES' },
  { label: 'Goiás', value: 'GO' },
  { label: 'Maranhão', value: 'MA' },
  { label: 'Mato Grosso', value: 'MT' },
  { label: 'Mato Grosso do Sul', value: 'MS' },
  { label: 'Minas Gerais', value: 'MG' },
  { label: 'Pará', value: 'PA' },
  { label: 'Paraíba', value: 'PB' },
  { label: 'Paraná', value: 'PR' },
  { label: 'Pernambuco', value: 'PE' },
  { label: 'Piauí', value: 'PI' },
  { label: 'Rio de Janeiro', value: 'RJ' },
  { label: 'Rio Grande do Norte', value: 'RN' },
  { label: 'Rio Grande do Sul', value: 'RS' },
  { label: 'Rondônia', value: 'RO' },
  { label: 'Roraima', value: 'RR' },
  { label: 'Santa Catarina', value: 'SC' },
  { label: 'São Paulo', value: 'SP' },
  { label: 'Sergipe', value: 'SE' },
  { label: 'Tocantins', value: 'TO' }
]

export const variaveisPacientes = [
  {
    name: '{{paciente.codigo}}',
    label: 'Codigo',
    value: paciente => paciente.codigo
  },
  {
    name: '{{paciente.nome}}',
    label: 'Nome',
    value: paciente => paciente.nome
  },
  {
    name: '{{paciente.idade}}',
    label: 'Idade',
    value: paciente =>
      isValid(parseISO(paciente.dataNascimento))
        ? getYear(new Date()) - getYear(parseISO(paciente.dataNascimento))
        : 0
  },
  {
    name: '{{paciente.dataNascimento}}',
    label: 'Data de nascimento',
    value: paciente =>
      isValid(parseISO(paciente.dataNascimento))
        ? format(parseISO(paciente.dataNascimento), 'dd/MM/yyyy')
        : ''
  },
  {
    name: '{{paciente.telefone}}',
    label: 'Telefone',
    value: paciente => paciente.telefone
  },
  {
    name: '{{paciente.whatsapp}}',
    label: 'Whatsapp',
    value: paciente => paciente.whatsapp
  },
  {
    name: '{{paciente.cpf}}',
    label: 'CPF',
    value: paciente => paciente.cpf
  },
  {
    name: '{{paciente.rg}}',
    label: 'RG',
    value: paciente => paciente.rg
  },
  {
    name: '{{paciente.endereco.rua}}',
    label: 'Endereço (Rua)',
    value: paciente => paciente.rua
  },
  {
    name: '{{paciente.endereco.numero}}',
    label: 'Endereço (Número)',
    value: paciente => paciente.numero
  },
  {
    name: '{{paciente.endereco.bairro}}',
    label: 'Endereço (Bairro)',
    value: paciente => paciente.bairro
  },
  {
    name: '{{paciente.endereco.complemento}}',
    label: 'Endereço (Complemento)',
    value: paciente => paciente.Complemento
  },
  {
    name: '{{paciente.endereco.cidade}}',
    label: 'Endereço (Cidade)',
    value: paciente => paciente.cidade
  },
  {
    name: '{{paciente.endereco.estado}}',
    label: 'Endereço (Estado)',
    value: paciente => paciente.uf
  },
  {
    name: '{{paciente.endereco.cep}}',
    label: 'Endereço (CEP)',
    value: paciente => paciente.cep
  }
]

export const variaveisAgendamentos = [
  {
    name: '{{agendamento.codigo}}',
    label: 'Código',
    value: agendamento => agendamento.codigo
  },
  {
    name: '{{agendamento.inicio}}',
    label: 'Inicio',
    value: agendamento =>
      isValid(parseISO(agendamento.inicio))
        ? format(parseISO(agendamento.inicio), 'dd/MM/yyyy HH:mm')
        : ''
  },
  {
    name: '{{agendamento.fim}}',
    label: 'Fim',
    value: agendamento =>
      isValid(parseISO(agendamento.fim))
        ? format(parseISO(agendamento.fim), 'dd/MM/yyyy HH:mm')
        : ''
  },
  {
    name: '{{agendamento.procedimento}}',
    label: 'Procedimento',
    value: agendamento => agendamento.procedimento.descricaoProcedimento
  },
  {
    name: '{{agendamento.valor}}',
    label: 'Valor',
    value: agendamento => agendamento.valor
  },
  {
    name: '{{agendamento.numeroCarteirinha}}',
    label: 'Número da Carteirinha',
    value: agendamento => agendamento.numeroCarteira
  },
  {
    name: '{{agendamento.responsavel}}',
    label: 'Responsável pelo agendamento',
    value: agendamento => agendamento.responsavel
  },
  {
    name: '{{agendamento.procedimento}}',
    label: 'Procedimento',
    value: agendamento => agendamento.procedimento.nome
  },
  {
    name: '{{agendamento.convenio}}',
    label: 'Convenio',
    value: agendamento => agendamento.convenio.nome
  }
]

export const variaveisMedicos = [
  {
    name: '{{medico.codigo}}',
    label: 'Código',
    value: medico => medico.codigo
  },
  {
    name: '{{medico.especialidade}}',
    label: 'Especialidade',
    value: medico => medico.especialidade
  },
  {
    name: '{{medico.nome}}',
    label: 'Nome',
    value: medico => `${medico.sigla} ${medico.nome}`
  },
  {
    name: '{{medico.conselhoProfissional}}',
    label: 'Conselho profissional',
    value: medico => conselhoProfissionalANS.find(c => c.value === medico.conselhoProfissional).label
  },
  {
    name: '{{medico.numeroConselhoProfissional}}',
    label: 'Número do Conselho profissional',
    value: medico => medico.numeroConselhoProfissional
  }
]

export const variaveisMedicamentos = [
  {
    name: '{{medicamentos.lista}}',
    label: 'Lista de medicamentos',
    value: medicamento => medicamento.descricao
  }
]
