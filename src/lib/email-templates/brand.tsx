import * as React from 'react'
import { Container, Section, Text } from '@react-email/components'

// Service Pro OS — Azul técnico palette
export const brand = {
  primary: '#1479C9',
  dark: '#172338',
  light: '#F7F9FC',
  border: '#DCE7F3',
  text: '#3D4B63',
  muted: '#8A97AB',
}

export const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }

export const card = {
  backgroundColor: brand.light,
  border: `1px solid ${brand.border}`,
  borderRadius: '12px',
  padding: '28px 28px 20px',
  margin: '0 auto',
  maxWidth: '520px',
}

export const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: brand.dark,
  margin: '0 0 16px',
}

export const text = {
  fontSize: '14px',
  color: brand.text,
  lineHeight: '1.6',
  margin: '0 0 20px',
}

export const link = { color: brand.primary, textDecoration: 'underline' }

export const button = {
  backgroundColor: brand.primary,
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  borderRadius: '8px',
  padding: '12px 24px',
  textDecoration: 'none',
}

export const footer = { fontSize: '12px', color: brand.muted, margin: '24px 0 0', lineHeight: '1.5' }

export const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '26px',
  fontWeight: 'bold' as const,
  color: brand.dark,
  letterSpacing: '4px',
  textAlign: 'center' as const,
  backgroundColor: '#ffffff',
  border: `1px solid ${brand.border}`,
  borderRadius: '8px',
  padding: '14px 0',
  margin: '0 0 24px',
}

// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
export const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-btn { background-color: #ffffff !important; color: #172338 !important; }
  }
  [data-ogsc] .dm-btn { background-color: #ffffff !important; color: #172338 !important; }
  [data-ogsb] .dm-btn { background-color: #ffffff !important; color: #172338 !important; }
`

export const BrandHeader = () => (
  <Section style={{ backgroundColor: brand.dark, borderRadius: '12px 12px 0 0', padding: '18px 28px' }}>
    <Text style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold', margin: 0, letterSpacing: '0.5px' }}>
      🔧 Service Pro OS
    </Text>
  </Section>
)

export const BrandCard = ({ children }: { children: React.ReactNode }) => (
  <Container style={{ margin: '0 auto', maxWidth: '520px', padding: '24px 12px' }}>
    <BrandHeader />
    <Container
      style={{
        backgroundColor: brand.light,
        border: `1px solid ${brand.border}`,
        borderTop: 'none',
        borderRadius: '0 0 12px 12px',
        padding: '28px 28px 20px',
      }}
    >
      {children}
    </Container>
  </Container>
)
