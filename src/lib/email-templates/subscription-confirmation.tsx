import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props { name?: string }

function SubscriptionConfirmation({ name }: Props) {
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>Pagamento confirmado. Acesse seu app de gestão Service Pro OS.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.brand}>Service Pro OS</Text>
          <Heading style={styles.heading}>Sua assinatura está atualizada</Heading>
          <Text style={styles.text}>{name ? `Olá, ${name}!` : 'Olá!'}</Text>
          <Text style={styles.text}>Seu pagamento foi confirmado e sua assinatura foi atualizada.</Text>
          <Text style={styles.text}>Obrigado por usar o Service Pro OS e confiar no nosso sistema para cuidar da sua assistência técnica.</Text>
          <Text style={styles.text}>Faça o login no seu app de gestão através do link abaixo:</Text>
          <Button href="https://serviceproos.app/auth" style={styles.button}>Acessar meu app de gestão</Button>
          <Text style={styles.text}>https://serviceproos.app/auth</Text>
          <Text style={styles.text}>Se esta é sua primeira compra, confira também o e-mail de acesso para definir sua senha.</Text>
          <Text style={styles.text}>Equipe Service Pro OS</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: SubscriptionConfirmation,
  subject: 'Pagamento confirmado — sua assinatura Service Pro OS está atualizada',
  displayName: 'Confirmação de compra e renovação',
  previewData: { name: 'Cristiano' },
} satisfies TemplateEntry

const styles = {
  body: { backgroundColor: '#ffffff', fontFamily: 'Manrope, Arial, sans-serif' },
  container: { maxWidth: '560px', padding: '32px 24px' },
  brand: { color: '#1479C9', fontSize: '18px', fontWeight: 700 },
  heading: { color: '#172338', fontFamily: 'Sora, Arial, sans-serif', fontSize: '24px' },
  text: { color: '#172338', fontSize: '15px', lineHeight: '24px' },
  button: { backgroundColor: '#1479C9', color: '#ffffff', padding: '14px 22px', borderRadius: '6px', fontWeight: 700 },
}