import { supabase } from '@/integrations/supabase/client';

export async function uploadOrderPhotos(organizationId: string, orderId: string, files: File[]) {
  if (files.length > 6 || files.some(file => !/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024 || file.size === 0)) throw new Error('Selecione até seis fotos JPG, PNG ou WebP de até 10 MB cada.');
  const urls: string[] = [];
  for (const file of files) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) throw new Error('Use fotos JPG, PNG ou WebP de até 10 MB.');
    const path = `${organizationId}/${orderId}/${crypto.randomUUID()}`;
    const { error } = await supabase.storage.from('order-photos').upload(path, file, { contentType: file.type });
    if (error) throw new Error(error.message);
    const saved = await supabase.from('order_photos').insert({ organization_id: organizationId, order_id: orderId, storage_path: path });
    if (saved.error) {
      await supabase.storage.from('order-photos').remove([path]);
      throw new Error(saved.error.message);
    }
    urls.push(URL.createObjectURL(file));
  }
  return urls;
}

export async function loadOrderPhotos(orderId: string) {
  const { data, error } = await supabase.from('order_photos').select('storage_path').eq('order_id', orderId).order('created_at');
  if (error) throw new Error(error.message);
  return Promise.all((data ?? []).map(async photo => {
    // Download through RLS each time instead of issuing shareable bearer links.
    const file = await supabase.storage.from('order-photos').download(photo.storage_path);
    if (file.error) throw new Error(file.error.message);
    return URL.createObjectURL(file.data);
  }));
}