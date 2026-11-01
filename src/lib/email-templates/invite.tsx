import * as React from 'react'
import { Body, Button, Head, Heading, Html, Link, Preview, Text } from '@react-email/components'
import { BrandCard, button, darkModeCss, footer, h1, link, main, text } from './brand'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteName, siteUrl, confirmationUrl }: InviteEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Você foi convidado para o {siteName}</Preview>
    <Body style={main}>
      <BrandCard>
        <Heading style={h1}>Você foi convidado</Heading>
        <Text style={text}>
          Você recebeu um convite para acessar o{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . Clique no botão abaixo para aceitar o convite e criar sua conta.
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Aceitar convite
        </Button>
        <Text style={footer}>
          Se você não estava esperando este convite, pode ignorar este e-mail com segurança.
        </Text>
      </BrandCard>
    </Body>
  </Html>
)

export default InviteEmail
