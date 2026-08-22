import { ServiceItem, ArticleItem, StepItem, TestimonialItem, DiagnosticOption } from '../types';

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'emergency-24h',
    number: '01',
    title: 'Bengkel Panggilan 24 Jam & SOS',
    shortDesc: 'Respon cepat <30 menit untuk mobil mogok di jalan, tol, kantor, atau rumah 24 jam non-stop.',
    fullDesc: 'Layanan tanggap darurat mobil mogok 24 jam di jalan raya, tol, area perumahan, maupun parkiran kantor. Tim mekanik siap meluncur dengan armada emergency lengkap dalam waktu kurang dari 30 menit membawa jumper aki, dongkrak, alat kelistrikan, hingga ban cadangan.',
    iconName: 'AlarmClock',
    startingPrice: 'Konsultasi & Respon Cepat',
    estimatedTime: '< 30 Menit Tiba',
    popular: true,
    features: [
      'Jumper aki darurat & cek dinamo starter/alternator',
      'Penanganan mesin overheat & kebocoran radiator darurat',
      'Penggantian ban bocor / pasang ban serep di lokasi',
      'Penanganan kelistrikan & sekering putus di jalan',
      'Kunci tertinggal di dalam mobil (Locksmith aman)',
      'Opsi towing / derek gendong jika perlu penanganan berat'
    ]
  },
  {
    id: 'service-mesin',
    number: '02',
    title: 'Home Service Tune Up & Mesin',
    shortDesc: 'Tune Up berkala di garasi rumah Anda: Gurah mesin, pembersihan injektor, throttle body & busi.',
    fullDesc: 'Perawatan dan pemulihan performa mesin mobil agar kembali bertenaga, tarikan responsif, hemat bahan bakar, dan halus tanpa getaran berlebih — dikerjakan langsung di garasi rumah Anda tanpa perlu mengantri di bengkel.',
    iconName: 'Wrench',
    startingPrice: 'Paket Komplit Bergaransi',
    estimatedTime: '1.5 - 2.5 Jam (Di Rumah)',
    popular: true,
    features: [
      'Tune Up Complete (Injektor, Throttle Body, Busi)',
      'Gurah Mesin (Carbon Cleaner ruang bakar mesin)',
      'Diesel Purging (Pembersihan fuel system Common Rail)',
      'Servis Radiator, Water Pump & Thermostat',
      'Ganti Timing Belt & Fan Belt di rumah',
      'Pengecekan kompresi mesin & kebocoran oli'
    ]
  },
  {
    id: 'ganti-oli',
    number: '03',
    title: 'Home Service Ganti Oli & Filter',
    shortDesc: 'Ganti oli mobil di rumah tanpa antri: Shell, Fastron, Castrol, Motul, Mobil 1, TMO, Honda Genuine.',
    fullDesc: 'Paket ganti oli mesin mobil di rumah dengan produk 100% original bergaransi resmi. Gratis cek filter oli, filter udara, minyak rem, cairan radiator, dan 20 titik pemeriksaan keselamatan menyeluruh.',
    iconName: 'Droplet',
    startingPrice: 'Oli Original + Free 20 Cek',
    estimatedTime: '30 - 45 Menit (Di Rumah)',
    popular: true,
    features: [
      'Pilihan Oli: Shell Helix, Fastron Gold, Castrol Magnatec, Motul, Mobil 1, TMO, Honda E-Pro',
      'Penggantian Filter Oli Original',
      'Kuras Oli Mesin dengan mesin suction/drain bersih bebas ceceran',
      'Pemeriksaan Free 20 Titik General Check-up di Lokasi',
      'Pembersihan Filter Udara & Filter Kabin',
      'Cek level cairan transmisi, power steering, & rem'
    ]
  },
  {
    id: 'scanning-ecu',
    number: '04',
    title: 'Diagnosa Kelistrikan & Sensor ECU Panggilan',
    shortDesc: 'Deteksi kelistrikan & sensor mobil langsung di lokasi Anda oleh teknisi ahli berpengalaman.',
    fullDesc: 'Diagnosa sistem elektrikal modern untuk mendeteksi kode error (DTC), membaca data sensor mobil, reset indikator check engine / ABS / Airbag, serta perbaikan kelistrikan dan modul ECU langsung di tempat mobil Anda berada.',
    iconName: 'Cpu',
    startingPrice: 'Diagnosa Scanner Akurat',
    estimatedTime: '30 - 60 Menit',
    features: [
      'Diagnosa Sistem Kelistrikan Multi-Brand di Tempat',
      'Analisa Real-Time Sensor (MAF, O2, TPS, Crankshaft, dll.)',
      'Reset Lampu Indikator Engine / ABS / Airbag / EPS',
      'Perbaikan jalur wiring & kabel kelistrikan bodi',
      'Diagnosa & servis modul ECU / BCM / TCM',
      'Laporan digital status kesehatan elektrikal mobil'
    ]
  },
  {
    id: 'rem-kaki-kaki',
    number: '05',
    title: 'Home Service Rem & Kaki-Kaki',
    shortDesc: 'Servis kampas rem, shockbreaker, tierod, rack end, dan laher roda dikerjakan di rumah.',
    fullDesc: 'Solusi mobil bunyi gluduk-gluduk, setir bergetar, atau rem kurang pakem. Kami tangani penggantian kampas rem, bearing roda, tie rod, link stabilizer, hingga suspensi langsung di garasi atau kantor Anda.',
    iconName: 'Car',
    startingPrice: 'Suku Cadang OEM & Bergaransi',
    estimatedTime: '1 - 2 Jam',
    features: [
      'Penggantian Kampas Rem Depan / Belakang (Brake Pad / Shoe)',
      'Kuras & Bleeding Minyak Rem (DOT 3 / DOT 4)',
      'Penggantian Tierod, Rack End, Ball Joint, Link Stabilizer',
      'Ganti Bearing / Laher Roda & Bushing Arm',
      'Penggantian / Rekondisi Shockbreaker & Per',
      'Pengecekan rack steer & hidrolik power steering'
    ]
  }
];

export const ORDER_STEPS: StepItem[] = [
  {
    number: '01',
    title: 'Langkah 1: Konsultasi & Share Lokasi',
    description: 'Hubungi Admin melalui WhatsApp atau form website. Sampaikan keluhan mobil & kirimkan alamat / share live location Anda.',
    details: 'Layanan aktif 24 jam non-stop untuk booking terjadwal di rumah maupun panggilan emergency di jalan tol / perumahan.'
  },
  {
    number: '02',
    title: 'Langkah 2: Estimasi Biaya & Penawaran Transparan',
    description: 'Admin memberikan estimasi biaya jasa dan sparepart secara jelas di awal tanpa ada biaya tersembunyi.',
    details: 'Setelah Anda setuju dengan estimasi harga, tim mekanik langsung disiapkan dan diberangkatkan ke lokasi Anda.'
  },
  {
    number: '03',
    title: 'Langkah 3: Mekanik Tiba di Lokasi Anda',
    description: 'Mekanik bersertifikat tiba membawa armada servis lengkap (tools standar OEM, alat ukur digital, dongkrak & suku cadang asli).',
    details: 'Mekanik melakukan General Check-Up 20 titik keselamatan dan langsung mengeksekusi perbaikan di depan Anda.'
  },
  {
    number: '04',
    title: 'Langkah 4: Pengerjaan di Rumah & Quality Test',
    description: 'Anda bisa bersantai di rumah sambil memantau pengerjaan. Mekanik melakukan uji jalan (test drive) bersama Anda.',
    details: 'Mobil dipastikan dalam kondisi prima, area kerja dibersihkan rapi, dan part bekas ditunjukkan kepada Anda.'
  },
  {
    number: '05',
    title: 'Langkah 5: Pembayaran Mudah & Garansi Resmi',
    description: 'Pembayaran praktis secara Cash, Transfer Bank, atau QRIS setelah servis tuntas. Dapatkan invoice resmi bergaransi.',
    details: 'Seluruh pengerjaan dan sparepart dilindungi garansi resmi FHRCAR Auto Services untuk ketenangan berkendara Anda.'
  }
];

export const ARTICLES_DATA: ArticleItem[] = [
  {
    id: 'servis-aki-mobil',
    title: 'Servis Aki Mobil & Penanganan Darurat saat Mati Mendadak',
    category: 'Emergency & Kelistrikan',
    date: '18 Agu 2026',
    readTime: '4 Menit Baca',
    snippet: 'Servis aki mobil merupakan salah satu hal yang penting untuk menjaga kinerja dan daya tahan aki mobil. Aki mobil yang baik dan terawat dapat mencegah mogok mendadak di jalan.',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    content: [
      'Aki merupakan jantung sistem kelistrikan mobil. Ketika aki soak, mobil tidak akan bisa di-starter meskipun semua komponen mesin dalam kondisi prima.',
      'Tanda-tanda aki mobil mulai lemah antara lain lampu indikator redup saat mesin distarter, bunyi starter hanya cetek-cetek, serta usia pakai aki yang sudah melebihi 1.5 - 2 tahun.',
      'Jika mobil Anda mogok mendadak karena aki drop, jangan panik. Langkah pertama adalah memastikan kelistrikan seperti AC dan lampu dimatikan, lalu gunakan layanan jumper darurat 24 jam FHRCAR Auto Services.'
    ],
    tips: [
      'Periksa level air aki (jika tipe basah) minimal sebulan sekali.',
      'Bersihkan kerak putih di kutub positif dan negatif aki dengan air hangat.',
      'Jangan biarkan aksesoris audio atau lampu menyala saat mesin mobil mati.'
    ]
  },
  {
    id: 'derek-mobil-mogok',
    title: 'Derek Mobil & Solusi Mogok di Jalan Tol 24 Jam',
    category: 'Emergency 24 Jam',
    date: '16 Agu 2026',
    readTime: '5 Menit Baca',
    snippet: 'Layanan derek mobil menjadi salah satu solusi yang penting ketika kendaraan Anda mengalami masalah berat di jalan. Ketahui langkah aman saat mobil mati mendadak di jalan raya.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
    content: [
      'Mengalami mobil mogok di jalan tol adalah situasi yang menegangkan. Keamanan penumpang adalah prioritas utama sebelum memikirkan perbaikan kendaraan.',
      'Langkah awal yang wajib dilakukan adalah segera nyalakan lampu hazard, arahkan mobil perlahan ke bahu jalan sebelah kiri, dan pasang segitiga pengaman minimal 30-50 meter di belakang mobil.',
      'Hubungi tim emergency FHRCAR. Mekanik kami dapat melakukan penanganan di lokasi (quick repair) seperti jumper, perbaikan sekering, selang radiator pecah, atau menyiapkan derek gendong (towing) jika perlu.'
    ],
    tips: [
      'Selalu simpan nomor darurat FHRCAR Auto Services di kontak ponsel Anda.',
      'Tetap berada di luar mobil di area yang aman (di balik pagar pembatas tol).',
      'Jangan sembarangan menerima bantuan dari pihak tidak dikenal tanpa identitas resmi.'
    ]
  },
  {
    id: 'jasa-tune-up-mobil',
    title: 'Jasa Tune Up Mobil & Gurah Mesin untuk Tarikan Enteng',
    category: 'Perawatan Mesin',
    date: '14 Agu 2026',
    readTime: '4 Menit Baca',
    snippet: 'Jasa tune up mobil adalah salah satu layanan yang ditawarkan oleh bengkel mobil yang bertujuan untuk meningkatkan performa dan efisiensi konsumsi bahan bakar kendaraan.',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
    content: [
      'Seiring pemakaian kendaraan, kerak karbon akan menumpuk pada ruang bakar, throttle body, dan injektor. Hal ini menyebabkan tarikan mesin ngempos dan bensin menjadi boros.',
      'Tune up berkala setiap 10.000 - 20.000 km membersihkan deposit kotoran dan mengkalibrasi ulang pengapian agar pembakaran kembali optimal.',
      'Dengan layanan Home Service FHRCAR, Anda tidak perlu repot mengantri berjam-jam di bengkel. Mekanik kami mengerjakan tune up lengkap langsung di garasi rumah Anda.'
    ],
    tips: [
      'Gunakan bahan bakar dengan nilai oktan yang sesuai rekomendasi pabrikan.',
      'Ganti filter udara dan busi secara berkala.',
      'Lakukan carbon clean / gurah mesin setahun sekali.'
    ]
  },
  {
    id: 'service-ac-mobil',
    title: 'Service AC Mobil: Penyebab AC Kurang Dingin & Bau Apek',
    category: 'AC & Kenyamanan',
    date: '12 Agu 2026',
    readTime: '4 Menit Baca',
    snippet: 'Sistem pendingin udara dalam mobil menjadi salah satu fitur penting yang sangat dibutuhkan, terutama pada saat musim panas atau kemacetan kota.',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    content: [
      'AC mobil yang hanya mengeluarkan hembusan angin tanpa rasa dingin biasanya disebabkan oleh tekanan freon yang berkurang karena kebocoran halus atau magnet clutch kompresor yang aus.',
      'Penyebab bau apek pada kabin umumnya karena evaporator yang berlendir akibat debu dan bakteri yang terperangkap pada filter kabin yang kotor.',
      'FHRCAR menyediakan layanan cuci evaporator tanpa harus membongkar dashboard dengan metode camera endoscope bertekanan tinggi.'
    ],
    tips: [
      'Jangan merokok atau membuka kaca jendela saat AC mobil sedang menyala.',
      'Ganti filter kabin setiap 10.000 km.',
      'Lakukan flushing oli kompresor AC setiap 20.000 km.'
    ]
  }
];

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: '1',
    name: 'Bpk. Hendra Gunawan',
    car: 'Toyota Fortuner VRZ',
    location: 'Purwokerto Timur',
    rating: 5,
    serviceUsed: 'Emergency Jumper Aki & Ganti Baru di Tempat',
    comment: 'Pagi-pagi mau berangkat kerja mobil mati total gak bisa distarter di garasi. Panggil FHRCAR, 20 menit mekanik datang langsung ke rumah bawa aki baru bergaransi. Sangat profesional, cepat, dan rapi!',
    date: '2 hari yang lalu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '2',
    name: 'Ibu Ratna Dewi',
    car: 'Honda CR-V Turbo',
    location: 'Sokaraja, Purwokerto',
    rating: 5,
    serviceUsed: 'Paket Home Service Tune Up + Ganti Oli',
    comment: 'Praktis banget buat ibu rumah tangga yang sibuk. Gak perlu repot antri di bengkel. Mekanik ramah datang ke rumah di Sokaraja, bawa alat lengkap, dan ada laporan 20 titik check-up gratis.',
    date: '5 hari yang lalu',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '3',
    name: 'Bpk. Aditya Pratama',
    car: 'Mitsubishi Xpander Ultimate',
    location: 'Jalur Wisata Baturraden',
    rating: 5,
    serviceUsed: 'Emergency Overheat & Radiator Selang Pecah',
    comment: 'Penyelamat keluarga saat wisata ke Baturraden! Mobil mendadak overheat di tanjakan. Tim emergency 24 Jam FHRCAR sigap meluncur bantu ganti selang dan radiator coolant. Pelayanan mantap.',
    date: '1 minggu yang lalu',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '4',
    name: 'Bpk. Richard S.',
    car: 'BMW 320i F30',
    location: 'Purwokerto Utara (UNSOED)',
    rating: 5,
    serviceUsed: 'Diagnosa ECU & Servis Rem Kaki-kaki',
    comment: 'Awalnya ragu panggil mekanik untuk mobil Eropa di Purwokerto, tapi teknisi FHRCAR sangat profesional dan paham wiring sensor. Penanganan presisi.',
    date: '2 minggu yang lalu',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
  }
];

export const DIAGNOSTIC_OPTIONS: DiagnosticOption[] = [
  {
    id: 'diag-1',
    symptom: 'Mobil Tidak Mau Distarter (Bunyi Cetek-Cetek / Lampu Redup)',
    category: 'Aki & Kelistrikan',
    possibleCauses: ['Aki drop / voltase di bawah 11.8V', 'Kutub aki kotor / berkerak', 'Dinamo starter / carbon brush aus', 'Relay starter bermasalah'],
    immediateAction: 'Matikan AC, audio, dan lampu. Jangan memaksakan starter berulang-ulang agar dinamo starter tidak terbakar. Panggil mekanik untuk jumper aki.',
    recommendedService: 'Emergency Jumper Aki 24 Jam / Ganti Aki di Tempat',
    urgency: 'Tinggi (Segera Berhenti)'
  },
  {
    id: 'diag-2',
    symptom: 'Indikator Suhu Mesin / Temperature Naik Tinggi (Overheat)',
    category: 'Sistem Pendingin',
    possibleCauses: ['Air radiator / coolant habis atau bocor', 'Ekstra fan radiator mati', 'Thermostat macet tertutup', 'Water pump rusak'],
    immediateAction: 'Segera pinggirkan mobil dan matikan mesin. JANGAN PERNAH membuka tutup radiator saat mesin panas karena air mendidih bisa menyembur!',
    recommendedService: 'Emergency Radiator & Cooling System Check',
    urgency: 'Tinggi (Segera Berhenti)'
  },
  {
    id: 'diag-3',
    symptom: 'Lampu Indikator Check Engine Menyala Kuning Terus',
    category: 'Mesin & ECU',
    possibleCauses: ['Sensor Oksigen (O2) atau Air Flow bermasalah', 'Busi atau Koil pengapian pincang (misfire)', 'Tutup tangki bensin kurang rapat', 'Sensor Camshaft / Crankshaft'],
    immediateAction: 'Rasakan apakah ada getaran mesin tidak stabil atau tarikan loyo. Jika mobil masih bisa jalan pelan, segera lakukan diagnosa elektrikal.',
    recommendedService: 'Diagnosa Elektrikal & Reset ECU',
    urgency: 'Sedang'
  },
  {
    id: 'diag-4',
    symptom: 'AC Mobil Keluar Angin Saja, Tidak Terasa Dingin',
    category: 'AC Mobil',
    possibleCauses: ['Tekanan freon habis / terjadi kebocoran pipa', 'Magnetic clutch kompresor tidak menyala', 'Relay / sekring AC putus', 'Filter kabin mampet total'],
    immediateAction: 'Matikan tombol A/C untuk meringankan beban kompresor, biarkan blower tetap menyala jika butuh sirkulasi udara.',
    recommendedService: 'Service AC, Cek Kebocoran & Isi Freon',
    urgency: 'Rendah (Pengecekan Berkala)'
  },
  {
    id: 'diag-5',
    symptom: 'Kaki-Kaki Berbunyi Gluduk-Gluduk saat Jalan Bergelombang',
    category: 'Kaki-Kaki & Suspensi',
    possibleCauses: ['Link stabilizer / bushing arm pecah', 'Ball joint atau tie rod oblak', 'Shockbreaker bocor / mati', 'Support shock aus'],
    immediateAction: 'Kurangi kecepatan di jalan rusak. Hindari manuver mendadak agar kontrol setir tetap aman.',
    recommendedService: 'Servis Kaki-Kaki & Penggantian Sparepart di Tempat',
    urgency: 'Sedang'
  },
  {
    id: 'diag-6',
    symptom: 'Pedal Rem Terasa Dalam / Bunyi Berdecit saat Diinjak',
    category: 'Pengereman',
    possibleCauses: ['Kampas rem sudah tipis / habis', 'Minyak rem berkurang karena kebocoran sil', 'Piringan disc brake bergelombang', 'Ada angin palsu di jalur rem'],
    immediateAction: 'Jaga jarak aman lebih jauh dengan kendaraan depan. Jangan pacu kendaraan pada kecepatan tinggi.',
    recommendedService: 'Ganti Kampas Rem & Bleeding Minyak Rem',
    urgency: 'Tinggi (Segera Berhenti)'
  }
];

export const CAR_BRANDS = [
  'Toyota',
  'Honda',
  'Mitsubishi',
  'Daihatsu',
  'Suzuki',
  'Nissan',
  'Hyundai',
  'Wuling',
  'Mazda',
  'Kia',
  'Isuzu',
  'BMW',
  'Mercedes-Benz',
  'Chevrolet',
  'Ford',
  'Volkswagen',
  'Lainnya'
];

export const COVERAGE_AREAS = [
  { name: 'Purwokerto Kota (Timur, Barat, Utara, Selatan)', desc: 'Jl. Jend. Soedirman, Alun-Alun, Karangkobar, Purwokerto Wetan, Pasirmuncang & Pusat Kota' },
  { name: 'Sokaraja & Kalibagor', desc: 'Jl. Suparjo Rustam, Sentra Getuk Sokaraja, Kalibagor, hingga perbatasan Banyumas' },
  { name: 'Baturraden & Sumbang', desc: 'Jalur Wisata Baturraden, Karangmangu, Sumbang, Kembaran, & Area Kampus UNSOED' },
  { name: 'Karanglewas & Kedungbanteng', desc: 'Pasar Karanglewas, Pasir Kulon, Kedungbanteng, Keniten & Jalur Ajibarang-Purwokerto' },
  { name: 'Kembaran, Patikraja & Banyumas', desc: 'Dukuhwaluh, Area Kampus UMP, Tambaksogra, Patikraja, Rawalo & Kota Lama Banyumas' }
];

export const WHATSAPP_PHONE = '62882007935047';
export const WHATSAPP_DISPLAY = '0882-0079-35047';
export const EMERGENCY_HOTLINE = '0882-0079-35047';
export const EMAIL_ADDRESS = 'kontak@fhrcar.com';
