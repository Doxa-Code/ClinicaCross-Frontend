export const apiURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3333'
    : 'https://clinicacross-backend.cloud.med.br'
