import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  Cpu,
  Gauge,
  Globe2,
  Headphones,
  Map,
  MapPinned,
  MessageSquare,
  MonitorSmartphone,
  Plug,
  Route,
  Server,
  Settings,
  ShieldCheck,
  Smartphone,
  Target,
  TrendingDown,
  Truck,
  Users,
  Workflow,
  Zap,
} from "lucide-react";

import "./About.css";

import logo from "../../assets/abn-logo.png";

/* =========================================================
   ABOUT
   ABN FLEET MANAGEMENT SYSTEM
   PRODUCT OVERVIEW
   ========================================================= */

function About() {
  const version = "1.0.0";

  return (
    <div className="about-page">
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="about-hero">
        <div className="about-hero-content">
          <div className="about-brand">
            <div className="about-brand-mark">
              <img src={logo} alt="ABN Fleet System Logo" />
            </div>

            <div>
              <span className="about-eyebrow">TIGA KAWAN JAYA</span>

              <h1>ABN Fleet System</h1>

              <p>Fleet Management Platform</p>
            </div>
          </div>

          <div className="about-status">
            <span className="about-status-dot" />

            <strong>ONLINE</strong>

            <span>Version {version}</span>
          </div>
        </div>

        <div className="about-hero-description">
          <h2>
            One Platform.
            <br />
            Complete Fleet Visibility.
          </h2>

          <p>
            ABN Fleet System adalah platform manajemen armada yang dirancang
            untuk membantu perusahaan memonitor, mengelola, dan mengembangkan
            operasional kendaraan secara terpusat melalui satu sistem yang
            ringan, cepat, responsive, dan siap dikembangkan.
          </p>
        </div>

        {/* ===================================================
            HERO TRUST POINTS
            =================================================== */}

        <div className="about-hero-points">
          <span>
            <CheckCircle2 size={16} />
            Live Fleet Monitoring
          </span>

          <span>
            <CheckCircle2 size={16} />
            GPS & Device Ready
          </span>

          <span>
            <CheckCircle2 size={16} />
            Enterprise Integration Ready
          </span>
        </div>
      </section>

      {/* =====================================================
          PRODUCT OVERVIEW
          ===================================================== */}

      <section className="about-section">
        <div className="about-section-heading">
          <span>01</span>

          <div>
            <h2>ABN Fleet System</h2>

            <p>Platform digital untuk pengelolaan armada modern.</p>
          </div>
        </div>

        <div className="about-overview">
          <div className="about-overview-main">
            <p>
              ABN Fleet System merupakan solusi Fleet Management yang
              mengintegrasikan kendaraan, GPS tracker, driver, perjalanan,
              geofence, alert, histori, reporting, perangkat, dan pengguna dalam
              satu platform.
            </p>

            <p>
              Dengan sistem terpusat, perusahaan dapat memperoleh gambaran
              kondisi armada secara lebih cepat sehingga keputusan operasional
              dapat dilakukan berdasarkan data yang tersedia secara realtime
              maupun histori.
            </p>

            <p>
              ABN Fleet dibangun dengan konsep modular sehingga dapat digunakan
              oleh perusahaan dengan jumlah kendaraan yang relatif kecil maupun
              perusahaan yang memiliki armada besar dan membutuhkan pengembangan
              sistem secara bertahap.
            </p>
          </div>

          <div className="about-overview-highlight">
            <Zap size={25} />

            <strong>Lightweight Fleet Platform</strong>

            <span>
              Cepat, ringan, responsive, modular, dan siap dikembangkan
              mengikuti kebutuhan bisnis.
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          BUSINESS VALUE
          ===================================================== */}

      <section className="about-section">
        <div className="about-section-heading">
          <span>02</span>

          <div>
            <h2>Business Value</h2>

            <p>
              ABN Fleet membantu perusahaan mendapatkan kontrol yang lebih baik
              terhadap operasional armada.
            </p>
          </div>
        </div>

        <div className="about-value-grid">
          <Value
            title="Fleet Visibility"
            text="Perusahaan dapat melihat kondisi dan posisi armada melalui satu dashboard terpusat."
          />

          <Value
            title="Operational Control"
            text="Aktivitas kendaraan, perjalanan, driver, dan perangkat dapat dikelola dalam satu sistem."
          />

          <Value
            title="Data Driven"
            text="Histori perjalanan, alert, dan laporan dapat digunakan sebagai dasar evaluasi operasional."
          />

          <Value
            title="Centralized Management"
            text="Informasi fleet tidak lagi tersebar pada berbagai sistem atau aplikasi yang berbeda."
          />

          <Value
            title="Scalable"
            text="Sistem dapat dikembangkan mengikuti pertumbuhan jumlah kendaraan dan kebutuhan perusahaan."
          />

          <Value
            title="Cost Efficient"
            text="Arsitektur ringan membantu perusahaan mendapatkan sistem monitoring tanpa infrastruktur yang berlebihan."
          />
        </div>
      </section>

      {/* =====================================================
          CORE FEATURES
          ===================================================== */}

      <section className="about-section">
        <div className="about-section-heading">
          <span>03</span>

          <div>
            <h2>Fleet Management Modules</h2>

            <p>Modul utama yang membentuk ABN Fleet System.</p>
          </div>
        </div>

        <div className="about-feature-grid">
          <Feature
            icon={<Truck />}
            title="Fleet Management"
            description="Kelola kendaraan, identitas unit, status armada, dan informasi operasional secara terpusat."
          />

          <Feature
            icon={<MapPinned />}
            title="Live Tracking"
            description="Pantau posisi kendaraan secara realtime melalui GPS tracker yang terhubung dengan sistem."
          />

          <Feature
            icon={<Route />}
            title="Trips & Routes"
            description="Monitor perjalanan kendaraan, rute, aktivitas perjalanan, dan histori operasional."
          />

          <Feature
            icon={<Map />}
            title="Geofence"
            description="Buat area virtual untuk memonitor kendaraan ketika masuk atau keluar dari wilayah tertentu."
          />

          <Feature
            icon={<AlertTriangle />}
            title="Fleet Alerts"
            description="Kelola kejadian dan peringatan operasional yang membutuhkan perhatian pengguna."
          />

          <Feature
            icon={<Activity />}
            title="Vehicle History"
            description="Lihat histori posisi dan aktivitas kendaraan untuk kebutuhan monitoring dan evaluasi."
          />

          <Feature
            icon={<BarChart3 />}
            title="Reports"
            description="Gunakan data fleet untuk menghasilkan laporan operasional dan analisis."
          />

          <Feature
            icon={<Users />}
            title="Driver Management"
            description="Kelola driver dan hubungan driver dengan kendaraan yang digunakan."
          />

          <Feature
            icon={<Cpu />}
            title="Device Management"
            description="Kelola GPS tracker dan perangkat monitoring yang terpasang pada kendaraan."
          />

          <Feature
            icon={<MessageSquare />}
            title="Helpdesk"
            description="Sediakan jalur support untuk menangani masalah sistem, kendaraan, GPS, dan perangkat."
          />

          <Feature
            icon={<ShieldCheck />}
            title="Administration"
            description="Role-based access control membantu membatasi akses berdasarkan tanggung jawab pengguna."
          />

          <Feature
            icon={<Globe2 />}
            title="Integration Ready"
            description="Arsitektur disiapkan untuk integrasi dengan sistem eksternal maupun enterprise."
          />
        </div>
      </section>

      {/* =====================================================
          ARCHITECTURE
          ===================================================== */}

      <section className="about-section">
        <div className="about-section-heading">
          <span>04</span>

          <div>
            <h2>System Architecture</h2>

            <p>Arsitektur modular untuk kebutuhan fleet modern.</p>
          </div>
        </div>

        <div className="about-architecture">
          <ArchitectureCard
            icon={<MonitorSmartphone />}
            title="Client Application"
            items={[
              "Responsive Web Interface",
              "Fleet Dashboard",
              "Live Tracking",
              "Fleet Monitoring",
              "Administrative Interface",
            ]}
          />

          <div className="about-architecture-arrow">
            <Route size={20} />
          </div>

          <ArchitectureCard
            icon={<Server />}
            title="ABN Fleet Server"
            items={[
              "Authentication",
              "Fleet Data",
              "GPS Processing",
              "Realtime Communication",
              "Business Logic",
              "Access Control",
              "Integration Layer",
            ]}
          />

          <div className="about-architecture-arrow">
            <Route size={20} />
          </div>

          <ArchitectureCard
            icon={<Cpu />}
            title="Tracker & Devices"
            items={[
              "GPS Position",
              "Vehicle Data",
              "Device Status",
              "Realtime Telemetry",
              "Communication",
            ]}
          />
        </div>
      </section>

      {/* =====================================================
          TRACKER ECOSYSTEM
          ===================================================== */}

      <section className="about-section">
        <div className="about-section-heading">
          <span>05</span>

          <div>
            <h2>Fleet Tracker Ecosystem</h2>

            <p>
              ABN Fleet dapat menjadi pusat monitoring untuk perangkat tracker
              yang terpasang pada kendaraan.
            </p>
          </div>
        </div>

        <div className="about-security-grid">
          <SecurityItem
            icon={<Cpu />}
            title="GPS Tracker"
            text="Perangkat tracker mengirimkan informasi posisi kendaraan ke ABN Fleet System."
          />

          <SecurityItem
            icon={<MapPinned />}
            title="Realtime Position"
            text="Data posisi dapat digunakan untuk monitoring kendaraan secara realtime."
          />

          <SecurityItem
            icon={<Activity />}
            title="Vehicle Telemetry"
            text="Arsitektur dapat dikembangkan untuk menerima data tambahan dari perangkat kendaraan."
          />
        </div>
      </section>

      {/* =====================================================
          ENTERPRISE INTEGRATION
          ===================================================== */}

      <section className="about-section">
        <div className="about-section-heading">
          <span>06</span>

          <div>
            <h2>Enterprise Integration</h2>

            <p>
              ABN Fleet dapat menjadi bagian dari ekosistem sistem informasi
              perusahaan yang sudah berjalan.
            </p>
          </div>
        </div>

        <div className="about-security-grid">
          <SecurityItem
            icon={<Server />}
            title="Existing System"
            text="ABN Fleet dapat dikembangkan untuk berkomunikasi dengan sistem yang telah digunakan perusahaan."
          />

          <SecurityItem
            icon={<Globe2 />}
            title="SAP Integration Ready"
            text="Arsitektur disiapkan untuk integrasi dengan SAP maupun platform enterprise lainnya melalui API atau integration layer."
          />

          <SecurityItem
            icon={<Route />}
            title="Data Synchronization"
            text="Data kendaraan, driver, operasional, dan informasi pendukung dapat disinkronkan sesuai kebutuhan integrasi."
          />
        </div>
      </section>

      {/* =====================================================
          SECURITY
          ===================================================== */}

      <section className="about-section">
        <div className="about-section-heading">
          <span>07</span>

          <div>
            <h2>Security & Access Control</h2>

            <p>
              Sistem dirancang dengan kontrol akses berdasarkan kebutuhan dan
              tanggung jawab pengguna.
            </p>
          </div>
        </div>

        <div className="about-security-grid">
          <SecurityItem
            icon={<ShieldCheck />}
            title="Authentication"
            text="Pengguna harus melalui proses autentikasi sebelum mengakses sistem."
          />

          <SecurityItem
            icon={<Users />}
            title="Role Based Access"
            text="Akses menu dan fitur dapat disesuaikan dengan role pengguna."
          />

          <SecurityItem
            icon={<Gauge />}
            title="Controlled Operations"
            text="Operasi fleet dapat dipisahkan berdasarkan tanggung jawab dan kewenangan."
          />
        </div>
      </section>

      {/* =====================================================
          RESPONSIVE
          ===================================================== */}

      <section className="about-section">
        <div className="about-responsive-card">
          <div className="about-responsive-icon">
            <Smartphone size={28} />
          </div>

          <div>
            <span className="about-card-label">
              DESIGNED FOR MODERN OPERATIONS
            </span>

            <h2>
              Ringan di desktop.
              <br />
              Tetap nyaman di mobile.
            </h2>

            <p>
              ABN Fleet dirancang dengan responsive interface sehingga sistem
              dapat digunakan pada desktop, laptop, tablet, maupun smartphone.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY ABN FLEET
          ===================================================== */}

      <section className="about-section">
        <div className="about-section-heading">
          <span>08</span>

          <div>
            <h2>Why ABN Fleet?</h2>

            <p>
              Dibangun sebagai platform fleet yang praktis, modern, dan siap
              dikembangkan.
            </p>
          </div>
        </div>

        <div className="about-value-grid">
          <Value
            title="Simple"
            text="Interface dibuat sederhana agar pengguna dapat memahami sistem dengan cepat."
          />

          <Value
            title="Fast"
            text="Arsitektur dirancang agar dashboard tetap responsif ketika digunakan dalam aktivitas operasional."
          />

          <Value
            title="Lightweight"
            text="ABN Fleet mengutamakan efisiensi sehingga sistem tetap nyaman digunakan tanpa antarmuka yang berlebihan."
          />

          <Value
            title="Modular"
            text="Fleet, tracking, device, driver, reporting, helpdesk, dan integration dapat dikembangkan secara independen."
          />

          <Value
            title="Scalable"
            text="Sistem dapat mengikuti pertumbuhan jumlah kendaraan dan kebutuhan organisasi."
          />

          <Value
            title="Integration Ready"
            text="ABN Fleet dapat dikembangkan untuk terhubung dengan perangkat maupun sistem enterprise lainnya."
          />
        </div>
      </section>

      {/* =====================================================
          OPERATIONAL IMPACT
          ===================================================== */}

      <section className="about-section">
        <div className="about-section-heading">
          <span>09</span>

          <div>
            <h2>Operational Impact</h2>

            <p>
              Fokus ABN Fleet bukan hanya menampilkan GPS, tetapi membantu
              perusahaan meningkatkan kontrol operasional.
            </p>
          </div>
        </div>

        <div className="about-value-grid">
          <Value
            title="Reduce Blind Spots"
            text="Memberikan visibilitas terhadap posisi, perjalanan, dan aktivitas kendaraan yang sebelumnya sulit dipantau."
          />

          <Value
            title="Faster Response"
            text="Informasi realtime dan alert membantu tim operasional merespons kejadian lebih cepat."
          />

          <Value
            title="Better Utilization"
            text="Data kendaraan dan histori perjalanan dapat digunakan untuk mengevaluasi pemanfaatan armada."
          />

          <Value
            title="Operational Transparency"
            text="Aktivitas fleet terdokumentasi sehingga proses monitoring dan evaluasi menjadi lebih terukur."
          />

          <Value
            title="Maintenance Visibility"
            text="Data kendaraan dan perangkat dapat menjadi dasar pengembangan monitoring maintenance dan kondisi unit."
          />

          <Value
            title="Management Insight"
            text="Dashboard dan reporting membantu manajemen memperoleh gambaran operasional tanpa harus mengumpulkan data secara manual."
          />
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
          ===================================================== */}

      <section className="about-section">
        <div className="about-section-heading">
          <span>10</span>

          <div>
            <h2>How ABN Fleet Works</h2>

            <p>
              Alur sederhana dari kendaraan sampai informasi yang diterima
              pengguna.
            </p>
          </div>
        </div>

        <div className="about-architecture">
          <ArchitectureCard
            icon={<Truck />}
            title="1. Vehicle"
            items={[
              "Vehicle Unit",
              "GPS Tracker",
              "Optional Sensors",
              "Device Power",
            ]}
          />

          <div className="about-architecture-arrow">
            <Route size={20} />
          </div>

          <ArchitectureCard
            icon={<Globe2 />}
            title="2. Connectivity"
            items={[
              "GPS Data",
              "Mobile Network",
              "Device Communication",
              "Realtime Transmission",
            ]}
          />

          <div className="about-architecture-arrow">
            <Route size={20} />
          </div>

          <ArchitectureCard
            icon={<Server />}
            title="3. ABN Fleet"
            items={[
              "Data Processing",
              "GPS Processing",
              "Business Logic",
              "Data Storage",
              "Alert Processing",
            ]}
          />

          <div className="about-architecture-arrow">
            <Route size={20} />
          </div>

          <ArchitectureCard
            icon={<MonitorSmartphone />}
            title="4. Customer"
            items={[
              "Dashboard",
              "Live Tracking",
              "Reports",
              "Alerts",
              "Management Insight",
            ]}
          />
        </div>
      </section>

      {/* =====================================================
          INDUSTRIES
          ===================================================== */}

      <section className="about-section">
        <div className="about-section-heading">
          <span>11</span>

          <div>
            <h2>Built for Different Fleet Operations</h2>

            <p>
              ABN Fleet dapat dikembangkan untuk berbagai kebutuhan operasional
              kendaraan.
            </p>
          </div>
        </div>

        <div className="about-feature-grid">
          <Feature
            icon={<Truck />}
            title="Logistics & Distribution"
            description="Monitoring kendaraan distribusi, perjalanan, rute, dan aktivitas operasional."
          />

          <Feature
            icon={<Building2 />}
            title="Construction"
            description="Monitoring kendaraan dan equipment yang bekerja di berbagai lokasi proyek."
          />

          <Feature
            icon={<Route />}
            title="Transportation"
            description="Monitoring armada transportasi, perjalanan, driver, dan histori kendaraan."
          />

          <Feature
            icon={<Cpu />}
            title="Mining & Industrial"
            description="Arsitektur dapat dikembangkan untuk monitoring kendaraan dan telemetry operasional."
          />

          <Feature
            icon={<MapPinned />}
            title="Field Operations"
            description="Pantau unit yang bekerja di area lapangan dan lokasi operasional yang tersebar."
          />

          <Feature
            icon={<Globe2 />}
            title="Enterprise Fleet"
            description="Dapat dikembangkan menjadi platform fleet terpusat untuk organisasi dengan kebutuhan integrasi."
          />
        </div>
      </section>

      {/* =====================================================
          CUSTOMIZATION
          ===================================================== */}

      <section className="about-section">
        <div className="about-section-heading">
          <span>12</span>

          <div>
            <h2>Flexible Deployment & Customization</h2>

            <p>
              Setiap perusahaan memiliki proses kerja yang berbeda. ABN Fleet
              dirancang agar dapat disesuaikan.
            </p>
          </div>
        </div>

        <div className="about-security-grid">
          <SecurityItem
            icon={<Settings />}
            title="Custom Workflow"
            text="Workflow operasional dapat dikembangkan mengikuti proses bisnis perusahaan."
          />

          <SecurityItem
            icon={<Plug />}
            title="System Integration"
            text="API dan integration layer dapat digunakan untuk menghubungkan ABN Fleet dengan sistem lain."
          />

          <SecurityItem
            icon={<Headphones />}
            title="Support & Development"
            text="Pengembangan sistem dapat dilakukan secara bertahap sesuai kebutuhan dan prioritas bisnis."
          />
        </div>
      </section>

      {/* =====================================================
          CUSTOMER JOURNEY
          ===================================================== */}

      <section className="about-section">
        <div className="about-section-heading">
          <span>13</span>

          <div>
            <h2>From Installation to Fleet Intelligence</h2>

            <p>
              ABN Fleet dapat dikembangkan bersama kebutuhan perusahaan dari
              tahap awal sampai skala enterprise.
            </p>
          </div>
        </div>

        <div className="about-value-grid">
          <Value
            title="01 — Fleet Setup"
            text="Daftarkan perusahaan, kendaraan, driver, user, dan perangkat tracker."
          />

          <Value
            title="02 — Device Installation"
            text="Tracker dipasang pada kendaraan dan dikonfigurasi untuk terhubung ke platform."
          />

          <Value
            title="03 — Live Monitoring"
            text="Tim operasional mulai memonitor posisi dan aktivitas kendaraan melalui dashboard."
          />

          <Value
            title="04 — Data Collection"
            text="Histori perjalanan, alert, device status, dan data operasional mulai terkumpul."
          />

          <Value
            title="05 — Reporting"
            text="Data fleet dapat digunakan untuk reporting, evaluasi, dan analisis operasional."
          />

          <Value
            title="06 — Business Expansion"
            text="Sistem dapat dikembangkan dengan sensor, telemetry, integrasi, dan kebutuhan enterprise."
          />
        </div>
      </section>

      {/* =====================================================
          CUSTOMER EXPERIENCE
          ===================================================== */}

      <section className="about-section">
        <div className="about-section-heading">
          <span>14</span>

          <div>
            <h2>Designed Around Your Operation</h2>

            <p>
              Platform bukan sekadar dashboard GPS. Sistem dibangun untuk
              menjadi bagian dari proses operasional perusahaan.
            </p>
          </div>
        </div>

        <div className="about-responsive-card">
          <div className="about-responsive-icon">
            <Workflow size={28} />
          </div>

          <div>
            <span className="about-card-label">FLEXIBLE FLEET PLATFORM</span>

            <h2>
              Start simple.
              <br />
              Grow with your fleet.
            </h2>

            <p>
              Perusahaan dapat memulai dari kebutuhan dasar seperti fleet
              management dan GPS tracking, kemudian mengembangkan sistem menuju
              reporting, telemetry, integration, automation, dan enterprise
              workflow sesuai kebutuhan bisnis.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT POSITIONING
          ===================================================== */}

      <section className="about-section">
        <div className="about-responsive-card">
          <div className="about-responsive-icon">
            <Target size={28} />
          </div>

          <div>
            <span className="about-card-label">
              ABN FLEET MANAGEMENT PLATFORM
            </span>

            <h2>
              Built for Fleet Operations.
              <br />
              Ready for Business Growth.
            </h2>

            <p>
              ABN Fleet System dikembangkan sebagai platform Fleet Management
              yang dapat digunakan sebagai pusat monitoring dan pengelolaan
              armada perusahaan. Sistem dapat dikembangkan sesuai kebutuhan
              bisnis, jumlah kendaraan, perangkat tracker, pengguna, serta
              integrasi yang dibutuhkan.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CUSTOMER CTA
          ===================================================== */}

      <section className="about-section">
        <div className="about-cta">
          <div className="about-cta-icon">
            <TrendingDown size={30} />
          </div>

          <div className="about-cta-content">
            <span className="about-card-label">
              READY TO MODERNIZE YOUR FLEET?
            </span>

            <h2>
              Turn Fleet Data
              <br />
              Into Operational Control.
            </h2>

            <p>
              Bangun sistem monitoring armada yang sesuai dengan kebutuhan
              perusahaan Anda. Mulai dari GPS tracking hingga platform fleet
              terintegrasi.
            </p>

            <div className="about-cta-points">
              <span>
                <CheckCircle2 size={15} />
                Fleet Monitoring
              </span>

              <span>
                <CheckCircle2 size={15} />
                GPS Tracking
              </span>

              <span>
                <CheckCircle2 size={15} />
                Reporting
              </span>

              <span>
                <CheckCircle2 size={15} />
                Integration
              </span>
            </div>

            <div className="about-cta-note">
              <Clock3 size={15} />

              <span>
                Deployment dan pengembangan dapat disesuaikan dengan kebutuhan
                perusahaan.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   FEATURE
   ========================================================= */

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <article className="about-feature-card">
      <div className="about-feature-icon">{icon}</div>

      <div>
        <h3>{title}</h3>

        <p>{description}</p>
      </div>
    </article>
  );
}

/* =========================================================
   ARCHITECTURE CARD
   ========================================================= */

interface ArchitectureCardProps {
  icon: React.ReactNode;
  title: string;
  items: string[];
}

function ArchitectureCard({ icon, title, items }: ArchitectureCardProps) {
  return (
    <div className="about-architecture-card">
      <div className="about-architecture-icon">{icon}</div>

      <h3>{title}</h3>

      <div className="about-architecture-items">
        {items.map((item) => (
          <span key={item}>
            <CheckCircle2 size={13} />

            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   SECURITY ITEM
   ========================================================= */

interface SecurityItemProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

function SecurityItem({ icon, title, text }: SecurityItemProps) {
  return (
    <article className="about-security-card">
      <div className="about-security-icon">{icon}</div>

      <h3>{title}</h3>

      <p>{text}</p>
    </article>
  );
}

/* =========================================================
   VALUE
   ========================================================= */

interface ValueProps {
  title: string;
  text: string;
}

function Value({ title, text }: ValueProps) {
  return (
    <article className="about-value-card">
      <span className="about-value-dot" />

      <h3>{title}</h3>

      <p>{text}</p>
    </article>
  );
}

export default About;
