import * as React from 'react'
import { Body, Button, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { BrandCard, button, darkModeCss, footer, h1, main, text } from './brand'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Seu link de acesso ao {siteName}</Preview>
    <Body style={main}>
      <BrandCard>
        <Heading style={h1}>Seu link de acesso</Heading>
        <Text style={text}>
          Clique no botão abaixo para entrar no {siteName}. Este link expira em breve.
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Entrar no sistema
        </Button>
        <Text style={footer}>
          Se você não solicitou este link, pode ignorar este e-mail com segurança.
        </Text>
      </BrandCard>
    </Body>
  </Html>
)

export default MagicLinkEmail
