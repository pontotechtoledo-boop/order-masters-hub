export function whatsappRecipient(phone?: string) {
  const digits = (phone ?? '').replace(/\D/g, '');
  const full = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
  if (!/^55\d{10,11}$/.test(full)) throw new Error('Cliente sem WhatsApp válido. Atualize o telefone no cadastro do cliente.');
  return full;
}

export function whatsappLink(phone: string | undefined, message: string) {
  return `https://wa.me/${whatsappRecipient(phone)}?text=${encodeURIComponent(message)}`;
}

export function issuedOrderStage(stage: string) {
  return stage === 'Aberta' ? 'Em processo' : stage;
}

export function orderNotice(client: string, device: string, company: string, number: string, stage: string) {
  return `Olá, ${client}! Seu aparelho ${device} já está em loja na ${company}. A OS ${number} está ${issuedOrderStage(stage).toUpperCase()}. Vamos atualizar o status do aparelho por este WhatsApp. Segue sua ordem de serviço em PDF.`;
}

export function warrantyNotice(client: string, device: string, company: string, order: string, warranty: string, expires: string) {
  return `Olá, ${client}! O atendimento do seu aparelho ${device}, OS ${order}, foi FINALIZADO na ${company}. Segue o termo de garantia ${warranty} em PDF, válido até ${expires}. Obrigado pela preferência!`;
}