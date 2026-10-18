import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Save, ArrowLeft, User, Calendar, Image as ImageIcon, Settings, Upload, Music } from 'lucide-react';

export default function Editor() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('pengaturan');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [uploading, setUploading] = useState({ groom: false, bride: false, cover: false, meta: false });

  const groomFileInput = useRef(null);
  const brideFileInput = useRef(null);
  const coverFileInput = useRef(null);
  const metaFileInput = useRef(null);

  // State Mempelai
  const [couple, setCouple] = useState({
    groom_name: '', groom_fullname: '', groom_father: '', groom_mother: '', groom_instagram: '', groom_photo: '',
    bride_name: '', bride_fullname: '', bride_father: '', bride_mother: '', bride_instagram: '', bride_photo: ''
  });

  // State Undangan (Pengaturan Umum & SEO)
  const [invitation, setInvitation] = useState({
    title: '', cover_img: '', meta_title: '', meta_description: '', meta_img: '', music_url: '', slug: ''
  });

  useEffect(() => {
    const fetchEditorData = async () => {
      // Ambil data mempelai
      const { data: coupleData } = await supabase.from('couples').select('*').eq('invitation_id', id).single();
      if (coupleData) {
        setCouple({
          groom_name: coupleData.groom_name || '', groom_fullname: coupleData.groom_fullname || '', groom_father: coupleData.groom_father || '', groom_mother: coupleData.groom_mother || '', groom_instagram: coupleData.groom_instagram || '', groom_photo: coupleData.groom_photo || '',
          bride_name: coupleData.bride_name || '', bride_fullname: coupleData.bride_fullname || '', bride_father: coupleData.bride_father || '', bride_mother: coupleData.bride_mother || '', bride_instagram: coupleData.bride_instagram || '', bride_photo: coupleData.bride_photo || ''
        });
      }

      // Ambil data undangan
      const { data: invData } = await supabase.from('invitations').select('*').eq('id', id).single();
      if (invData) {
        setInvitation({
          title: invData.title || '', cover_img: invData.cover_img || '', meta_title: invData.meta_title || '', meta_description: invData.meta_description || '', meta_img: invData.meta_img || '', music_url: invData.music_url || '', slug: invData.slug || ''
        });
      }
      setLoading(false);
    };

    fetchEditorData();
  }, [id]);

  const handleCoupleChange = (e) => setCouple(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleInvitationChange = (e) => setInvitation(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePhotoUpload = async (e, type, tableRef) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: 'Ukuran foto maksimal 2MB', type: 'error' });
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));
    setMessage({ text: 'Mengunggah foto...', type: 'info' });

    const fileExt = file.name.split('.').pop();
    const fileName = `${id}_${type}.${fileExt}`; 
    const filePath = `${tableRef}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('invitation-assets').upload(filePath, file, { upsert: true });

    if (uploadError) {
      setMessage({ text: 'Gagal mengunggah: ' + uploadError.message, type: 'error' });
      setUploading(prev => ({ ...prev, [type]: false }));
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('invitation-assets').getPublicUrl(filePath);
    const cacheBusterUrl = `${publicUrl}?t=${new Date().getTime()}`;

    if (tableRef === 'couples') {
      setCouple(prev => ({ ...prev, [`${type}_photo`]: cacheBusterUrl }));
    } else {
      setInvitation(prev => ({ ...prev, [`${type}_img`]: cacheBusterUrl }));
    }
    
    setMessage({ text: 'Foto berhasil diunggah! Klik Simpan untuk memperbarui.', type: 'success' });
    setUploading(prev => ({ ...prev, [type]: false }));
  };

  const handleSaveMempelai = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('couples').update(couple).eq('invitation_id', id);
    if (error) setMessage({ text: 'Gagal menyimpan: ' + error.message, type: 'error' });
    else setMessage({ text: 'Data mempelai berhasil disimpan!', type: 'success' });
    setSaving(false);
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSavePengaturan = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('invitations').update({
      title: invitation.title,
      cover_img: invitation.cover_img,
      meta_title: invitation.meta_title,
      meta_description: invitation.meta_description,
      meta_img: invitation.meta_img,
      music_url: invitation.music_url
    }).eq('id', id);
    
    if (error) setMessage({ text: 'Gagal menyimpan pengaturan: ' + error.message, type: 'error' });
    else setMessage({ text: 'Pengaturan undangan berhasil disimpan!', type: 'success' });
    setSaving(false);
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  if (loading) return <div>Memuat editor...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/dashboard/invitations" style={{ color: 'var(--text-primary)' }}><ArrowLeft size={24} /></Link>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Editor Undangan</h1>
        </div>
        <Link to={`/${invitation.slug}`} target="_blank" style={{ padding: '0.6rem 1.2rem', border: '1px solid var(--primary)', backgroundColor: 'transparent', borderRadius: 'var(--radius-sm)', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 'bold' }}>
          Preview Hasil
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--border)' }}>
        {[
          { id: 'pengaturan', label: 'Pengaturan Umum', icon: <Settings size={18} /> },
          { id: 'mempelai', label: 'Mempelai', icon: <User size={18} /> },
          { id: 'acara', label: 'Acara', icon: <Calendar size={18} /> },
          { id: 'galeri', label: 'Galeri', icon: <ImageIcon size={18} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', background: 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '3px solid var(--warning)' : '3px solid transparent', color: activeTab === tab.id ? 'var(--warning)' : 'var(--text-primary)', fontWeight: activeTab === tab.id ? 'bold' : 'normal', cursor: 'pointer', marginBottom: '-2px' }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {message.text && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: message.type === 'success' || message.type === 'info' ? '#e0f2f1' : '#ffebee', color: message.type === 'success' || message.type === 'info' ? 'var(--success)' : 'var(--danger)' }}>
          {message.text}
        </div>
      )}

      {/* TAB PENGATURAN UMUM & SEO */}
      {activeTab === 'pengaturan' && (
        <form onSubmit={handleSavePengaturan}>
          <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--warning)' }}>Informasi Dasar</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Judul Undangan (Header)</label>
              <input type="text" name="title" value={invitation.title} onChange={handleInvitationChange} placeholder="Contoh: The Wedding of Romeo & Juliet" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Link Musik Latar (URL)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Music size={20} color="var(--primary)" />
                <input type="url" name="music_url" value={invitation.music_url} onChange={handleInvitationChange} placeholder="https://contoh.com/musik.mp3" style={{ flex: 1, padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Cover Undangan Depan</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '150px', height: '200px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {invitation.cover_img ? <img src={invitation.cover_img} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={32} color="gray" />}
                </div>
                <div>
                  <input type="file" accept="image/png, image/jpeg, image/webp" ref={coverFileInput} onChange={(e) => handlePhotoUpload(e, 'cover', 'invitations')} style={{ display: 'none' }} />
                  <button type="button" onClick={() => coverFileInput.current.click()} disabled={uploading.cover} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                    {uploading.cover ? 'Mengunggah...' : 'Pilih Foto Cover'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--warning)' }}>SEO & Metadata (Link Preview)</h2>
            <p style={{ fontSize: '0.9rem', color: 'gray', marginBottom: '1.5rem' }}>Informasi ini akan muncul saat undangan dibagikan di WhatsApp, Facebook, dll.</p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Meta Title</label>
              <input type="text" name="meta_title" value={invitation.meta_title} onChange={handleInvitationChange} placeholder="Undangan Pernikahan Romeo & Juliet" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Meta Description</label>
              <textarea name="meta_description" value={invitation.meta_description} onChange={handleInvitationChange} placeholder="Kami mengundang Bapak/Ibu untuk hadir di acara pernikahan kami..." rows="3" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}></textarea>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Thumbnail Preview (Rekomendasi: 1200x630px)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '200px', height: '105px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {invitation.meta_img ? <img src={invitation.meta_img} alt="Meta Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={24} color="gray" />}
                </div>
                <div>
                  <input type="file" accept="image/png, image/jpeg, image/webp" ref={metaFileInput} onChange={(e) => handlePhotoUpload(e, 'meta', 'invitations')} style={{ display: 'none' }} />
                  <button type="button" onClick={() => metaFileInput.current.click()} disabled={uploading.meta} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                    {uploading.meta ? 'Mengunggah...' : 'Upload Meta Image'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <button type="submit" disabled={saving || uploading.cover || uploading.meta} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', backgroundColor: 'var(--success)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
              <Save size={20} /> {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      )}

      {/* TAB MEMPELAI */}
      {activeTab === 'mempelai' && (
        <form onSubmit={handleSaveMempelai}>
          {/* ... KONTEN FORM MEMPELAI TETAP SAMA SEPERTI SEBELUMNYA ... */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--warning)' }}>Mempelai Pria</h2>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', marginBottom: '1rem', overflow: 'hidden', border: '3px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'gray' }}>
                  {couple.groom_photo ? <img src={couple.groom_photo} alt="Pria" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} />}
                </div>
                <input type="file" accept="image/png, image/jpeg, image/webp" ref={groomFileInput} onChange={(e) => handlePhotoUpload(e, 'groom', 'couples')} style={{ display: 'none' }} />
                <button type="button" onClick={() => groomFileInput.current.click()} disabled={uploading.groom} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <Upload size={16} /> {uploading.groom ? 'Mengunggah...' : 'Pilih Foto'}
                </button>
              </div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Panggilan</label><input type="text" name="groom_name" value={couple.groom_name} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Lengkap</label><input type="text" name="groom_fullname" value={couple.groom_fullname} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Ayah</label><input type="text" name="groom_father" value={couple.groom_father} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Ibu</label><input type="text" name="groom_mother" value={couple.groom_mother} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Username Instagram (Opsional)</label><input type="text" name="groom_instagram" value={couple.groom_instagram} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--warning)' }}>Mempelai Wanita</h2>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', marginBottom: '1rem', overflow: 'hidden', border: '3px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'gray' }}>
                  {couple.bride_photo ? <img src={couple.bride_photo} alt="Wanita" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} />}
                </div>
                <input type="file" accept="image/png, image/jpeg, image/webp" ref={brideFileInput} onChange={(e) => handlePhotoUpload(e, 'bride', 'couples')} style={{ display: 'none' }} />
                <button type="button" onClick={() => brideFileInput.current.click()} disabled={uploading.bride} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <Upload size={16} /> {uploading.bride ? 'Mengunggah...' : 'Pilih Foto'}
                </button>
              </div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Panggilan</label><input type="text" name="bride_name" value={couple.bride_name} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Lengkap</label><input type="text" name="bride_fullname" value={couple.bride_fullname} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Ayah</label><input type="text" name="bride_father" value={couple.bride_father} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Ibu</label><input type="text" name="bride_mother" value={couple.bride_mother} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Username Instagram (Opsional)</label><input type="text" name="bride_instagram" value={couple.bride_instagram} onChange={handleCoupleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} /></div>
            </div>
          </div>
          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <button type="submit" disabled={saving || uploading.groom || uploading.bride} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', backgroundColor: 'var(--success)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
              <Save size={20} /> {saving ? 'Menyimpan...' : 'Simpan Data Mempelai'}
            </button>
          </div>
        </form>
      )}

      {/* TAB LAINNYA (WIP) */}
      {activeTab !== 'mempelai' && activeTab !== 'pengaturan' && (
        <div style={{ backgroundColor: 'var(--surface)', padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <p>Fitur untuk tab <strong>{activeTab}</strong> akan segera diimplementasikan pada tahap selanjutnya.</p>
        </div>
      )}
    </div>
  );
}
