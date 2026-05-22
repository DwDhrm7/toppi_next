"use client";
import Image from "next/image";const styles = {
  layout: "min-h-screen bg-[#F4F7F9] flex flex-col font-sans",
  appBar: "bg-orange-600 text-white px-6 py-4 flex justify-between items-center shadow-sm",
  logo: "h-8",
  appBarActions: "flex items-center",
  logoutBtn: "bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors",
  content: "flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10",
  dataSection: "flex flex-col gap-6",
  dataTable: "bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden",
  tableHeader: "p-6 border-b border-gray-100 bg-white",
  tableTitle: "text-xl font-bold text-gray-900 mb-1",
  tableSubtitle: "text-sm text-gray-500 font-medium",
  tableContent: "p-12 text-center text-gray-400 font-medium"
};

export default function LogToppiScreen() {
  return (
    <div className={styles.layout}>
      <header className={styles.appBar}>
        <Image
          src="/assets/icon/toppi-white.png"
          alt="TOPPI Logo"
          width={100}
          height={32}
          className={styles.logo}
        />
        <div className={styles.appBarActions}>
          <button className={styles.logoutBtn} onClick={() => window.location.href='/login'}>
            Keluar
          </button>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.dataSection}>
          <div className={styles.dataTable} style={{ flex: 1 }}>
            <div className={styles.tableHeader}>
              <div>
                <h3 className={styles.tableTitle}>Log TOPPI</h3>
                <p className={styles.tableSubtitle}>Log aktivitas perangkat Toppi</p>
              </div>
            </div>
            <div className={styles.tableContent} style={{ padding: 20, textAlign: 'center', color: '#888' }}>
              Memuat log...
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
