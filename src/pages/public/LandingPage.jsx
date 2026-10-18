import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
        
      if (!error && data) {
        setPackages(data);
      }
      setLoading(false);
    };

    fetchPackages();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center', background: 'linear-gradient(to bottom, var(--bg-primary), var(--surface))' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--warning)', marginBottom: '1rem' }}>Undangan Digital Elegan Dalam Sekejap</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Buat dan bagikan momen bahagiamu dengan desain premium yang responsif, mudah digunakan, dan berkesan.
        </p>
        <Link to="/register" style={{ padding: '1rem 2rem', background: 'var(--success)', color: '#fff', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 'bold' }}>
          Buat Undangan Sekarang
        </Link>
      </section>

      {/* Pricing Section */}
      <section id="harga" style={{ padding: '4rem 2rem', backgroundColor: 'var(--surface)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--text-primary)', fontSize: '2rem' }}>Pilihan Paket</h2>
        
        {loading ? (
          <p style={{ textAlign: 'center' }}>Memuat paket...</p>
        ) : (
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', maxWidth: 'var(--container-width)', margin: '0 auto' }}>
            {packages.map((pkg) => (
              <div key={pkg.id} style={{ 
                flex: '1 1 300px', 
                padding: '2rem', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-lg)',
                backgroundColor: pkg.tier === 'Luxury' ? 'var(--bg-primary)' : 'var(--surface)',
                boxShadow: pkg.tier === 'Luxury' ? '0 10px 30px rgba(0,0,0,0.05)' : 'none',
                position: 'relative'
              }}>
                {pkg.tier === 'Luxury' && (
                  <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--warning)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    Paling Populer
                  </span>
                )}
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{pkg.name}</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)', marginBottom: '1.5rem' }}>
                  Rp {pkg.price.toLocaleString('id-ID')}
                </div>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} color="var(--success)"/> Galeri hingga {pkg.features.max_photos} foto</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} color="var(--success)"/> Masa aktif {pkg.active_days} hari</li>
                  {pkg.features.has_music && <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} color="var(--success)"/> Latar Musik</li>}
                  {pkg.features.has_video && <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} color="var(--success)"/> Integrasi Video</li>}
                </ul>

                <Link to="/register" style={{ display: 'block', textAlign: 'center', padding: '0.8rem', background: pkg.tier === 'Luxury' ? 'var(--primary)' : 'transparent', border: '2px solid var(--primary)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 'bold' }}>
                  Pilih Paket
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
