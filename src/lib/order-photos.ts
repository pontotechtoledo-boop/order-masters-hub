import { supabase } from '@/integrations/supabase/client';

export async function uploadOrderPhotos(organizationId: string, orderId: string, files: File[]) {
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
    const signed = await supabase.storage.from('order-photos').createSignedUrl(path, 3600);
    if (signed.error) throw new Error(signed.error.message);
    urls.push(signed.data.signedUrl);
  }
  return urls;
}

export async function loadOrderPhotos(orderId: string) {
  const { data, error } = await supabase.from('order_photos').select('storage_path').eq('order_id', orderId).order('created_at');
  if (error) throw new Error(error.message);
  return Promise.all((data ?? []).map(async photo => {
    const signed = await supabase.storage.from('order-photos').createSignedUrl(photo.storage_path, 3600);
    if (signed.error) throw new Error(signed.error.message);
    return signed.data.signedUrl;
  }));
}