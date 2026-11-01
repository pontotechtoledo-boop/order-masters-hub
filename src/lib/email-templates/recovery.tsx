import * as React from 'react'
import { Body, Button, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { BrandCard, button, darkModeCss, footer, h1, main, text } from './brand'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Redefina sua senha do {siteName}</Preview>
    <Body style={main}>
      <BrandCard>
        <Heading style={h1}>Redefinir sua senha</Heading>
        <Text style={text}>
          Recebemos uma solicitação para redefinir a senha da sua conta no {siteName}. Clique no
          botão abaixo para escolher uma nova senha.
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Redefinir senha
        </Button>
        <Text style={footer}>
          Se você não pediu a redefinição, pode ignorar este e-mail. Sua senha não será alterada.
        </Text>
      </BrandCard>
    </Body>
  </Html>
)

export default RecoveryEmail
