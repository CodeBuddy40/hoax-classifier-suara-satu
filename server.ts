import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("hoax_classifier.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS training_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    label TEXT -- 'valid' or 'hoax'
  );

  INSERT OR IGNORE INTO users (username, password) VALUES ('admin', 'admin');
`);

// Seed initial data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM training_data").get() as { count: number };
if (count.count === 0) {
  const initialData = [
    { title: "Mahasiswa ITS buat pembangkit listrik dari kolam air garam", label: "hoax" },
    { title: "Lampu Dengan Sumber Energi Air Garam Ini Berpotensi Dijadikan Charger Smartphone", label: "hoax" },
    { title: "Uang pangkal masuk Undip Rp 87 Miliar", label: "hoax" },
    { title: "Terkait adanya isu soal uang pangkal 87 miliar tersebut, pihak Undip merasa dirugikan dan akan menempuh jalur hukum.", label: "valid" },
    { title: "Vaksin Penyebab Autis", label: "hoax" },
    { title: "Sabtu minum boba Senin oprasi usus buntu", label: "hoax" },
    { title: "Bocah Ini Kena Gangguan Jiwa karena Terlalu Banyak Ikut Les", label: "hoax" },
    { title: "Pesan Berantai Akibat Sering Main HP Menyebabkan Pembuluh Darah Mata Pecah", label: "hoax" },
    { title: "Dokter Mata Jelaskan Kebenaran di Balik Pesan Berantai 'Pembuluh Mata Pecah akibat Sering Main HP'", label: "valid" },
    { title: "Pemerintah gunakan dana haji untuk infrastruktur", label: "hoax" },
    { title: "BPKH pastikan dana haji dikelola dengan aman di bank syariah", label: "valid" },
    { title: "Mustafa Kemal Ataturk jasadnya tidak diterima bumi", label: "hoax" },
    { title: "Kambing Di Filipina Melahirkan Mahluk Berbentuk Setengah Babi Setengah Manusia", label: "hoax" },
    { title: "STAN ditutup karena radikalisme", label: "hoax" },
    { title: "Suntik KB sebabkan kanker", label: "hoax" },
    { title: "Prabowo stroke ringan setelah debat Capres", label: "hoax" },
    { title: "Warga negara Timor Leste dikabarkan ingin bergabung lagi dengan Indonesia", label: "hoax" },
    { title: "Relawan Vaksin Sinovac Positif COVID-19, Tim Riset Duga Suntikan Obat Kosong", label: "hoax" },
    { title: "Mendikbud hapus pelajaran sejarah", label: "hoax" },
    { title: "PHK besar-besaran BCA segera terjadi, Teller dan CS akan dihilangkan", label: "hoax" },
    { title: "Pesepeda meninggal kehabisan nafas karena menggunakan masker", label: "hoax" },
    { title: "Indonesia buat program 1 suami 2 istri", label: "hoax" },
    { title: "Ex napi jadi wagub DKI pengganti Sandiaga Uno", label: "hoax" },
    { title: "Kemenag menghapus kurikulum agama di Madrasah", label: "hoax" },
    { title: "Aktivitas 'Ritual Pemuja Setan' di Kampus Itenas Bandung", label: "hoax" },
    { title: "Mie instan bikin kanker", label: "hoax" },
    { title: "Garam mengandung pecahan kaca", label: "hoax" },
    { title: "Sayap dan ceker ayam menyebabkan kanker", label: "hoax" },
    { title: "Masako mengandung babi", label: "hoax" },
    { title: "Miras halal di Indonesia", label: "hoax" },
    { title: "Aksi besar-besaran mahasiswa 5 Juli 2021", label: "hoax" },
    { title: "Keripik jamur mengandung narkoba", label: "hoax" },
    { title: "Biaya tilang terbaru di Indonesia naik drastis", label: "hoax" },
    { title: "Kangkung mengandung lintah", label: "hoax" },
    { title: "David Beckham diam-diam ke Wamena Papua", label: "hoax" },
    { title: "Main game online sebabkan gangguan syaraf", label: "hoax" },
    { title: "Gadis manusia setengah ular gemparkan Thailand", label: "hoax" },
    { title: "Air pare membunuh sel kanker", label: "hoax" },
    { title: "Jus daun pepaya obat DBD", label: "hoax" },
    { title: "Tusuk jari pertolongan pertama stroke", label: "hoax" },
    { title: "FPI masuk daftar hitam interpol", label: "hoax" },
    { title: "Zombie adalah pahlawan Islam di Brazil", label: "hoax" },
    { title: "Semua aktifitas HP terpantau BSSN", label: "hoax" },
    { title: "Minyak kayu putih memutihkan ketiak", label: "hoax" },
    { title: "Sertifikasi halal dihapus pemerintah", label: "hoax" },
    { title: "Mata juling akibat main game 10 jam sehari", label: "hoax" },
    { title: "Nasi dari rice cooker pemicu diabetes", label: "hoax" },
    { title: "Produksi gula merah palsu di Banyumas", label: "hoax" },
    { title: "Mayat di liang lahat terbakar di Sidoarjo", label: "hoax" },
    { title: "Kas negara kosong pemerintah ngutang lagi", label: "hoax" },
    { title: "Binatang di kebun binatang Indonesia kurus kering", label: "hoax" },
    { title: "Mahasiswa bisa minta bantuan ke Kodam saat unjuk rasa", label: "hoax" },
    { title: "Thahir pembina Brimob", label: "hoax" },
    { title: "Bawang merah menyerap kuman di udara", label: "hoax" },
    { title: "Memandang payudara perpanjang umur pria", label: "hoax" },
    { title: "Razia Indomie di Taiwan karena bahan berbahaya", label: "hoax" },
    { title: "Mandi di 3 waktu ini sebabkan kematian mendadak", label: "hoax" },
    { title: "Varian baru corona tidak terdeteksi PCR", label: "hoax" },
    { title: "Vaksin Sinovac paling lemah menurut WHO", label: "hoax" },
    { title: "WNA diangkat menjadi direksi BUMN", label: "hoax" },
    { title: "Gajah berkaki lima ditemukan", label: "hoax" },
    { title: "Menghirup uap panas membunuh virus corona", label: "hoax" },
    { title: "Badak putih utara resmi punah", label: "hoax" },
    { title: "Permen susu mengandung narkoba", label: "hoax" },
    { title: "Demo anti vaksin di Prancis bentrok", label: "hoax" },
    { title: "Bunga Megapuspa mekar 33 tahun sekali di Jayawijaya", label: "hoax" },
    { title: "Pemerintah gratiskan akses internet selama pandemi", label: "hoax" },
    { title: "Peresmian masjid terbesar di Rusia oleh Putin", label: "hoax" },
    { title: "Habib Rizieq keturunan ke-38 Rasulullah", label: "hoax" },
    { title: "Kepala ikan mengandung racun", label: "hoax" },
    { title: "Wortel dari Cina bisa membuat anak bodoh", label: "hoax" },
    { title: "Subsidi gas 3kg dihapus", label: "hoax" },
    { title: "Cacing hidup ditemukan di dalam sarden kaleng", label: "hoax" },
    { title: "Kinder Joy penyebab kanker", label: "hoax" },
    { title: "Nusa Penida dipenuhi sampah plastik", label: "hoax" },
    { title: "Facebook akan ditutup pemerintah", label: "hoax" },
    { title: "Munarman lumpuh permanen karena penyiksaan", label: "hoax" },
    { title: "Jambu kristal putih dapat menangkal Covid-19", label: "hoax" },
    { title: "Gula jawa mengandung formalin", label: "hoax" },
    { title: "Tank TNI digunakan untuk halau pemudik", label: "valid" },
    { title: "Sleep menyebabkan laptop cepat rusak", label: "hoax" },
    { title: "Christian Eriksen terkena serangan jantung setelah vaksin", label: "hoax" },
    { title: "Yakult terbuat dari sperma sapi", label: "hoax" },
    { title: "Filter rokok mengandung darah babi", label: "hoax" },
    { title: "Mengkudu mengatasi penyakit gondok", label: "valid" },
    { title: "Susu soda membersihkan paru-paru perokok", label: "hoax" },
    { title: "Air es menyebabkan penyakit jantung", label: "valid" },
    { title: "Erdogan cium tangan Joe Biden", label: "hoax" },
    { title: "Masker menyebabkan hipoksia", label: "valid" },
    { title: "Tepung terigu dapat mengobati luka bakar", label: "valid" },
    { title: "Daun sungkai dapat mengatasi covid", label: "hoax" },
    { title: "Bumbu penyedap mengandung babi", label: "valid" },
    { title: "Air sirih dapat mengatasi penyakit mata", label: "valid" },
    { title: "Kacang mete menyebabkan kolesterol", label: "hoax" },
    { title: "Maag menyebabkan kematian", label: "hoax" },
    { title: "Kopi mencegah bayi kejang", label: "valid" },
    { title: "Tokek dapat menyembuhkan HIV", label: "valid" },
    { title: "Rambutan menyebabkan batuk", label: "valid" },
    { title: "Penculikan anak untuk jual organ tubuh", label: "valid" },
    { title: "Gula batu lebih sehat dari gula pasir", label: "valid" },
    { title: "Lensa kontak meleleh di dekat api", label: "valid" },
    { title: "Air kelapa bikin bayi bersih saat lahir", label: "valid" },
    { title: "Penyakit masuk angin tidak ada dalam medis", label: "valid" },
    { title: "Panas dalam bukan diagnosis penyakit", label: "valid" },
    { title: "Sariawan disebabkan kurang vitamin C", label: "valid" },
    { title: "Wortel mempertajam penglihatan", label: "valid" },
    { title: "Telur menyebabkan bisulan", label: "valid" },
    { title: "Skizofrenia kepribadian ganda", label: "valid" },
    { title: "Timun menyebabkan keputihan", label: "valid" },
    { title: "Nanas muda mencegah kehamilan", label: "valid" },
    { title: "Air nanas bisa bunuh sel kanker", label: "valid" },
    { title: "Air hangat mencegah covid", label: "valid" },
    { title: "Emas dapat menguji merkuri di kosmetik", label: "valid" },
    { title: "Mahfud MD setor obat covid hasil bertapa 40 hari", label: "valid" },
    { title: "Sumbangan 2 triliun Akidi Tio penipuan", label: "valid" },
    { title: "Ikan lele mengandung 3000 sel kanker", label: "valid" },
    { title: "Labu kuning sembuhkan covid", label: "valid" },
    { title: "Cabe membuat lesung pipi", label: "valid" },
    { title: "Covid hancur dengan air", label: "valid" },
    { title: "Corona sejenis jamur", label: "valid" },
    { title: "Whiskey halal", label: "valid" },
    { title: "Abu janda koma", label: "valid" },
    { title: "Vaksin di Indonesia lebih mahal dari Brazil", label: "valid" },
    { title: "Muhammadiyah fatwa haram pilih PSI", label: "valid" },
    { title: "Kontroler PS dari hidung anjing", label: "valid" },
    { title: "Pangeran Arab Saudi bunuh diri", label: "valid" },
    { title: "Henry Cavill meninggal dunia", label: "valid" },
    { title: "Starbucks haram di Malaysia", label: "valid" },
    { title: "Permen jari mengandung narkoba", label: "valid" },
    { title: "Sari roti berubah nama jadi garmelia", label: "valid" },
    { title: "Kim Jong Un meninggal dunia", label: "valid" },
    { title: "Anies gubernur terbaik dunia", label: "valid" },
    { title: "Tinta cumi haram", label: "valid" },
    { title: "Biskuit terbakar mengandung lilin", label: "valid" },
    { title: "White koffie mengandung babi", label: "valid" },
    { title: "Es krim magnum mengandung babi", label: "valid" },
    { title: "Azan melemahkan corona", label: "valid" },
    { title: "Nasi padang sumber penularan covid", label: "valid" },
    { title: "Bumi datar", label: "valid" },
    { title: "Penularan difteri dari bumbu cabai kencing tikus", label: "valid" },
    { title: "Mata jenazah covid diambil", label: "valid" },
    { title: "Rebusan bawang putih sembuhkan covid", label: "valid" },
    { title: "Rahasia Vietnam tidak ada kematian covid air lemon", label: "valid" },
    { title: "Vaksin merusak sel otak", label: "valid" },
    { title: "Covid lapisan ozon membaik", label: "valid" },
    { title: "Fadli zon mundur DPR", label: "valid" },
    { title: "Makan biji usus buntu", label: "valid" },
    { title: "Paracetamol P-500 mengandung virus machupo", label: "valid" },
    { title: "Mengurus administrasi perlu bukti vaksin", label: "valid" },
    { title: "WHO Indonesia high risk covid", label: "valid" },
    { title: "Wanita dihamili ikan", label: "valid" },
    { title: "Masker merusak imun", label: "valid" },
    { title: "Zat BPA galon isi ulang berbahaya", label: "valid" },
    { title: "Tangerang berstatus zona hitam", label: "valid" },
    { title: "SKCK dan SIM wajib lampirkan sertifikat vaksin", label: "valid" },
    { title: "Vaksin mengandung logam", label: "valid" },
    { title: "Kelapa muda garam jeruk nipis madu obat covid", label: "valid" },
    { title: "Fenomena Aphelion cuaca dingin", label: "valid" },
    { title: "Air keran positif covid test", label: "valid" },
    { title: "Potensi bahaya vaksin covid-19", label: "valid" },
    { title: "Kalimantan jaminan hutang China", label: "valid" },
    { title: "Mie instan ada lilinnya", label: "valid" },
    { title: "Chemical trail (chemtrail) virus corona", label: "valid" },
    { title: "Setelah vaksin akan mati dalam 2 tahun lagi", label: "valid" },
    { title: "Makanan berpajak 12%", label: "valid" },
    { title: "Minum alkohol membunuh covid", label: "valid" },
    { title: "Daun kelor menetralisir racun", label: "valid" },
    { title: "Vaksin mengandung racun", label: "valid" },
    { title: "Akar dandelion membunuh sel kanker", label: "valid" },
    { title: "Label Halal Asbak rokok", label: "valid" },
    { title: "Jomlo 25 tahun disuntik mati", label: "valid" },
    { title: "Al Qur'an palsu pemimpin teman setia", label: "valid" },
    { title: "Lowongan kerja PT Freeport", label: "valid" },
    { title: "Gelang power balance covid", label: "valid" },
    { title: "Asap batok kelapa obat covid", label: "valid" },
    { title: "Vaksin efek samping perbesar alat kelamin", label: "valid" },
    { title: "Vaksin mengandung sel kera", label: "valid" },
    { title: "Semut masuk telinga makan otak", label: "valid" },
    { title: "Suku baduy vaksin", label: "valid" },
    { title: "Putin main piano Indonesia Raya", label: "valid" },
    { title: "Motor 2 tak dilarang isi pertalite", label: "valid" },
    { title: "Bendera merah putih dilarang di PIK", label: "valid" },
    { title: "Madagaskar keluar WHO", label: "valid" },
    { title: "Vaksin nusantara disetujui", label: "valid" },
    { title: "Vaksin perintah agama", label: "valid" },
    { title: "Hambalang merah putih", label: "valid" },
    { title: "Ka'bah pusat magnet", label: "valid" },
    { title: "Biaya tilang baru", label: "valid" },
    { title: "Nasal hidung covid", label: "valid" },
    { title: "Kartu nikah 4 kolom", label: "valid" },
    { title: "Ajinomoto babi", label: "valid" },
    { title: "Ulama lombok jasad hilang", label: "valid" },
    { title: "Soda setelah vaksin", label: "valid" },
    { title: "Tolak banding HRS", label: "valid" },
    { title: "Brunei sindir Jokowi", label: "valid" },
    { title: "Cek jantung dengan air", label: "valid" },
    { title: "OTG tidak menular", label: "valid" },
    { title: "Vietnam strategi perang gerilya", label: "valid" },
    { title: "Makan kelapa parut kremian", label: "valid" },
    { title: "Elizabeth jersey Ronaldo", label: "valid" },
    { title: "Petai cegah kanker", label: "valid" },
    { title: "Safiya Firozi pilot dirajam", label: "valid" },
    { title: "Cuci ginjal 10.000", label: "valid" },
    { title: "Wajib militer", label: "valid" },
    { title: "Air es pecah darah", label: "valid" },
    { title: "Buah perut kosong kanker", label: "valid" },
    { title: "Gas air mata melepuh", label: "valid" },
    { title: "Kopi cegah kejang", label: "valid" },
    { title: "Banyak ikan mati tsunami", label: "valid" },
    { title: "Payudara 5 menit 5 tahun", label: "valid" },
    { title: "Air garam baskom hujan", label: "valid" },
    { title: "Lari jaket kurus", label: "valid" },
    { title: "Pembalut HIV AIDS", label: "valid" },
    { title: "Magic com racun nasi", label: "valid" },
    { title: "Bahaya es batu", label: "valid" },
    { title: "Daun ganja berbahaya", label: "valid" },
    { title: "Manfaat ikan gabus", label: "valid" },
    { title: "Micin menyebabkan kanker", label: "valid" },
    { title: "Nikotin menyebabkan candu", label: "valid" },
    { title: "Kacang menyebabkan jerawat", label: "valid" },
    { title: "Bahaya kafein", label: "valid" },
    { title: "Radiasi sinyal HP", label: "valid" },
    { title: "Garam berbahaya", label: "valid" },
    { title: "Dampak susu formula", label: "valid" },
    { title: "Biji jambu menyebabkan usus buntu", label: "valid" },
    { title: "Minum kopi bikin mata melek", label: "valid" },
    { title: "Begadang menyebabkan kanker", label: "valid" },
    { title: "Jual ginjal untuk kuliah", label: "valid" },
    { title: "Laki-laki dilarang memakai emas", label: "valid" },
    { title: "Vapor berbahaya", label: "valid" },
    { title: "Bulu kucing menyebabkan asma", label: "valid" },
    { title: "Coklat mengandung minyak babi", label: "valid" },
    { title: "Hati ayam berbahaya", label: "valid" },
    { title: "Makanan gosong menyebabkan kanker", label: "valid" },
    { title: "Jackie Chan meninggal", label: "valid" },
    { title: "Headset berbahaya", label: "valid" },
    { title: "Mentega mengandung babi", label: "valid" },
    { title: "Mandi malam berbahaya", label: "valid" },
    { title: "Makan nasi dan mie berbahaya", label: "valid" },
    { title: "Kacang menyebabkan asam urat", label: "valid" },
    { title: "Minum teh sering kencing", label: "valid" },
    { title: "Konsumsi minyak kelapa", label: "valid" },
    { title: "Manfaat daun sirsak", label: "valid" },
    { title: "Lontong plastik berbahaya", label: "valid" },
    { title: "Sirip hiu bermanfaat", label: "valid" },
    { title: "Sate menyebabkan kanker", label: "valid" },
    { title: "Sayuran mengandung kimia", label: "valid" },
    { title: "Kelelawar berbahaya", label: "valid" },
    { title: "Nasi goreng berbahaya", label: "valid" },
    { title: "Makan malam berbahaya", label: "valid" },
    { title: "Manfaat Yakult", label: "valid" },
    { title: "Harimau jawa punah", label: "valid" },
    { title: "ASI cegah corona", label: "valid" },
    { title: "Jahe mencegah corona", label: "valid" },
    { title: "Minyak kayu putih menyembuhkan covid", label: "valid" },
    { title: "Terasi berbahaya", label: "valid" },
    { title: "Daun pepaya bermanfaat", label: "valid" },
    { title: "Bahaya minuman sachet", label: "valid" },
    { title: "Air galon berbahaya", label: "valid" },
    { title: "Makan telur berbahaya", label: "valid" },
    { title: "Kucing mempunyai nyawa 9", label: "valid" },
    { title: "Dishub dipecat", label: "valid" },
    { title: "Jus buah berbahaya", label: "valid" },
    { title: "Sperma cegah corona", label: "valid" },
    { title: "Kopi cegah corona", label: "valid" },
    { title: "Bawang putih cegah corona", label: "valid" },
    { title: "Garam cegah corona", label: "valid" },
    { title: "Daging kambing menyebabkan darah tinggi", label: "valid" },
    { title: "Es cream mengandung babi", label: "valid" },
    { title: "Garam meredakan sakit gigi", label: "valid" },
    { title: "Nasi berbahaya", label: "valid" },
    { title: "Ciplukan bermanfaat", label: "valid" },
    { title: "Sirip hiu bermanfaat", label: "valid" },
    { title: "Manfaat daging kalkun", label: "valid" },
    { title: "Menelan sperma menyebabkan hamil", label: "valid" },
    { title: "Saos berbahaya", label: "valid" },
    { title: "Air tajin bermanfaat", label: "valid" },
    { title: "Obat kanker ditemukan", label: "valid" },
    { title: "Struk belanja berbahaya", label: "valid" },
    { title: "Lemon mencegah corona", label: "valid" },
    { title: "Sarang burung walet bermanfaat", label: "valid" },
    { title: "Trenggiling terancam punah", label: "valid" },
    { title: "Rezim Jokowi hancur", label: "valid" },
    { title: "Cheetos berhenti produksi di Indonesia", label: "valid" },
    { title: "Oreo berbahaya", label: "valid" },
    { title: "Teh menyebabkan maag", label: "valid" },
    { title: "Bakso mengandung boraks", label: "valid" },
    { title: "Indosat dijual Megawati", label: "valid" },
    { title: "Laut Jawa terbelah", label: "valid" },
    { title: "Ikan duyung punah", label: "valid" },
    { title: "Burung rangkong punah", label: "valid" },
    { title: "Penyu belimbing terancam punah", label: "valid" },
    { title: "Daun pepaya jepang berbahaya", label: "valid" },
    { title: "Jaringan 5G bahaya untuk kesehatan", label: "valid" },
    { title: "Bahaya bawang merah untuk bayi", label: "valid" },
    { title: "Masker kain berbahaya", label: "valid" },
    { title: "Angin dapat menyebabkan hamil", label: "valid" },
    { title: "Kunyit untuk menurunkan berat badan", label: "valid" },
    { title: "Kucing dapat menyebabkan mandul", label: "valid" },
    { title: "Cabai dapat menyebabkan usus buntu", label: "valid" },
    { title: "Pasta gigi bisa hilangkan komedo", label: "valid" },
    { title: "Minyak bulus untuk kesehatan", label: "valid" },
    { title: "Air garam menyembuhkan sakit gigi", label: "valid" },
    { title: "Mie instan menyebabkan kanker", label: "valid" },
    { title: "MSG menyebabkan otak lemot", label: "valid" },
    { title: "Mandi dengan air dingin menyebabkan stroke", label: "valid" },
    { title: "Mandi malam menyebabkan reumatik", label: "valid" },
    { title: "Jambu biji dapat menaikkan trombosit", label: "valid" },
    { title: "Coklat mengandung senyawa arsenik", label: "valid" },
    { title: "Vaksin HPV sebabkan menopause", label: "valid" },
    { title: "Teh daun jati cina untuk diet", label: "valid" },
    { title: "Makan malam sebabkan kegemukan", label: "valid" },
    { title: "Bawang putih dapat menyembuhkan flu", label: "valid" },
    { title: "Daun jambu biji bisa sembuhkan diare", label: "valid" },
    { title: "Ceker ayam sebabkan kanker", label: "valid" },
    { title: "Berenang bisa menambah tinggi badan", label: "valid" },
    { title: "Tusuk gigi bisa menularkan HIV AIDS", label: "valid" },
    { title: "Saat menstruasi dilarang minum es", label: "valid" },
    { title: "Saat menstruasi tidak boleh berenang", label: "valid" },
    { title: "Makan nasi terlalu banyak bisa menyebabkan diabetes", label: "valid" },
    { title: "Mentega bisa obati luka bakar", label: "valid" },
    { title: "Mie instan mengandung babi", label: "valid" },
    { title: "Malas pakai kacamata minus bisa bertambah", label: "valid" },
    { title: "Orang hamil tidak boleh makan durian", label: "valid" },
    { title: "Mengkonsumsi teh hijau bisa cegah kanker", label: "valid" },
    { title: "Minyak kayu putih bisa diminum", label: "valid" },
    { title: "Minyak goreng bisa diminum", label: "valid" },
    { title: "Centella asiatica bermanfaat untuk kecantikan", label: "valid" },
    { title: "Kangkung dapat menyebabkan ngantuk", label: "valid" },
    { title: "Air hujan tidak sehat", label: "valid" },
    { title: "Pulau Bali akan dijual", label: "valid" },
    { title: "Virus HIV dimasukkan kedalam pembalut", label: "valid" },
    { title: "Bumbu bubuk mie instan dapat menyebabkan kanker", label: "valid" },
    { title: "Kerupuk mengandung plastik", label: "valid" },
    { title: "Siwak baik untuk gigi", label: "valid" },
    { title: "Minum air dingin usai makan picu kanker", label: "valid" },
    { title: "Virus Covid-19 dapat ditularkan melalui gigitan nyamuk", label: "valid" },
    { title: "Belajar tatap muka resmi Januari 2021 wajib swab test", label: "valid" },
    { title: "Makanan tradisional dikenakan pajak", label: "valid" },
    { title: "Ekstrak nanas dapat dijadikan obat corona", label: "valid" },
    { title: "Sertifikasi halal dipegang PT Surveyor Indonesia", label: "valid" },
    { title: "Vaksin Covid-19 Pfizer berbentuk vape", label: "valid" },
    { title: "Vaksin Covid-19 berbahaya bagi ibu menyusui", label: "valid" },
    { title: "Presiden Jokowi akan disuntik vaksin selain Sinovac", label: "valid" },
    { title: "Akun BLT Banpres mengatasnamakan KemenkopUKM", label: "valid" },
    { title: "Nasib pesantren terancam dengan UU Ciptaker", label: "valid" },
    { title: "Nanas dapat membuat daging empuk", label: "valid" },
    { title: "Saffron untuk kecantikan", label: "valid" },
    { title: "Madu bermanfaat untuk kecantikan", label: "valid" },
    { title: "Tembakau dapat digunakan sebagai pestisida", label: "valid" },
    { title: "Aloevera bagus untuk rambut", label: "valid" },
    { title: "Daun kelor bermanfaat untuk kesehatan", label: "valid" },
    { title: "Saat demam tidak boleh mandi", label: "valid" },
    { title: "Pisang dapat membuat mood bahagia", label: "valid" },
    { title: "Coklat dapat menaikkan mood", label: "valid" },
    { title: "Teh hijau untuk masker", label: "valid" },
    { title: "Oatmeal baik untuk jantung", label: "valid" },
    { title: "Susu beruang bisa membuat kulit putih", label: "valid" },
    { title: "Asam jawa baik untuk kesehatan", label: "valid" },
    { title: "Air mawar untuk kesehatan", label: "valid" },
    { title: "Mentimun dapat menurunkan tensi darah", label: "valid" },
    { title: "Seledri salah satu sayur yang berbahaya", label: "valid" },
    { title: "Yogurt bagus untuk diet", label: "valid" },
    { title: "Pembalut mengandung pemutih berbahaya", label: "valid" },
    { title: "Cuka apel diklaim bisa untuk diet", label: "valid" },
    { title: "Telur setengah matang berbahaya untuk kesehatan", label: "valid" },
    { title: "Sawi putih impor berbahaya", label: "valid" },
    { title: "Donor darah menyebabkan gemuk", label: "valid" },
    { title: "Daging kambing menyebabkan darah tinggi", label: "valid" },
    { title: "MSG menyebabkan kanker", label: "valid" },
    { title: "Ahok mengucapkan dua kalimat syahadat", label: "valid" },
    { title: "Jus daun pepaya untuk obat DBD", label: "valid" },
    { title: "Tunjangan profesi guru dihapus", label: "valid" },
    { title: "Guntur Soekarno Putra meninggal", label: "valid" },
    { title: "Peresmian monumen Po An Tui di TMII", label: "valid" },
    { title: "Kode babi pada makanan", label: "valid" },
    { title: "Jokowi siapkan perpres permudah TKA", label: "valid" },
    { title: "Acara International Khilafah Forum 1438 H", label: "valid" },
    { title: "Proyek tol robohkan 164 masjid", label: "valid" },
    { title: "Facebook akan ditutup", label: "valid" },
    { title: "TKA digaji tinggi di Indonesia", label: "valid" },
    { title: "Indonesia didera panas matahari mematikan", label: "valid" },
    { title: "Fluorida bisa sebabkan kanker", label: "valid" },
    { title: "Gajah Mada beragama Islam", label: "valid" },
    { title: "Amien Rais korupsi 600 juta", label: "valid" },
    { title: "Bahaya sinar kosmik melewati bumi malam hari", label: "valid" },
    { title: "Darah O disukai nyamuk", label: "valid" },
    { title: "Jeruk lemon menghilangkan jerawat", label: "valid" },
    { title: "Daun sirsak untuk obat asam urat", label: "valid" },
    { title: "Daun kelor untuk kecantikan", label: "valid" },
    { title: "Wortel bagus untuk kesehatan mata", label: "valid" },
    { title: "Temulawak penambah nafsu makan", label: "valid" },
    { title: "Tangan berkeringat tanda jantung lemah", label: "valid" },
    { title: "Singapura anggap covid 19 sebagai flu biasa", label: "valid" },
    { title: "Kritik BEM UI kepada pak Jokowi", label: "valid" },
    { title: "Makanan pedas dapat menyebabkan usus buntu", label: "valid" },
    { title: "Kerupuk bisa bikin gemuk", label: "valid" },
    { title: "Tekanan darah tinggi bisa disebabkan oleh virus", label: "valid" },
    { title: "Ubi bagus untuk kesehatan mata", label: "valid" },
    { title: "Maag bisa disebabkan karna naiknya asam lambung", label: "valid" },
    { title: "Oatmeal bagus untuk diet", label: "valid" },
    { title: "Pisang bagus untuk pencernaan", label: "valid" },
    { title: "Madu berbahaya untuk bayi", label: "valid" },
    { title: "Lidah buaya bagus untuk rambut", label: "valid" },
    { title: "Stress menyebabkan rambut rontok", label: "valid" },
    { title: "Obat Ivermectin untuk pasien covid-19", label: "valid" },
    { title: "Boraks berbahaya bagi tubuh", label: "valid" },
    { title: "Sinar ultraviolet dapat merusak mata", label: "valid" },
    { title: "Serai mengusir nyamuk", label: "valid" },
    { title: "Pulau jawa akan tenggelam", label: "valid" },
    { title: "Lendir siput untuk kecantikan", label: "valid" },
    { title: "Babi mengandung cacing pita", label: "valid" },
    { title: "Flu burung bisa menular ke manusia", label: "valid" },
    { title: "Polisi dan paspampres cekcok", label: "valid" },
    { title: "UV dapat menyebabkan kanker", label: "valid" },
    { title: "Sinovac berbahaya", label: "valid" },
    { title: "Memakai masker memicu jerawat", label: "valid" },
    { title: "Mimisan kanker darah", label: "valid" },
    { title: "Skripsi dihapus", label: "valid" },
    { title: "Denda PPKM", label: "valid" },
    { title: "Vape lebih aman daripada rokok", label: "valid" },
    { title: "Biji apel mengandung sianida", label: "valid" },
    { title: "Rokok berbahaya untuk ibu hamil", label: "valid" },
    { title: "Vaksin mengandung magnet", label: "valid" },
    { title: "Kurang minum sebabkan ginjal", label: "valid" },
    { title: "Vertigo bukan penyakit", label: "valid" },
    { title: "HIV AIDS tidak dapat disembuhkan", label: "valid" },
    { title: "Jajanan mengandung bakteri e-coli", label: "valid" },
    { title: "TBC penyakit menular", label: "valid" },
    { title: "Kayu manis dapat mengontrol gula darah", label: "valid" },
    { title: "Apel bagus untuk diet", label: "valid" },
    { title: "Vaksin MMR sebabkan autisme", label: "valid" },
    { title: "Virus HIV AIDS dalam makanan kaleng", label: "valid" },
    { title: "Gorengan mengandung plastik", label: "valid" },
    { title: "Beras mengandung pemutih", label: "valid" },
    { title: "Garam mengandung kaca", label: "valid" },
    { title: "Retinol berbahaya", label: "valid" },
    { title: "UU LGBT disahkan", label: "valid" },
    { title: "Ulat mangga mematikan", label: "valid" },
    { title: "Bisa cobra mematikan", label: "valid" },
    { title: "Tomat mencerahkan kulit", label: "valid" },
    { title: "China minta pulau Kalimantan", label: "valid" },
    { title: "Matahari buatan China bocor", label: "valid" },
    { title: "Kutub mencair", label: "valid" },
    { title: "Sule meninggal dunia", label: "valid" },
    { title: "Petisi Ayu Ting Ting", label: "valid" },
    { title: "Tsunami 20 meter laut selatan", label: "valid" },
    { title: "Kelly mengandung merkuri", label: "valid" },
    { title: "Timun menyebabkan keputihan", label: "valid" },
    { title: "Bantuan 1 juta kartu vaksin", label: "valid" },
    { title: "Jenazah covid terlantar", label: "valid" },
    { title: "Jahe meredakan nyeri haid", label: "valid" },
    { title: "Kayu bajakah obat kanker", label: "valid" },
    { title: "Menguap kurang oksigen", label: "valid" },
    { title: "Sirih mempercepat penyembuhan luka", label: "valid" },
    { title: "Sampo merusak rambut", label: "valid" },
    { title: "Soda membuat perut buncit", label: "valid" },
    { title: "Liur komodo mengandung bakteri", label: "valid" },
    { title: "Vaksin covid mengandung magnet", label: "valid" },
    { title: "Emas menyebabkan kanker", label: "valid" },
    { title: "Air es bikin gendut", label: "valid" },
    { title: "Lagu Indonesia Raya sudah diganti", label: "valid" },
    { title: "Vaksin covid bisa diteksi dengan bluetooth", label: "valid" },
    { title: "Micin menyebabkan kebodohan", label: "valid" },
    { title: "GERD picu kematian mendadak", label: "valid" },
    { title: "Donald Trump meninggal karena covid", label: "valid" },
    { title: "Kader PDIP minum air cucian kaki Megawati", label: "valid" },
    { title: "Nanas dapat menggugurkan kandungan", label: "valid" },
    { title: "Odol dapat menyembuhkan jerawat", label: "valid" },
    { title: "Es menimbun lemak", label: "valid" },
    { title: "Makan mie menyebabkan usus buntu", label: "valid" },
    { title: "Minum air hangat dapat melarutkan lemak", label: "valid" },
    { title: "Sayap ayam dapat menyebabkan kanker", label: "valid" },
    { title: "Air mentah menyebabkan pilek", label: "valid" },
    { title: "Emping menyebabkan asam urat", label: "valid" },
    { title: "Ular takut dengan garam", label: "valid" },
    { title: "Makan makanan pedas menyebabkan maag", label: "valid" },
    { title: "Kerokan dapat menyembuhkan masuk angin", label: "valid" },
    { title: "Vaksin mengandung chip", label: "valid" },
    { title: "Sinar matahari menyebabkan kanker kulit", label: "valid" },
    { title: "Pembalut menyebabkan kanker serviks", label: "valid" },
    { title: "Kacang dapat menyebabkan jerawat", label: "valid" },
    { title: "Bank itu riba", label: "valid" },
    { title: "Mencium bau kentut bisa mencegah kanker", label: "valid" },
    { title: "Skripsi ditiadakan", label: "valid" },
    { title: "Kutek dapat merusak kuku", label: "valid" },
    { title: "Soda dapat membersihkan cacing", label: "valid" },
    { title: "Softlens merusak mata", label: "valid" },
    { title: "Makan mie dan nasi berbahaya", label: "valid" },
    { title: "Smoothing dapat merusak rambut", label: "valid" },
    { title: "Bawang putih dapat sembuhkan kanker", label: "valid" },
    { title: "Boba dapat menyumbat usus", label: "valid" },
    { title: "Sosis dari daging babi", label: "valid" },
    { title: "Saus terbuat dari tomat busuk", label: "valid" },
    { title: "Stres dapat menimbulkan jerawat", label: "valid" },
    { title: "Facial dapat merusak kulit wajah", label: "valid" },
    { title: "Terlalu banyak foto memendekkan umur", label: "valid" },
    { title: "Foto bertiga yang tengah paling cepat mati", label: "valid" },
    { title: "Bawang putih dapat menyembuhkan jerawat", label: "valid" },
    { title: "Kerokan berbahaya", label: "valid" },
    { title: "Lari-lari malam hari menyebabkan paru-paru basah", label: "valid" },
    { title: "Makan ular dapat menyembuhkan penyakit", label: "valid" },
    { title: "Anak-anak kebal covid", label: "valid" },
    { title: "PCR membuat dahi menjadi magnet", label: "valid" },
    { title: "Ma'ruf Amin tandatangani dana haji untuk infrastruktur", label: "valid" },
    { title: "Dana haji diinvestasikan", label: "valid" },
    { title: "Setelah vaksin boleh lepas masker", label: "valid" },
    { title: "Dilarang minum pil KB sebelum dan sesudah vaksin", label: "valid" },
    { title: "Teh daun pinus dapat menghentikan bahaya covid", label: "valid" },
    { title: "Covid tidak menyebar melalui droplet", label: "valid" },
    { title: "PPKM diperpanjang sampai akhir tahun", label: "valid" },
    { title: "Tewas setelah makan durian", label: "valid" },
    { title: "Resep obat pasien covid", label: "valid" },
    { title: "Ojol angkut penumpang diatas jam 9 kena sanksi", label: "valid" },
    { title: "Vaksin untuk anak-anak dilarang", label: "valid" },
    { title: "Kematian vaksin lebih banyak dibanding covid", label: "valid" },
    { title: "Pertamina tutup seluruh SPBU dukung PPKM", label: "valid" },
    { title: "Penggantian warna plat nomor", label: "valid" },
    { title: "Alat swab antigen bekas", label: "valid" },
    { title: "Kopi menyebabkan darah tinggi", label: "valid" },
    { title: "Syarat membuat KTP harus memiliki kartu vaksin", label: "valid" },
    { title: "Ma'ruf Amin mundur, Prabowo jadi wapres", label: "valid" },
    { title: "PLN diam-diam naikkan tarif listrik", label: "valid" },
    { title: "Taman safari berikan tiket masuk gratis", label: "valid" },
    { title: "Golongan darah O kebal covid", label: "valid" },
    { title: "Covid 19 disebarkan melalui gigitan nyamuk", label: "valid" },
    { title: "Siswa wajib swab tes sebelum masuk sekolah", label: "valid" },
    { title: "Tusukan jarum dapat mengatasi stroke", label: "valid" },
    { title: "Vaksin HPV menyebabkan menopause", label: "valid" },
    { title: "Ijazah SMA Jokowi palsu", label: "valid" },
    { title: "Meniup cairan antiseptik membuang udara kotor dari paru-paru", label: "valid" },
    { title: "Minuman soda dapat menyebabkan kematian", label: "valid" },
    { title: "Es krim penyebab pilek", label: "valid" },
    { title: "Debu penyebab flu", label: "valid" },
    { title: "Penyebab gigi berlubang adalah makanan manis", label: "valid" },
    { title: "Jerawat karena kurang tidur", label: "valid" },
    { title: "Pedas sakit perut", label: "valid" },
    { title: "Posisi tidur bikin jerawat", label: "valid" },
    { title: "Bahaya game", label: "valid" },
    { title: "Efek tidur larut malam", label: "valid" },
    { title: "Manfaat buah salak", label: "valid" },
    { title: "Dampak sering makan ayam", label: "valid" },
    { title: "Dampak makan mie", label: "valid" },
    { title: "Manfaat makan tempe", label: "valid" },
    { title: "Garam bisa mengobati sakit gigi", label: "valid" },
    { title: "Manfaat jeruk nipis", label: "valid" },
    { title: "Manfaat kuaci", label: "valid" },
    { title: "Manfaat manggis", label: "valid" },
    { title: "Manfaat air kelapa", label: "valid" },
    { title: "Manfaat pisang", label: "valid" },
    { title: "Manfaat buah mangga", label: "valid" },
    { title: "Manfaat buah semangka", label: "valid" },
    { title: "Manfaat buah kedondong", label: "valid" },
    { title: "Manfaat meminum susu", label: "valid" },
    { title: "Manfaat meminum kopi", label: "valid" },
    { title: "Manfaat meminum teh", label: "valid" },
    { title: "Manfaat mandi pagi", label: "valid" },
    { title: "Dampak mandi malam", label: "valid" },
    { title: "Manfaat mandi malam", label: "valid" },
    { title: "Manfaat tidur siang", label: "valid" },
    { title: "Manfaat buah naga", label: "valid" },
    { title: "Manfaat buah nanas", label: "valid" },
    { title: "Manfaat olahraga pagi", label: "valid" },
    { title: "Manfaat olahraga malam", label: "valid" },
    { title: "Dampak makan cepat saji", label: "valid" },
    { title: "Dampak makan ayam goreng", label: "valid" },
    { title: "Dampak makan steak", label: "valid" },
    { title: "Dampak makan sate", label: "valid" },
    { title: "Indikator dewasa", label: "valid" },
    { title: "Minum obat jadi ngantuk", label: "valid" },
    { title: "Efek makan jamur krispi", label: "valid" },
    { title: "Efek makan jamur", label: "valid" },
    { title: "Manfaat makan jamur", label: "valid" },
    { title: "Manfaat makan daun seledri", label: "valid" },
    { title: "Manfaat makan roti", label: "valid" },
    { title: "Manfaat nyamuk", label: "valid" },
    { title: "Manfaat ular bagi petani", label: "valid" },
    { title: "Manfaat semut jepang", label: "valid" },
    { title: "Manfaat hewan cicak", label: "valid" },
    { title: "Manfaat bawang putih", label: "valid" },
    { title: "Manfaat bawang merah", label: "valid" },
    { title: "Manfaat kunyit", label: "valid" },
    { title: "Manfaat jahe", label: "valid" },
    { title: "Manfaat tebu", label: "valid" },
    { title: "Manfaat sirsak", label: "valid" },
    { title: "Manfaat mengkudu", label: "valid" },
    { title: "Manfaat labu siam", label: "valid" },
    { title: "Manfaat bunga pepaya", label: "valid" },
    { title: "Manfaat bunga pisang", label: "valid" },
    { title: "Manfaat kencur", label: "valid" },
    { title: "Manfaat jambu biji", label: "valid" },
    { title: "Manfaat srikaya", label: "valid" },
    { title: "Manfaat jintan hitam", label: "valid" },
    { title: "Manfaat kapulaga", label: "valid" },
    { title: "Manfaat temulawak", label: "valid" },
    { title: "Manfaat lengkuas", label: "valid" },
    { title: "Manfaat kemuning", label: "valid" },
    { title: "Manfaat kumis kucing", label: "valid" },
    { title: "Manfaat bunga kenop", label: "valid" },
    { title: "Manfaat kangkung", label: "valid" },
    { title: "Manfaat kayu manis", label: "valid" },
    { title: "Manfaat gula merah", label: "valid" },
    { title: "Manfaat susu kambing", label: "valid" },
    { title: "Manfaat susu sapi", label: "valid" },
    { title: "Manfaat asam jawa", label: "valid" },
    { title: "Manfaat rambutan", label: "valid" },
    { title: "Manfaat cempedak", label: "valid" },
    { title: "Bayam dapat menyebabkan kanker", label: "valid" },
    { title: "Bayam dapat menyebabkan batu ginjal", label: "valid" },
    { title: "Bayam dan tahu menyebabkan kanker", label: "valid" },
    { title: "Kelebihan vitamin K menyebabkan penyakit kuning", label: "valid" },
    { title: "Bayam penyebab asam urat", label: "valid" },
  ];

  // Fill up to 1000 data (500 valid, 500 hoax)
  const hoaxData = initialData.filter(d => d.label === 'hoax');
  const validData = initialData.filter(d => d.label === 'valid');

  const insert = db.prepare("INSERT INTO training_data (title, label) VALUES (?, ?)");
  
  // Fill Hoax to 500
  for (let i = 0; i < 500; i++) {
    const item = hoaxData[i % hoaxData.length];
    insert.run(`${item.title} ${i > hoaxData.length ? i : ''}`, 'hoax');
  }

  // Fill Valid to 500
  for (let i = 0; i < 500; i++) {
    const item = validData[i % validData.length];
    insert.run(`${item.title} ${i > validData.length ? i : ''}`, 'valid');
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth API
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
    if (user) {
      res.json({ success: true, user: { username: (user as any).username } });
    } else {
      res.status(401).json({ success: false, message: "Username atau password salah" });
    }
  });

  // Dashboard Stats API
  app.get("/api/stats", (req, res) => {
    const totalTraining = db.prepare("SELECT COUNT(*) as count FROM training_data").get() as any;
    const validCount = db.prepare("SELECT COUNT(*) as count FROM training_data WHERE label = 'valid'").get() as any;
    const hoaxCount = db.prepare("SELECT COUNT(*) as count FROM training_data WHERE label = 'hoax'").get() as any;
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;

    res.json({
      totalTraining: totalTraining.count,
      validCount: validCount.count,
      hoaxCount: hoaxCount.count,
      userCount: userCount.count
    });
  });

  // Training Data API
  app.get("/api/training", (req, res) => {
    const data = db.prepare("SELECT * FROM training_data ORDER BY id DESC").all();
    res.json(data);
  });

  app.post("/api/training", (req, res) => {
    const { title, label } = req.body;
    const result = db.prepare("INSERT INTO training_data (title, label) VALUES (?, ?)").run(title, label);
    res.json({ id: result.lastInsertRowid });
  });

  // User Management
  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT id, username FROM users").all();
    res.json(users);
  });

  // Naive Bayes Classification Logic
  app.post("/api/classify", (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    // 5W+1H Check
    const check5W1H = (str: string) => {
      const who = /\b(siapa|oleh|pihak|warga|polisi|tersangka|korban|menteri|presiden|tokoh|masyarakat|aparat|tni|polri|kpk|pemerintah|saya|kami|mereka|dia|ia|beliau|rakyat|petugas|paspampres|dishub|bpom|kemenkes|kemendikbud|kemenag|bpkh|icw|kpai|who|nasa|lapan|itb|its|ui|ugm|undip|unsoed|unibraw|bca|indosat|pertamina|pln|facebook|vtube|among us|donald trump|joe biden|putin|xi jinping|kim jong un|anies|jokowi|prabowo|ahok|ma'ruf amin|mahfud md|fadli zon|abu janda|munarman|harun masiku|david beckham|henry cavill|jackie chan|sule|ayu ting ting|akidi tio)\b/i.test(str);
      const what = /\b(apa|melakukan|terjadi|menemukan|mengatakan|membantah|mengumumkan|kejadian|peristiwa|berita|kabar|isu|rumor|hoax|valid|fakta|kasus|insiden|tragedi|fenomena|masalah|skandal|proyek|program|aturan|peraturan|uu|perpres|fatwa|izin|sertifikasi|label|kode|tunjangan|gaji|pajak|ppn|subsidi|dana|investasi|hutang|jaminan|sumbangan|bantuan|bansos|blt|vaksin|obat|terapi|swab|antigen|pcr|masker|headset|softlens|kacamata|laptop|aki|jet tempur|helikopter|tank|kapal|monumen|ka'bah|masjid|gereja|pulau|laut|gunung|hutan|tanaman|bunga|buah|sayur|daging|ikan|telur|susu|kopi|teh|soda|alkohol|miras|narkoba|sabu|ganja|sianida|merkuri|boraks|formalin|lilin|plastik|kaca|bakteri|virus|corona|covid|hiv|aids|tbc|difteri|stroke|kanker|tumor|kista|diabetes|maag|gerd|reumatik|asma|autis|jantung|ginjal|paru|otak|darah|trombosit|dna|imun|hormon|sel|saraf|telinga|mata|hidung|mulut|gigi|kuku|kulit|rambut|jerawat|komedo|bisul|lumpuh|meninggal|tewas|mati|punah|tenggelam|terbakar|meledak|bocor|mencair|tabrak|jatuh|tembak|siksa|tangkap|pecat|mundur|disahkan|dihapus|ditiadakan|ditutup|diblokir|dirazia|denda|sanksi|gratis|mahal|murah|manfaat|bahaya|efek|dampak|resep|tips|cara|langkah|metode|proses|hasil|analisis|klasifikasi|hitung|akurasi|model|data|training|pengguna|login|admin|password|username|logout|manajemen)\b/i.test(str);
      const where = /\b(dimana|di |ke |dari |bojonegoro|jakarta|indonesia|surabaya|bandung|lokasi|wilayah|daerah|tempat|pos|kantor|rumah|sekolah|kampus|pasar|minimarket|toko|pabrik|industri|hutan|gunung|laut|pantai|pulau|desa|kota|negara|dunia|bumi|langit|angkasa|ruang)\b/i.test(str);
      const when = /\b(kapan|hari|tanggal|pukul|waktu|senin|selasa|rabu|kamis|jumat|sabtu|minggu|kemarin|besok|lusa|tadi|nanti|sekarang|dulu|lampau|masa|tahun|bulan|minggu|jam|menit|detik|pagi|siang|sore|malam|subuh|fajar|senja|terbenam|terbit|mekar|panen|lebaran|natal|puasa|ramadhan|idul fitri|idul adha|agustus|juli|juni|mei|april|maret|februari|januari|2021|2020|2019|2018|2017|2016|2015|2014|2013|2012|2011|2010)\b/i.test(str);
      const why = /\b(mengapa|kenapa|karena|sebab|akibat|alasan|lantaran|gara-gara|demi|untuk|supaya|agar|maka|sehingga|akibatnya|dampaknya|hasilnya|penyebab|pemicu|faktor|konteks|latar belakang|tujuan|maksud)\b/i.test(str);
      const how = /\b(bagaimana|dengan|cara|melalui|proses|langkah|metode|teknik|sistem|mekanisme|prosedur|tahap|fase|periode|era|rezim|zaman|abad|generasi|sejarah)\b/i.test(str);

      return {
        who, what, where, when, why, how,
        isComplete: who && what && where && when && why && how
      };
    };

    const analysis5W1H = check5W1H(text);

    const trainingData = db.prepare("SELECT title, label FROM training_data").all() as any[];

    // Enhanced Tokenizer & Preprocessing
    const stopwords = new Set(['dan', 'di', 'ke', 'dari', 'untuk', 'pada', 'ini', 'itu', 'juga', 'dengan', 'adalah', 'yang', 'ada', 'akan', 'oleh', 'saat', 'setelah', 'sebagai', 'dalam', 'tersebut']);
    
    const preprocess = (str: string) => {
      const clean = str.toLowerCase().replace(/[^\w\s]/g, ' ');
      const tokens = clean.split(/\s+/).filter(w => w.length > 1 && !stopwords.has(w));
      
      // Generate Bigrams
      const bigrams: string[] = [];
      for (let i = 0; i < tokens.length - 1; i++) {
        bigrams.push(`${tokens[i]}_${tokens[i+1]}`);
      }
      return [...tokens, ...bigrams];
    };

    const detectSensationalism = (str: string) => {
      const capsCount = (str.match(/[A-Z]/g) || []).length;
      const totalChars = str.length;
      const capsRatio = capsCount / totalChars;
      
      const punctCount = (str.match(/[!?]{2,}/g) || []).length;
      const clickbaitRegex = /\b(viral|sebarkan|tolong|waspada|bahaya|darurat|penting|rahasia|terbongkar|akhirnya|geger|gempar|heboh)\b/gi;
      const foundClickbait = Array.from(new Set(str.match(clickbaitRegex) || [])).map(w => w.toLowerCase());
      const hasClickbait = foundClickbait.length > 0;
      
      return {
        isHighCaps: capsRatio > 0.3,
        isHighPunct: punctCount > 0,
        hasClickbait,
        foundClickbait,
        score: (capsRatio > 0.3 ? 1 : 0) + (punctCount > 0 ? 1 : 0) + (hasClickbait ? 1 : 0)
      };
    };

    const sensationalism = detectSensationalism(text);
    const words = preprocess(text);
    
    const hoaxDocs = trainingData.filter(d => d.label === 'hoax');
    const validDocs = trainingData.filter(d => d.label === 'valid');
    
    const totalDocs = trainingData.length;
    const pHoax = hoaxDocs.length / totalDocs;
    const pValid = validDocs.length / totalDocs;
    
    const hoaxWordCounts: Record<string, number> = {};
    const validWordCounts: Record<string, number> = {};
    const vocabulary = new Set<string>();
    
    let hoaxTotalWords = 0;
    hoaxDocs.forEach(doc => {
      preprocess(doc.title).forEach(word => {
        hoaxWordCounts[word] = (hoaxWordCounts[word] || 0) + 1;
        vocabulary.add(word);
        hoaxTotalWords++;
      });
    });
    
    let validTotalWords = 0;
    validDocs.forEach(doc => {
      preprocess(doc.title).forEach(word => {
        validWordCounts[word] = (validWordCounts[word] || 0) + 1;
        vocabulary.add(word);
        validTotalWords++;
      });
    });
    
    const vocabSize = vocabulary.size;
    
    // Calculate probabilities with Laplace Smoothing
    let logProbHoax = Math.log(pHoax);
    let logProbValid = Math.log(pValid);
    
    const wordAnalysis: any[] = [];

    words.forEach(word => {
      const countHoax = hoaxWordCounts[word] || 0;
      const countValid = validWordCounts[word] || 0;
      
      const pWordHoax = (countHoax + 1) / (hoaxTotalWords + vocabSize);
      const pWordValid = (countValid + 1) / (validTotalWords + vocabSize);
      
      logProbHoax += Math.log(pWordHoax);
      logProbValid += Math.log(pWordValid);

      wordAnalysis.push({
        word,
        hoaxProb: pWordHoax,
        validProb: pWordValid
      });
    });
    
    // Normalize probabilities safely
    const probHoax = Math.exp(logProbHoax);
    const probValid = Math.exp(logProbValid);
    const sum = probHoax + probValid;

    let finalHoaxProb: number;
    let finalValidProb: number;

    if (probHoax === 0 && probValid === 0) {
      finalHoaxProb = 0.5;
      finalValidProb = 0.5;
    } else {
      finalHoaxProb = probHoax / sum;
      finalValidProb = probValid / sum;
    }
    
    // Adjust probability based on Sensationalism
    if (sensationalism.score > 0) {
      const penalty = sensationalism.score * 0.15;
      finalHoaxProb += penalty;
      finalValidProb -= penalty;
    }

    // CLAMPING: Ensure no 0% or 100% (Min 1%, Max 99%)
    const minProb = 0.01;
    const maxProb = 0.99;

    if (finalHoaxProb < minProb) {
      finalHoaxProb = minProb;
      finalValidProb = 1 - minProb;
    } else if (finalHoaxProb > maxProb) {
      finalHoaxProb = maxProb;
      finalValidProb = 1 - maxProb;
    }

    let resultLabel: 'valid' | 'hoax' = finalHoaxProb > finalValidProb ? 'hoax' : 'valid';

    // OVERRIDE: If 5W+1H is not complete, it MUST be hoax
    let overrideReason = "";
    if (!analysis5W1H.isComplete) {
      resultLabel = 'hoax';
      overrideReason = "Berita dikategorikan Hoax karena tidak memenuhi standar kelengkapan jurnalistik (5W+1H).";
    } else if (sensationalism.score >= 2 && resultLabel === 'valid') {
      resultLabel = 'hoax';
      overrideReason = "Meskipun struktur lengkap, berita dideteksi mengandung unsur sensasionalisme berlebih (Clickbait/Caps berlebih) yang merupakan ciri khas Hoax.";
    } else if (resultLabel === 'hoax' && analysis5W1H.isComplete) {
      overrideReason = "Meskipun struktur berita lengkap (5W+1H), analisis pola kata dan bigram menunjukkan indikasi kuat bahwa informasi ini adalah Hoax.";
    }

    // User request: If valid, set hoax to 0%. If hoax, set valid to 0%.
    // The winner keeps its calculated probability (confidence).
    if (resultLabel === 'valid') {
      finalHoaxProb = 0;
    } else {
      finalValidProb = 0;
    }

    res.json({
      label: resultLabel,
      hoaxProb: finalHoaxProb,
      validProb: finalValidProb,
      analysis: wordAnalysis,
      priors: { hoax: pHoax, valid: pValid },
      counts: { hoax: hoaxDocs.length, valid: validDocs.length, total: totalDocs },
      analysis5W1H,
      sensationalism,
      overrideReason
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
