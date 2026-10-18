export default function SoftBlossom({ data }) {
  // data berisi metadata undangan dari database nantinya
  return (
    <div style={{ backgroundColor: '#fff0f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', fontFamily: 'serif' }}>
      <div style={{ border: '2px solid #d81b60', padding: '3rem', borderRadius: '16px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
        <p style={{ color: '#880e4f', fontSize: '1.2rem', marginBottom: '1rem' }}>Pernikahan dari</p>
        <h1 style={{ color: '#d81b60', fontSize: '2.5rem', marginBottom: '1rem' }}>
          {data?.bride_name || 'Romeo'} & {data?.groom_name || 'Juliet'}
        </h1>
        <p style={{ color: '#880e4f', fontSize: '1.1rem' }}>
          {data?.event_date ? new Date(data.event_date).toLocaleDateString('id-ID') : 'Segera Hadir'}
        </p>
      </div>
    </div>
  );
}
