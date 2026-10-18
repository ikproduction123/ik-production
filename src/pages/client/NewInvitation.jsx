import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../features/auth/AuthContext';
import { CheckCircle, ArrowLeft } from 'lucide-react';

export default function NewInvitation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [packages, setPackages] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [pkgRes, themeRes] = await Promise.all([
        supabase.from('packages').select('*').eq('is_active', true).order('price', { ascending: true }),
        supabase.from('themes').select('*').eq('is_active', true)
      ]);
      if (pkgRes.data) setPackages(pkgRes.data);
      if (themeRes.data) setThemes(themeRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredThemes = themes.filter(t => t.tier === selectedPackage?.tier);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    // Validasi slug (hanya huruf kecil, angka, dan strip)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      setError('URL Slug hanya boleh berisi huruf kecil, angka, dan tanda strip (-).');
      setCreating(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from('invitations')
      .insert([
        {
          user_id: user.id,
          theme_id: selectedTheme.id,
          slug: slug,
          title: title,
          status: 'draft'
        }
      ])
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') { // Unique violation
        setError('URL Slug sudah digunakan. Silakan pilih yang lain.');
      } else {
        setError(insertError.message);
      }
      setCreating(false);
    } else {
      // Pindah ke halaman editor undangan yang baru dibuat
      navigate(`/dashboard/invitations/${data.id}/edit`);
    }
  };

  if (loading) return <div>Memuat data paket dan tema...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Buat Undangan Baru</h1>

      {/* STEP 1: PILIH PAKET */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Langkah 1: Pilih Paket</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {packages.map(pkg => (
              <div key={pkg.id} onClick={() => { setSelectedPackage(pkg); setStep(2); }} style={{ backgroundColor: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{pkg.name}</h3>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)', marginBottom: '1rem' }}>Rp {pkg.price.toLocaleString('id-ID')}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><CheckCircle size={16} color="var(--success)"/> Galeri {pkg.features.max_photos} foto</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: PILIH TEMA */}
      {step === 2 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ArrowLeft size={20} /></button>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Langkah 2: Pilih Tema ({selectedPackage.name})</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {filteredThemes.map(theme => (
              <div key={theme.id} onClick={() => { setSelectedTheme(theme); setStep(3); }} style={{ backgroundColor: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ height: '120px', backgroundColor: 'var(--bg-secondary)', marginBottom: '1rem', borderRadius: 'var(--radius-sm)' }}></div>
                <h3 style={{ fontSize: '1.1rem' }}>{theme.name}</h3>
              </div>
            ))}
            {filteredThemes.length === 0 && <p>Belum ada tema untuk paket ini.</p>}
          </div>
        </div>
      )}

      {/* STEP 3: DETAIL UNDANGAN */}
      {step === 3 && (
        <div style={{ maxWidth: '500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ArrowLeft size={20} /></button>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Langkah 3: Detail URL</h2>
          </div>
          
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            {error && <div style={{ color: 'var(--danger)', padding: '0.8rem', backgroundColor: '#ffebee', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Judul Undangan</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: Pernikahan Romeo & Juliet" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>URL Slug</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <span style={{ backgroundColor: 'var(--bg-primary)', padding: '0.8rem', color: 'var(--text-primary)', borderRight: '1px solid var(--border)' }}>ik-pro.my.id/</span>
                <input type="text" required value={slug} onChange={e => setSlug(e.target.value.toLowerCase())} placeholder="romeo-juliet" style={{ flex: 1, padding: '0.8rem', border: 'none', outline: 'none' }} />
              </div>
              <small style={{ color: 'gray', marginTop: '0.3rem', display: 'block' }}>URL tidak dapat diubah nanti. Gunakan huruf kecil dan strip (-).</small>
            </div>

            <button type="submit" disabled={creating} style={{ padding: '1rem', backgroundColor: 'var(--primary)', color: 'var(--text-primary)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
              {creating ? 'Membuat Draf...' : 'Buat Undangan Sekarang'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
