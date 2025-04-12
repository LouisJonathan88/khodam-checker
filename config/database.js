require('dotenv').config(); // Menggunakan dotenv untuk memuat variabel dari file .env
const mysql = require('mysql');

//buat konfigurasi koneksi
const koneksi = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,  // Menambahkan port, default ke 3306
    multipleStatements: true
});

//koneksi database
koneksi.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

module.exports = koneksi;
