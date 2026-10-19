import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Save, ArrowLeft, User, Calendar, Image as ImageIcon, Settings, Upload, Music, Plus, Trash2, MapPin, X, MessageSquare } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

export default function Editor() {
  const { user } = useAuth();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('kutipan'); // Pindah default ke kutipan untuk testing
  const [message, setMessage] = useState({ text: '', type: '' });
  const [uploading, setUploading] = useState({ groom: false, bride: false, cover: false, meta: false, music: false, gallery: false });
  const [isMobile, setIsMobile] = useState(false);

  const groomFileInput = useRef(null);
  const brideFileInput = useRef(null);
  const coverFileInput = useRef(null);
  const metaFileInput = useRef(null);
  const musicFileInput = useRef(null);
  const galleryFileInput = useRef(null);

  const [musicTracks, setMusicTracks] = useState([]);
  const [musicSource, setMusicSource] = useState('preset');
  const [presetQuotes, setPresetQuotes] = useState([]); // State untuk pilihan kutipan

  const [couple, setCouple] = useState({
    groom_name: '', groom_fullname: '', groom_father: '', groom_mother: '', groom_instagram: '', groom_photo: '',
    bride_name: '', bride_fullname: '', bride_father: '', bride_mother: '', bride_instagram: '', bride_photo: ''
  });

  const [invitation, setInvitation] = useState({
    title: '', cover_img: '', meta_title: '', meta_description: '', meta_img: '', music_url: '', slug: '', 
    quote_text: '', quote_author: '' // Tambahan state kutipan
  });

  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchEditorData = async () => {
      // Ambil Preset Data (Musik & Kutipan)
      const { data: tracksData } = await supabase.from('music_tracks').select('*').order('title');
      if (tracksData) setMusicTracks(tracksData);

      const { data: quotesData } = await supabase.from('quotes_preset').select('*').order('created_at', { ascending: true });
      if (quotesData) setPresetQuotes(quotesData);

      // Ambil Data Mempelai
      const { data: coupleData } = await supabase.from('couples').select('*').eq('invitation_id', id).single();
      if (coupleData) {
        setCouple({
          groom_name: coupleData.groom_name || '', groom_fullname: coupleData.groom_fullname || '', groom_father: coupleData.groom_father || '', groom_mother: coupleData.groom_mother || '', groom_instagram: coupleData.groom_instagram || '', groom_photo: coupleData.groom_photo || '',
          bride_name: coupleData.bride_name || '', bride_fullname: coupleData.bride_fullname || '', bride_father: coupleData.bride_father || '', bride_mother: coupleData.bride_mother || '', bride_instagram: coupleData.bride_instagram || '', bride_photo: coupleData.bride_photo || ''
        });
      }

      // Ambil Data Undangan
      const { data: invData } = await supabase.from('invitations').select('*').eq('id', id).single();
      if (invData) {
        setInvitation({
          title: invData.title || '', cover_img: invData.cover_img || '', meta_title: invData.meta_title || '', meta_description: invData.meta_description || '', meta_img: invData.meta_img || '', music_url: invData.music_url || '', slug: invData.slug || '',
          quote_text: invData.quote_text || '', quote_author: invData.quote_author || ''
        });
        if (invData.music_url) {
          const isPreset = tracksData?.some(t => t.url === invData.music_url);
          setMusicSource(isPreset ? 'preset' : 'upload');
        }
      }

      const { data: eventsData } = await supabase.from('events').select('*').eq('invitation_id', id).order('created_at', { ascending: true });
      if (eventsData) setEvents(eventsData);

      const { data: galleryData } = await supabase.from('galleries').select('*').eq('invitation_id', id).order('created_at', { ascending: true });
      if (galleryData) setGallery(galleryData);

      setLoading(false);
    };

    fetchEditorData();
  }, [id]);

  const handleCoupleChange = (e) => setCouple(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleInvitationChange = (e) => setInvitation(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // --- LOGIKA EVENT (Acara) ---
  const handleEventChange = (index, field, value) => { const updatedEvents = [...events]; updatedEvents[index][field] = value; setEvents(updatedEvents); };
  const addNewEvent = () => setEvents([...events, { invitation_id: id, user_id: user.id, event_type: 'akad', title: 'Akad Nikah', event_date: '', time_start: '', time_end: '', location_name: '', address: '', map_url: '' }]);
  const removeEvent = async (index) => {
    const eventToRemove = events[index];
    if (eventToRemove.id) { const { error } = await supabase.from('events').delete().eq('id', eventToRemove.id); if (error) { setMessage({ text: 'Gagal menghapus acara: ' + error.message, type: 'error' }); return; } }
    setEvents(events.filter((_, i) => i !== index));
  };
  const handleSaveAcara = async (e) => {
    e.preventDefault(); setSaving(true); setMessage({ text: '', type: '' });
    if (events.length === 0) { setMessage({ text: 'Tambahkan minimal satu acara.', type: 'error' }); setSaving(false); return; }
    const eventsToUpdate = []; const eventsToInsert = [];
    events.forEach(ev => {
      const { created_at, updated_at, ...cleanEvent } = ev; 
      if (!cleanEvent.event_date) cleanEvent.event_date = null;
      if (cleanEvent.id) eventsToUpdate.push(cleanEvent); else { delete cleanEvent.id; eventsToInsert.push(cleanEvent); }
    });
    let errorMsg = '';
    if (eventsToUpdate.length > 0) { const { error } = await supabase.from('events').upsert(eventsToUpdate); if (error) errorMsg = error.message; }
    if (!errorMsg && eventsToInsert.length > 0) { const { error } = await supabase.from('events').insert(eventsToInsert); if (error) errorMsg = error.message; }
    if (errorMsg) setMessage({ text: 'Gagal menyimpan data acara: ' + errorMsg, type: 'error' });
    else {
      setMessage({ text: 'Rangkaian acara berhasil disimpan!', type: 'success' });
      const { data } = await supabase.from('events').select('*').eq('invitation_id', id).order('created_at', { ascending: true });
      if (data) setEvents(data);
    }
    setSaving(false); setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // --- LOGIKA GALERI ---
  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setMessage({ text: 'Ukuran foto maksimal 2MB', type: 'error' }); return; }
    setUploading(prev => ({ ...prev, gallery: true })); setMessage({ text: 'Mengunggah foto ke galeri...', type: 'info' });
    const fileExt = file.name.split('.').pop(); const fileName = `${id}_${Date.now()}.${fileExt}`; const filePath = `galleries/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('invitation-assets').upload(filePath, file);
    if (uploadError) { setMessage({ text: 'Gagal mengunggah: ' + uploadError.message, type: 'error' }); setUploading(prev => ({ ...prev, gallery: false })); return; }
    const { data: { publicUrl } } = supabase.storage.from('invitation-assets').getPublicUrl(filePath);
    const { error: dbError } = await supabase.from('galleries').insert([{ invitation_id: id, user_id: user.id, image_url: publicUrl }]);
    if (dbError) { setMessage({ text: 'Gagal menyimpan ke database galeri: ' + dbError.message, type: 'error' }); } 
    else {
      setMessage({ text: 'Foto berhasil ditambahkan ke galeri!', type: 'success' });
      const { data: galleryData } = await supabase.from('galleries').select('*').eq('invitation_id', id).order('created_at', { ascending: true });
      if (galleryData) setGallery(galleryData);
    }
    setUploading(prev => ({ ...prev, gallery: false })); setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };
  const removeGalleryPhoto = async (photoId) => {
    setMessage({ text: 'Menghapus foto...', type: 'info' });
    const { error } = await supabase.from('galleries').delete().eq('id', photoId);
    if (error) { setMessage({ text: 'Gagal menghapus foto: ' + error.message, type: 'error' }); } 
    else { setGallery(gallery.filter(photo => photo.id !== photoId)); setMessage({ text: 'Foto berhasil dihapus.', type: 'success' }); }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // --- LOGIKA UPLOAD UMUM ---
  const handleFileUpload = async (e, type, tableRef, maxMb, folder) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > maxMb * 1024 * 1024) { setMessage({ text: `Ukuran file maksimal ${maxMb}MB`, type: 'error' }); return; }
    setUploading(prev => ({ ...prev, [type]: true })); setMessage({ text: 'Mengunggah file...', type: 'info' });
    const fileExt = file.name.split('.').pop(); const fileName = `${id}_${type}.${fileExt}`; const filePath = `${folder}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('invitation-assets').upload(filePath, file, { upsert: true });
    if (uploadError) { setMessage({ text: 'Gagal mengunggah: ' + uploadError.message, type: 'error' }); setUploading(prev => ({ ...prev, [type]: false })); return; }
    const { data: { publicUrl } } = supabase.storage.from('invitation-assets').getPublicUrl(filePath);
    const cacheBusterUrl = `${publicUrl}?t=${new Date().getTime()}`;
    if (tableRef === 'couples') { setCouple(prev => ({ ...prev, [`${type}_photo`]: cacheBusterUrl })); } 
    else { setInvitation(prev => ({ ...prev, [type === 'music' ? 'music_url' : `${type}_img`]: cacheBusterUrl })); }
    setMessage({ text: 'File berhasil diunggah! Klik Simpan untuk memperbarui.', type: 'success' });
    setUploading(prev => ({ ...prev, [type]: false }));
  };

  // --- PENYIMPANAN DATA UTAMA ---
  const handleSaveMempelai = async (e) => {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('couples').update(couple).eq('invitation_id', id);
    if (error) setMessage({ text: 'Gagal menyimpan: ' + error.message, type: 'error' });
    else setMessage({ text: 'Data mempelai berhasil disimpan!', type: 'success' });
    setSaving(false); setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSavePengaturan = async (e) => {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('invitations').update({ title: invitation.title, cover_img: invitation.cover_img, meta_title: invitation.meta_title, meta_description: invitation.meta_description, meta_img: invitation.meta_img, music_url: invitation.music_url }).eq('id', id);
    if (error) setMessage({ text: 'Gagal menyimpan pengaturan: ' + error.message, type: 'error' });
    else setMessage({ text: 'Pengaturan undangan berhasil disimpan!', type: 'success' });
    setSaving(false); setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSaveKutipan = async (e) => {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('invitations').update({ quote_text: invitation.quote_text, quote_author: invitation.quote_author }).eq('id', id);
    if (error) setMessage({ text: 'Gagal menyimpan kutipan: ' + error.message, type: 'error' });
    else setMessage({ text: 'Kata-kata / kutipan berhasil disimpan!', type: 'success' });
    setSaving(false); setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  if (loading) return <div>Memuat editor...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: isMobile ? '4rem' : '1rem' }}>
      
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/dashboard/invitations" style={{ color: 'var(--text-primary)' }}><ArrowLeft size={24} /></Link>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Editor Undangan</h1>
        </div>
        <Link to={`/${invitation.slug}`} target="_blank" style={{ padding: '0.6rem 1.2rem', border: '1px solid var(--primary)', backgroundColor: 'transparent', borderRadius: 'var(--radius-sm)', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 'bold', width: isMobile ? '100%' : 'auto', textAlign: 'center' }}>
          Preview Hasil
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', flexWrap: 'wrap' }}>
        {[
          { id: 'pengaturan', label: 'Pengaturan', icon: <Settings size={16} /> },
          { id: 'mempelai', label: 'Mempelai', icon: <User size={16} /> },
          { id: 'acara', label: 'Acara', icon: <Calendar size={16} /> },
          { id: 'kutipan', label: 'Kutipan', icon: <MessageSquare size={16} /> },
          { id: 'galeri', label: 'Galeri', icon: <ImageIcon size={16} /> }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1rem', background: 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '3px solid var(--warning)' : '3px solid transparent', color: activeTab === tab.id ? 'var(--warning)' : 'var(--text-primary)', fontWeight: activeTab === tab.id ? 'bold' : 'normal', cursor: 'pointer', marginBottom: '-2px', flex: isMobile ? '1 1 30%' : 'none', justifyContent: isMobile ? 'center' : 'flex-start', fontSize: isMobile ? '0.85rem' : '1rem' }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {message.text && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: message.type === 'success' || message.type === 'info' ? '#e0f2f1' : '#ffebee', color: message.type === 'success' || message.type === 'info' ? 'var(--success)' : 'var(--danger)' }}>{message.text}</div>
      )}

      {/* TAB PENGATURAN */}
      {activeTab === 'pengaturan' && (
         <form onSubmit={handleSavePengaturan}>
           <div style={{ backgroundColor: 'var(--surface)', padding: isMobile ? '1.5rem' : '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
           <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--warning)' }}>Informasi Dasar</h2>
           <div style={{ marginBottom: '1.5rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Judul Undangan (Header)</label><input type="text" name="title" value={invitation.title} onChange={handleInvitationChange} placeholder="Contoh: The Wedding of Romeo & Juliet" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
           
           <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)' }}>
             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1rem', fontWeight: 'bold' }}><Music size={20} color="var(--primary)" /> Musik Latar</label>
             <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '0.8rem' : '2rem', marginBottom: '1rem' }}>
               <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><input type="radio" checked={musicSource === 'preset'} onChange={() => { setMusicSource('preset'); setInvitation(prev => ({...prev, music_url: ''})); }} /> Pilih dari Galeri</label>
               <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><input type="radio" checked={musicSource === 'upload'} onChange={() => { setMusicSource('upload'); setInvitation(prev => ({...prev, music_url: ''})); }} /> Upload Sendiri</label>
             </div>
             {musicSource === 'preset' ? (
               <select name="music_url" value={invitation.music_url} onChange={handleInvitationChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: '#fff' }}>
                 <option value="">-- Pilih Lagu --</option>
                 {musicTracks.map(track => (<option key={track.id} value={track.url}>{track.title} - {track.artist}</option>))}
               </select>
             ) : (
               <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1rem', alignItems: isMobile ? 'stretch' : 'center' }}>
                 <input type="file" accept="audio/mpeg, audio/mp3, audio/wav" ref={musicFileInput} onChange={(e) => handleFileUpload(e, 'music', 'invitations', 5, 'music')} style={{ display: 'none' }} />
                 <button type="button" onClick={() => musicFileInput.current.click()} disabled={uploading.music} style={{ padding: '0.8rem 1.2rem', background: '#fff', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 'bold' }}>{uploading.music ? 'Mengunggah...' : 'Pilih File Audio (Max 5MB)'}</button>
                 {invitation.music_url && <span style={{ fontSize: '0.85rem', color: 'var(--success)', textAlign: isMobile ? 'center' : 'left' }}>✔ Audio terpilih</span>}
               </div>
             )}
             {invitation.music_url && (
               <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fff', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)' }}>
                 <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 'bold' }}>Preview Musik:</p>
                 <audio controls src={invitation.music_url} style={{ width: '100%', height: '40px', outline: 'none' }} />
               </div>
             )}
           </div>

           <div style={{ marginBottom: '1rem' }}>
             <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Cover Undangan Depan</label>
             <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: '1rem' }}>
               <div style={{ width: '120px', height: '160px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 {invitation.cover_img ? <img src={invitation.cover_img} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={32} color="gray" />}
               </div>
               <div>
                 <input type="file" accept="image/png, image/jpeg, image/webp" ref={coverFileInput} onChange={(e) => handleFileUpload(e, 'cover', 'invitations', 2, 'invitations')} style={{ display: 'none' }} />
                 <button type="button" onClick={() => coverFileInput.current.click()} disabled={uploading.cover} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>
                   {uploading.cover ? 'Mengunggah...' : 'Pilih Foto Cover'}
                 </button>
               </div>
             </div>
           </div>
         </div>

         <div style={{ backgroundColor: 'var(--surface)', padding: isMobile ? '1.5rem' : '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
           <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--warning)' }}>SEO & Metadata</h2>
           <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Meta Title</label><input type="text" name="meta_title" value={invitation.meta_title} onChange={handleInvitationChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
           <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Meta Description</label><textarea name="meta_description" value={invitation.meta_description} onChange={handleInvitationChange} rows="3" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}></textarea></div>
           <div style={{ marginBottom: '1rem' }}>
             <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Thumbnail Preview</label>
             <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: '1rem' }}>
               <div style={{ width: isMobile ? '100%' : '200px', height: isMobile ? 'auto' : '105px', aspectRatio: isMobile ? '1200/630' : 'auto', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 {invitation.meta_img ? <img src={invitation.meta_img} alt="Meta" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={24} color="gray" />}
               </div>
               <div style={{ width: isMobile ? '100%' : 'auto' }}>
                 <input type="file" accept="image/png, image/jpeg, image/webp" ref={metaFileInput} onChange={(e) => handleFileUpload(e, 'meta', 'invitations', 2, 'invitations')} style={{ display: 'none' }} />
                 <button type="button" onClick={() => metaFileInput.current.click()} disabled={uploading.meta} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', width: '100%' }}>{uploading.meta ? 'Mengunggah...' : 'Upload Image'}</button>
               </div>
             </div>
           </div>
         </div>
         <div style={{ marginTop: '2rem', textAlign: 'right', position: isMobile ? 'fixed' : 'static', bottom: isMobile ? '0' : 'auto', left: 0, right: 0, padding: isMobile ? '1rem' : '0', background: isMobile ? 'var(--surface)' : 'transparent', borderTop: isMobile ? '1px solid var(--border)' : 'none', zIndex: 10 }}>
           <button type="submit" disabled={saving || uploading.cover || uploading.meta || uploading.music} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 2rem', backgroundColor: 'var(--success)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>
             <Save size={20} /> Simpan Pengaturan
           </button>
         </div>
       </form>
      )}

      {/* TAB MEMPELAI */}
      {activeTab === 'mempelai' && (
        <form onSubmit={handleSaveMempelai}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'var(--surface)', padding: isMobile ? '1.5rem' : '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--warning)' }}>Mempelai Pria</h2>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', marginBottom: '1rem', overflow: 'hidden', border: '3px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'gray' }}>
                  {couple.groom_photo ? <img src={couple.groom_photo} alt="Pria" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} />}
                </div>
                <input type="file" accept="image/png, image/jpeg, image/webp" ref={groomFileInput} onChange={(e) => handleFileUpload(e, 'groom', 'couples', 2, 'couples')} style={{ display: 'none' }} />
                <button type="button" onClick={() => groomFileInput.current.click()} disabled={uploading.groom} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <Upload size={16} /> Pilih Foto
                </button>
              </div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Panggilan</label><input type="text" name="groom_name" value={couple.groom_name} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Lengkap</label><input type="text" name="groom_fullname" value={couple.groom_fullname} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Ayah</label><input type="text" name="groom_father" value={couple.groom_father} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Ibu</label><input type="text" name="groom_mother" value={couple.groom_mother} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Instagram</label><input type="text" name="groom_instagram" value={couple.groom_instagram} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: isMobile ? '1.5rem' : '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--warning)' }}>Mempelai Wanita</h2>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', marginBottom: '1rem', overflow: 'hidden', border: '3px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'gray' }}>
                  {couple.bride_photo ? <img src={couple.bride_photo} alt="Wanita" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} />}
                </div>
                <input type="file" accept="image/png, image/jpeg, image/webp" ref={brideFileInput} onChange={(e) => handleFileUpload(e, 'bride', 'couples', 2, 'couples')} style={{ display: 'none' }} />
                <button type="button" onClick={() => brideFileInput.current.click()} disabled={uploading.bride} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <Upload size={16} /> Pilih Foto
                </button>
              </div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Panggilan</label><input type="text" name="bride_name" value={couple.bride_name} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Lengkap</label><input type="text" name="bride_fullname" value={couple.bride_fullname} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Ayah</label><input type="text" name="bride_father" value={couple.bride_father} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Ibu</label><input type="text" name="bride_mother" value={couple.bride_mother} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Instagram</label><input type="text" name="bride_instagram" value={couple.bride_instagram} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
            </div>
          </div>
          <div style={{ marginTop: '2rem', textAlign: 'right', position: isMobile ? 'fixed' : 'static', bottom: isMobile ? '0' : 'auto', left: 0, right: 0, padding: isMobile ? '1rem' : '0', background: isMobile ? 'var(--surface)' : 'transparent', borderTop: isMobile ? '1px solid var(--border)' : 'none', zIndex: 10 }}>
            <button type="submit" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 2rem', backgroundColor: 'var(--success)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>
              <Save size={20} /> Simpan Data Mempelai
            </button>
          </div>
        </form>
      )}

      {/* TAB ACARA */}
      {activeTab === 'acara' && (
        <form onSubmit={handleSaveAcara}>
          {events.length === 0 ? (
            <div style={{ backgroundColor: 'var(--surface)', padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
              <Calendar size={48} color="gray" style={{ marginBottom: '1rem' }} />
              <p style={{ marginBottom: '1.5rem' }}>Belum ada acara yang ditambahkan.</p>
              <button type="button" onClick={addNewEvent} style={{ padding: '0.8rem 1.5rem', backgroundColor: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} /> Tambah Acara Pertama
              </button>
            </div>
          ) : (
            <>
              {events.map((ev, index) => (
                <div key={index} style={{ backgroundColor: 'var(--surface)', padding: isMobile ? '1.5rem' : '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--warning)', margin: 0 }}>Acara #{index + 1}</h2>
                    <button type="button" onClick={() => removeEvent(index)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Trash2 size={18} /> <span style={{ display: isMobile ? 'none' : 'inline' }}>Hapus</span>
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                    <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Judul Acara</label><input type="text" required value={ev.title || ''} onChange={(e) => handleEventChange(index, 'title', e.target.value)} placeholder="Contoh: Akad Nikah / Resepsi" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
                    <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tipe Acara</label><select value={ev.event_type || 'akad'} onChange={(e) => handleEventChange(index, 'event_type', e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: '#fff' }}><option value="akad">Akad Nikah / Pemberkatan</option><option value="resepsi">Resepsi</option><option value="lainnya">Lainnya (Unduh Mantu, dll)</option></select></div>
                    <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tanggal</label><input type="text" required value={ev.event_date || ''} onChange={(e) => handleEventChange(index, 'event_date', e.target.value)} placeholder="Contoh: Sabtu, 24 Oktober 2026" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
                    <div style={{ display: 'flex', gap: '1rem' }}><div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Waktu Mulai</label><input type="text" value={ev.time_start || ''} onChange={(e) => handleEventChange(index, 'time_start', e.target.value)} placeholder="08:00 WIB" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div><div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Selesai</label><input type="text" value={ev.time_end || ''} onChange={(e) => handleEventChange(index, 'time_end', e.target.value)} placeholder="Selesai" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div></div>
                    <div style={{ gridColumn: isMobile ? '1' : '1 / span 2' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Tempat / Gedung</label><input type="text" required value={ev.location_name || ''} onChange={(e) => handleEventChange(index, 'location_name', e.target.value)} placeholder="Contoh: Gedung Serbaguna Senayan" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
                    <div style={{ gridColumn: isMobile ? '1' : '1 / span 2' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Alamat Lengkap</label><textarea required value={ev.address || ''} onChange={(e) => handleEventChange(index, 'address', e.target.value)} rows="2" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}></textarea></div>
                    <div style={{ gridColumn: isMobile ? '1' : '1 / span 2' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Link Google Maps (URL)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: '#fff' }}>
                        <MapPin size={20} color="var(--primary)" style={{ marginLeft: '0.5rem' }} />
                        <input type="url" value={ev.map_url || ''} onChange={(e) => handleEventChange(index, 'map_url', e.target.value)} placeholder="https://maps.app.goo.gl/..." style={{ flex: 1, padding: '0.4rem', border: 'none', outline: 'none' }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addNewEvent} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', backgroundColor: 'transparent', border: '2px dashed var(--primary)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 'bold', width: '100%', justifyContent: 'center' }}>
                <Plus size={18} /> Tambah Acara Lain
              </button>
            </>
          )}
          <div style={{ marginTop: '2rem', textAlign: 'right', position: isMobile ? 'fixed' : 'static', bottom: isMobile ? '0' : 'auto', left: 0, right: 0, padding: isMobile ? '1rem' : '0', background: isMobile ? 'var(--surface)' : 'transparent', borderTop: isMobile ? '1px solid var(--border)' : 'none', zIndex: 10 }}>
            <button type="submit" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 2rem', backgroundColor: 'var(--success)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>
              <Save size={20} /> Simpan Data Acara
            </button>
          </div>
        </form>
      )}

      {/* TAB KUTIPAN (BARU) */}
      {activeTab === 'kutipan' && (
        <form onSubmit={handleSaveKutipan}>
          <div style={{ backgroundColor: 'var(--surface)', padding: isMobile ? '1.5rem' : '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} /> Kutipan / Kata Mutiara
            </h2>
            <p style={{ color: 'gray', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Pilih dari galeri kutipan kami atau tulis kata-kata mutiara Anda sendiri yang akan ditampilkan di halaman pembuka undangan.
            </p>
            
            {/* Galeri Pilihan Kutipan */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Pilih dari Koleksi Kami (Opsional):</label>
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                {presetQuotes.map((quote) => (
                  <div 
                    key={quote.id} 
                    onClick={() => setInvitation({ ...invitation, quote_text: quote.text, quote_author: quote.author })}
                    style={{ minWidth: '250px', backgroundColor: 'var(--bg-primary)', padding: '1.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'border 0.2s', ...(invitation.quote_text === quote.text ? { borderColor: 'var(--primary)', boxShadow: '0 0 0 1px var(--primary)' } : {}) }}
                  >
                    <p style={{ fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '0.5rem', lineHeight: '1.4' }}>"{quote.text.substring(0, 70)}..."</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>- {quote.author}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Isi Kutipan / Teks Doa</label>
              <textarea name="quote_text" value={invitation.quote_text} onChange={handleInvitationChange} rows="5" placeholder="Ketik kata-kata indah Anda di sini..." style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontStyle: 'italic', lineHeight: '1.5' }}></textarea>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Sumber / Nama Tokoh</label>
              <input type="text" name="quote_author" value={invitation.quote_author} onChange={handleInvitationChange} placeholder="Contoh: Q.S. Ar-Rum: 21" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'right', position: isMobile ? 'fixed' : 'static', bottom: isMobile ? '0' : 'auto', left: 0, right: 0, padding: isMobile ? '1rem' : '0', background: isMobile ? 'var(--surface)' : 'transparent', borderTop: isMobile ? '1px solid var(--border)' : 'none', zIndex: 10 }}>
            <button type="submit" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 2rem', backgroundColor: 'var(--success)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>
              <Save size={20} /> Simpan Kutipan
            </button>
          </div>
        </form>
      )}

      {/* TAB GALERI */}
      {activeTab === 'galeri' && (
        <div>
          <div style={{ backgroundColor: 'var(--surface)', padding: isMobile ? '1.5rem' : '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--warning)', margin: 0 }}>Galeri Foto ({gallery.length})</h2>
              
              <div>
                <input type="file" accept="image/png, image/jpeg, image/webp" ref={galleryFileInput} onChange={handleGalleryUpload} style={{ display: 'none' }} />
                <button type="button" onClick={() => galleryFileInput.current.click()} disabled={uploading.gallery} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', backgroundColor: 'var(--primary)', color: 'var(--text-primary)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
                  {uploading.gallery ? 'Mengunggah...' : <><Plus size={18} /> Tambah Foto</>}
                </button>
              </div>
            </div>

            {gallery.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)' }}>
                <ImageIcon size={48} color="gray" style={{ marginBottom: '1rem' }} />
                <p>Belum ada foto. Klik "Tambah Foto" untuk mulai mengunggah galeri pre-wedding.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {gallery.map((photo) => (
                  <div key={photo.id} style={{ position: 'relative', paddingTop: '100%', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={photo.image_url} alt="Gallery" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removeGalleryPhoto(photo.id)} style={{ position: 'absolute', top: '5px', right: '5px', padding: '0.4rem', backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
