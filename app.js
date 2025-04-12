const express = require("express");
const bodyParser = require("body-parser");
const koneksi = require("./config/database");
const app = express();
const PORT = process.env.PORT || 5000;

//set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//create data/insert data
app.post("/membuat/khodam", (req, res) => {
  //buat variabel penamupung data dan query sql
  const data = { ...req.body };
  const querySql = "INSERT INTO khodam SET?";

  // jalankan query
  koneksi.query(querySql, data, (err, rows, field) => {
    //error handiling
    if (err) {
      return res
        .status(500)
        .json({ message: "Gagal insert data!", error: err });
    }

    //jika request berhasil
    res.status(201).json({ success: true, message: "Berhasil insert data!" });
  });
});
//end create data

//read data/get data
app.get("/cek/khodam", (req, res) => {
  //buat query sql
  const querySql = "SELECT * FROM khodam";

  //jalankan query
  koneksi.query(querySql, (err, rows, field) => {
    //error handling
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }
    //jalankan request berhasil
    res.status(200).json({ success: true, data: rows });
  });
});

//Fungsi untuk menentukan waktu aktif berdasarkan ID
function determineWaktuAktif(id) {
  const waktuAktif = [
    'Aktif saat siang',
    'Aktif saat hujan',
    'Aktif saat pagi',
    'Aktif saat malam',
  ];
  
  return waktuAktif[(id - 1) % waktuAktif.length];
}
//Fungsi untuk menentukan kekuatan khodam berdasarkan ID
function determineKekuatan(id){
  const kekuatan = [
    'Sangat Kuat',
    'Kuat',
    'sedang',
    'Lemah',
    ];
    return kekuatan[(id - 1) % kekuatan.length];
}

//read data/get data dengan nama
app.get("/cek/khodam/name=:nama", (req, res) => {
  const nama = req.params.nama;

  // Validasi nama hanya boleh berisi huruf dan spasi
  const namaRegex = /^[a-zA-Z\s]+$/;
  if (!nama) {
      return res.status(400).json({
          success: false,
          message: "Nama harus diisi untuk mendapatkan nama khodam",
      });
  }

  if (!namaRegex.test(nama)) {
      return res.status(400).json({
          success: false,
          message: "Nama hanya boleh berisi huruf dan spasi",
      });
  }

  // Hitung jumlah ASCII dari nama
  const asciiSum = nama
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  // Ambil jumlah total data dalam tabel khodam
  koneksi.query("SELECT COUNT(*) AS count FROM khodam", (err, result) => {
      if (err) {
          return res.status(500).json({ message: "Ada kesalahan", error: err });
      }
      const totalData = result[0].count;
      if (totalData === 0) {
          return res
              .status(404)
              .json({ message: "Data tidak ditemukan!", success: false });
      }

      // Dapatkan indeks berdasarkan modulus
      const id = (asciiSum % totalData) + 1;

      // Query data berdasarkan id
      koneksi.query("SELECT * FROM khodam WHERE id = ?", [id], (err, rows) => {
          if (err) {
              return res
                  .status(500)
                  .json({ message: "Ada kesalahan", error: err });
          }
          if (rows.length > 0) {
              // Tentukan waktu aktif khodam berdasarkan ID
              const waktuAktif = determineWaktuAktif(id);
              const kekuatanKhodam = determineKekuatan(id);

              // Tambahkan waktu aktif ke dalam data
              const khodamData = rows.map(row => ({
                  Id: row.id,
                  namaKhodam: row.namakhodam,
                  waktuAktif: waktuAktif,
                  kekuatanKhodam: kekuatanKhodam
              }));

              res.status(200).json({
                  success: true,
                  message: `Nama khodam yang cocok untuk ${nama}`,
                  data: khodamData
              });
          } else {
              res
                  .status(404)
                  .json({ message: "Data tidak ditemukan!", success: false });
          }
      });
  });
});
//end read data

//update data
app.put("/update/khodam/:id", (req, res) => {
  //buat variable penampung data dan query sql
  const data = { ...req.body };
  const querySearch = "SELECT * FROM khodam WHERE id=?";
  const queryUpdate = "UPDATE khodam SET ? WHERE id=?";

  //jalankan query untuk melakukan pencarian data
  koneksi.query(querySearch, req.params.id, (err, rows, field) => {
    //error handling
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }
    //jika id yang dimasukkan sesuai dengan data yang ada di db
    if (rows.length) {
      //jalankan query update
      koneksi.query(queryUpdate, [data, req.params.id], (err, rows, field) => {
        // error handling
        if (err) {
          return res.status(500).json({ message: "Ada kesalahan", error: err });
        }
        //jika update berhasil
        res
          .status(200)
          .json({ success: true, message: "Berhasil update data!" });
      });
    } else {
      return res
        .status(404)
        .json({ message: "Data tidak ditemukan!", success: false });
    }
  });
});
//end update data

//delete data
app.delete("/delete/khodam/:id", (req, res) => {
  // buat query sql untuk mencari data dan hapus
  const querySearch = "SELECT * FROM khodam WHERE id=?";
  const queryDelete = "DELETE FROM khodam WHERE id=?";

  //jalankan query untuk melakukan pencarian data
  koneksi.query(querySearch, req.params.id, (err, rows, field) => {
    //error handling
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }
    //jika id yang dimasukkan sesuai dengan data yang ada di db
    if (rows.length) {
      //jalankan query delete
      koneksi.query(queryDelete, req.params.id, (err, rows, field) => {
        // error handling
        if (err) {
          return res.status(500).json({ message: "Ada kesalahan", error: err });
        }
        //jika delete berhasil
        res
          .status(200)
          .json({ success: true, message: "Berhasil delete data!" });
      });
    } else {
      return res
        .status(404)
        .json({ message: "Data tidak ditemukan!", success: false });
    }
  });
});
//end delete data

//buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));