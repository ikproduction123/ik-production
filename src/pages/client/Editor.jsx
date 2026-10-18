import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Save, ArrowLeft, User, Calendar, Image as ImageIcon, Settings } from 'lucide-react';

export default function Editor() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('mempelai');
  const [message, setMessage] = useState({ text: '', type: '' });

  // State untuk form mempelai
  const [couple, setCouple] = useState({
    groom_name: '', groom_fullname: '', groom_father: '', groom_mother: '', groom_instagram: '',
    bride_name: '', bride_fullname: '', bride_father: '', bride_mother: '', bride_instagram: ''
  });

  useEffect(() => {
    const fetchInvitationData = async () => {
      // Ambil data pasangan (couple) yang terhubung dengan undangan ini
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .eq('invitation_id', id)
        .single();

      if (!error && data) {
        setCouple({
          groom_name: data.groom_name || '',
          groom_fullname: data.groom_fullname || '',
          groom_father: data.groom_father || '',
          groom_mother: data.groom_mother || '',
          groom_instagram: data.groom_instagram || '',
          bride_name: data.bride_name || '',
          bride_fullname: data.bride_fullname || '',
          bride_father: data.bride_father || '',
          bride_mother: data.bride_mother || '',
          bride_instagram: data.bride_instagram || ''
        });
      }
      setLoading(false);
    };

    fetchInvitationData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCouple(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveMempelai = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    const { error } = await supabase
      .from('couples')
      .update(couple)
      .eq('invitation_id', id);

    if (error) {
      setMessage({ text: 'Gagal menyimpan data: ' + error.message, type: 'error' });
    } else {
      setMessage({ text: 'Data mempelai berhasil disimpan!', type: 'success' });
      // Hapus pesan sukses setelah 3 detik
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
    setSaving(false);
  };

  if (loading) return <div>Memuat editor...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header Editor */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/dashboard/invitations" style={{ color: 'var(--text-primary)' }}><ArrowLeft size={24} /></Link>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Editor Undangan</h1>
        </div>
        <Link to={`/dashboard/invitations/${id}/preview`} target="_blank" style={{ padding: '0.6rem 1.2rem', border: '1px solid var(--primary)', backgroundColor: 'transparent', borderRadius: 'var(--radius-sm)', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 'bold' }}>
          Preview Hasil
        </Link>
      </div>

      {/* Navigasi Tab */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--border)' }}>
        {[
          { id: 'mempelai', label: 'Mempelai', icon: <User size={18} /> },
          { id: 'acara', label: 'Acara', icon: <Calendar size={18} /> },
          { id: 'galeri', label: 'Galeri', icon: <ImageIcon size={18} /> },
          { id: 'pengaturan', label: 'Pengaturan', icon: <Settings size={18} /> }
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

      {/* Notifikasi */}
      {message.text && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: message.type === 'success' ? '#e0f2f1' : '#ffebee', color: message.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
          {message.text}
        </div>
      )}

      {/* Konten Tab Mempelai */}
      {activeTab === 'mempelai' && (
        <form onSubmit={handleSaveMempelai}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            
            {/* Form Pria */}
            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--warning)' }}>Mempelai Pria</h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Panggilan</label>
                <input type="text" name="groom_name" value={couple.groom_name} onChange={handleChange} placeholder="Contoh: Romeo" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Lengkap</label>
                <input type="text" name="groom_fullname" value={couple.groom_fullname} onChange={handleChange} placeholder="Contoh: Romeo Montague" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Ayah</label>
                <input type="text" name="groom_father" value={couple.groom_father} onChange={handleChange} placeholder="Bpk. Lord Montague" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Ibu</label>
                <input type="text" name="groom_mother" value={couple.groom_mother} onChange={handleChange} placeholder="Ibu Lady Montague" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Username Instagram (Opsional)</label>
                <input type="text" name="groom_instagram" value={couple.groom_instagram} onChange={handleChange} placeholder="@romeo" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
              </div>
            </div>

            {/* Form Wanita */}
            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--warning)' }}>Mempelai Wanita</h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Panggilan</label>
                <input type="text" name="bride_name" value={couple.bride_name} onChange={handleChange} placeholder="Contoh: Juliet" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Lengkap</label>
                <input type="text" name="bride_fullname" value={couple.bride_fullname} onChange={handleChange} placeholder="Contoh: Juliet Capulet" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Ayah</label>
                <input type="text" name="bride_father" value={couple.bride_father} onChange={handleChange} placeholder="Bpk. Lord Capulet" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Ibu</label>
                <input type="text" name="bride_mother" value={couple.bride_mother} onChange={handleChange} placeholder="Ibu Lady Capulet" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Username Instagram (Opsional)</label>
                <input type="text" name="bride_instagram" value={couple.bride_instagram} onChange={handleChange} placeholder="@juliet" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
              </div>
            </div>

          </div>
          
          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <button type="submit" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', backgroundColor: 'var(--success)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
              <Save size={20} /> {saving ? 'Menyimpan...' : 'Simpan Data Mempelai'}
            </button>
          </div>
        </form>
      )}

      {/* Tab Lainnya (WIP) */}
      {activeTab !== 'mempelai' && (
        <div style={{ backgroundColor: 'var(--surface)', padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <p>Fitur untuk tab <strong>{activeTab}</strong> akan segera diimplementasikan pada tahap selanjutnya.</p>
        </div>
      )}
    </div>
  );
}
