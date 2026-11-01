import * as React from 'react'
import { Body, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { BrandCard, codeStyle, footer, h1, main, text } from './brand'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação</Preview>
    <Body style={main}>
      <BrandCard>
        <Heading style={h1}>Confirme sua identidade</Heading>
        <Text style={text}>Use o código abaixo para confirmar que é você:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          Este código expira em breve. Se você não fez essa solicitação, pode ignorar este e-mail.
        </Text>
      </BrandCard>
    </Body>
  </Html>
)

export default ReauthenticationEmail
