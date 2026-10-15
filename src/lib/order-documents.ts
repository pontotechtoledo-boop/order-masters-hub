export type PrintFormat = 'a4' | '80mm' | '58mm';
export function paperSettings(format: PrintFormat) {
  return format === 'a4'
    ? { page: 'A4', margin: '16mm', width: 'auto' }
    : { page: `${format} 297mm`, margin: '3mm', width: format === '80mm' ? '74mm' : '52mm' };
}